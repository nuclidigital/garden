#!/usr/bin/env bash

set -Eeuo pipefail

# Este script es no interactivo: Git no debe abrir less ni otro paginador.
export GIT_PAGER=cat
export PAGER=cat

# La implementación canónica vive en `garden/scripts`; la raíz compartida
# contiene tanto el repositorio `garden` como `GardenVault`.
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
REPO_DIR="$ROOT_DIR/garden"
VAULT_DIR="$ROOT_DIR/GardenVault"
CONTENT_DIR="$REPO_DIR/content"
DEV_DOCS_DIR="$ROOT_DIR/.dev"
REPO_DEV_DOCS_DIR="$REPO_DIR/.dev"
TOKEN_FILE="${GARDEN_GITHUB_TOKEN_FILE:-$ROOT_DIR/.github-token}"

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || fail "git no está instalado."
command -v rsync >/dev/null 2>&1 || fail "rsync no está instalado."
command -v npm >/dev/null 2>&1 || fail "npm no está instalado."

[ -d "$REPO_DIR/.git" ] || fail "No encuentro el repositorio Quartz en $REPO_DIR."
[ -d "$VAULT_DIR" ] || fail "No encuentro el vault de Obsidian en $VAULT_DIR."

cd "$REPO_DIR"

BRANCH="$(git branch --show-current)"
[ -n "$BRANCH" ] || fail "El repositorio no tiene una rama activa."

printf 'Sincronizando GardenVault -> garden/content...\n'

# GitHub Actions no puede seguir un enlace absoluto que solo existe en este equipo.
if [ -L "$CONTENT_DIR" ]; then
  rm -- "$CONTENT_DIR"
elif [ -e "$CONTENT_DIR" ] && [ ! -d "$CONTENT_DIR" ]; then
  fail "$CONTENT_DIR existe pero no es una carpeta ni un enlace simbólico."
fi

mkdir -p "$CONTENT_DIR"
rsync -a --delete \
  --exclude='.obsidian/' \
  --exclude='private/' \
  --exclude='*:Zone.Identifier' \
  "$VAULT_DIR/" "$CONTENT_DIR/"

# `.dev` documenta las extensiones locales del core. Se versiona junto a la
# implementación, pero queda fuera de `content`, por lo que Quartz no la expone
# como páginas del jardín.
if [ -d "$DEV_DOCS_DIR" ]; then
  printf 'Sincronizando documentación técnica .dev...\n'
  mkdir -p "$REPO_DEV_DOCS_DIR"
  rsync -a --delete "$DEV_DOCS_DIR/" "$REPO_DEV_DOCS_DIR/"
fi

printf 'Instalando dependencias y construyendo Quartz...\n'
npm ci
node scripts/audit-theme-contrast.mjs
node quartz/bootstrap-cli.mjs build
printf 'Ejecutando regresión funcional y responsive...\n'
npm run test:e2e

printf 'Preparando cambios para publicar...\n'
# Primero incluye cualquier cambio, renombre o borrado de archivos que ya están
# versionados. Así una customización previa del core nunca queda fuera porque su
# ruta no aparezca en una lista de archivos individuales.
git --no-pager add -u -- .

# Después admite archivos nuevos únicamente dentro de las raíces fuente que
# forman el proyecto publicable. `quartz` se incluye completo: componentes,
# estilos, scripts, emitters, loaders, utilidades, tests y futuras extensiones.
PUBLISH_ROOTS=(
  .dev
  .github
  content
  docs
  quartz
  scripts
  tests
)

for publish_root in "${PUBLISH_ROOTS[@]}"; do
  if [ -e "$publish_root" ]; then
    git --no-pager add -A -- "$publish_root"
  fi
done

# Configuración y metadatos raíz que gobiernan build, dependencias y hosting.
git --no-pager add -- \
  .gitattributes \
  .gitignore \
  .node-version \
  .npmrc \
  .prettierignore \
  .prettierrc \
  CNAME \
  CODE_OF_CONDUCT.md \
  Dockerfile \
  LICENSE.txt \
  MIGRATION_DISCOVERY.md \
  MIGRATION_REPORT.md \
  README.md \
  globals.d.ts \
  index.d.ts \
  package.json \
  package-lock.json \
  playwright.config.ts \
  quartz.config.default.yaml \
  quartz.config.yaml \
  quartz.lock.json \
  quartz.ts \
  tsconfig.json

# Esta lista es una allowlist: lo que no aparece en ella no se publica y el sitio
# desplegado acaba divergiendo del local sin avisar. Aborta si queda algo fuera.
UNPUBLISHED="$(git --no-pager status --porcelain | awk '/^\?\?/ || substr($0, 2, 1) != " "')"
if [ -n "$UNPUBLISHED" ]; then
  printf 'Estos cambios quedan fuera del «git add» de este script:\n\n%s\n\n' "$UNPUBLISHED" >&2
  if [ "${GARDEN_ALLOW_UNPUBLISHED:-0}" = "1" ]; then
    printf 'GARDEN_ALLOW_UNPUBLISHED=1: continuando sin ellos.\n\n' >&2
  else
    fail "añade sus rutas a la lista de arriba, o repite con GARDEN_ALLOW_UNPUBLISHED=1 para publicar sin ellos."
  fi
fi

if git --no-pager diff --cached --quiet; then
  printf 'No hay cambios de contenido que publicar.\n'
else
  git --no-pager diff --cached --check
  printf 'Creando commit de contenido...\n'
  git commit -m "Update garden content"
fi

printf 'Publicando %s en origin...\n' "$BRANCH"

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"

if [[ "$REMOTE_URL" == https://* && -f "$TOKEN_FILE" ]]; then
  TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")"
  [ -n "$TOKEN" ] || fail "$TOKEN_FILE está vacío."

  ASKPASS_SCRIPT="$(mktemp)"
  cleanup() {
    rm -f -- "$ASKPASS_SCRIPT"
  }
  trap cleanup EXIT

  umask 077
  printf '%s\n' \
    '#!/bin/sh' \
    'case "$1" in' \
    '  *Username*) printf "%s\\n" "x-access-token" ;;' \
    '  *) printf "%s\\n" "$GARDEN_GIT_PASSWORD" ;;' \
    'esac' > "$ASKPASS_SCRIPT"
  chmod 700 "$ASKPASS_SCRIPT"

  GARDEN_GIT_PASSWORD="$TOKEN" \
    GIT_ASKPASS="$ASKPASS_SCRIPT" \
    GIT_TERMINAL_PROMPT=0 \
    git --no-pager -c credential.helper= push origin "$BRANCH"
else
  git --no-pager push origin "$BRANCH"
fi

printf '\nPublicado. GitHub Actions construirá y desplegará garden.nuclidigital.com.\n'
