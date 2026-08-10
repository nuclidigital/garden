# Higiene de dependencias y puertas de CI

## Punto de restauración

Antes de esta iteración se creó y publicó la etiqueta anotada:

```text
backup/pre-hygiene-ci-editorial-social-2026-08-10
```

Apunta al commit desplegado `b274f4bcdcfd09919b6880e9482bedac89acee04`. Para inspeccionarlo o recuperar el estado sin sobrescribir la rama actual:

```bash
git switch -c rollback/pre-hygiene-ci-editorial-social backup/pre-hygiene-ci-editorial-social-2026-08-10
```

## Dependencias

- `esbuild` queda actualizado a `^0.28.2`, también como override de la copia transitiva de `tsup`.
- `sharp` queda actualizado a `^0.35.3`.
- Lighthouse se fija en `12.6.1`: actualizarlo exige repetir el audit de toda su cadena transitiva.
- Se eliminaron `tsx` y la dependencia no compilada de `@quartz-community/utils`; los tests unitarios usan el runner nativo de Node y las utilidades isomórficas vuelven a estar versionadas con el core. `@quartz-community/types` permanece fijada a su paquete compilado `0.3.0` porque los plugins la necesitan al generar declaraciones.
- El parche reproducible de Graph sustituye además sus imports rotos de `utils` por cinco helpers locales antes de recompilar el plugin; no depende de artefactos ausentes en npm/Git.
- `npm run audit:dependencies` exige cero avisos desde severidad baja.

La actualización se considera válida solo con `npm ci`, audit, tipos, tests y build correctos. El lockfile es la fuente reproducible de CI; no se aceptan instalaciones flotantes durante la publicación.

## Puertas locales y de CI

`npm run check` incluye el audit de dependencias y el contrato editorial. El publicador canónico ejecuta, antes de construir:

1. instalación reproducible (`npm ci`);
2. instalación y parcheado de plugins;
3. audit de dependencias;
4. audit editorial;
5. contraste, build, rendimiento, E2E y Lighthouse.

El workflow de Pages heredado no ejecutaba el job de tests de Quartz en forks. Por eso `quartz/bootstrap-cli.mjs`, al detectar `CI=true` en cualquier build, llama a `scripts/run-ci-build-preflight.mjs`: audit de dependencias, audit editorial y tests unitarios. Así el despliegue real también queda bloqueado si falla una puerta, sin duplicar ni modificar los workflows heredados.

Para diagnosticar exclusivamente el build sin esa puerta existe `GARDEN_CI_PREFLIGHT_RUNNING=1`; es una protección contra recursión y no debe usarse en publicación normal.
