# Distribución social asistida

## Decisión implementada

No convertir Quartz en un publicador de redes. Quartz debe seguir siendo un generador determinista: Markdown entra, sitio estático sale. La distribución debe vivir en una pequeña aplicación local separada, invocada después de que `publish-garden.sh` termine correctamente.

La aplicación local se llama `garden-share` y vive en `scripts/garden-share.mjs`.

## Flujo propuesto

1. Leer del Vault únicamente documentos con `publish: true`.
2. Excluir landings, tags, áreas, borradores y notas que no tengan URL canónica pública.
3. Mostrar un selector de notas con título, fecha, estado y URL.
4. Previsualizar un texto específico por red antes de hacer nada.
5. Permitir copiar al portapapeles, abrir el compositor de la red o enviar mediante un proveedor autorizado.
6. Registrar lo difundido en un ledger local, sin alterar el contenido editorial salvo decisión explícita.

La interfaz es un selector sencillo para terminal, coherente con el flujo actual:

```text
./publish-garden.sh
cd garden
npm run share -- select
```

La integración opcional ya está disponible con `./publish-garden.sh --share`. Se abre únicamente después de un push correcto y recuerda comprobar que la URL pública responde. Nunca publica automáticamente por hacer build o push.

## Uso

```bash
# Inventario de notas elegibles
cd garden
npm run share -- list

# Previsualización determinista, sin efectos laterales
npm run share -- draft --slug cuaderno/mi-nota --platform bluesky --dry-run

# Selector interactivo: previsualizar, copiar o copiar y abrir compositor
npm run share -- select

# Confirmar manualmente una difusión que ya se realizó
npm run share -- record --slug cuaderno/mi-nota --platform linkedin
```

Opciones relevantes: `--copy`, `--open`, `--dry-run`, `--vault`, `--ledger`, `--instance` y `--force`. Mastodon exige `MASTODON_INSTANCE` o `--instance`. En modo no interactivo, `record` exige además `--yes`.

## Seguridad y control editorial

- Modo predeterminado: generar borrador/copiar, no publicar.
- Confirmación explícita por nota y red.
- Tokens solo en variables de entorno o almacén de secretos; nunca en frontmatter, `.env` versionado ni GitHub Pages.
- Idempotencia mediante ledger: fecha, canonical, hash del texto, plataforma y estado manual.
- Si cambia la canonical, advertir antes de reutilizar una publicación anterior.
- UTM opcionales por plataforma, sin incorporarlos a canonical ni sitemap.

## Metadata opcional

No es necesario ensuciar todas las notas. Solo cuando se quiera controlar el mensaje:

```yaml
share:
  enabled: true
  excerpt: "Texto base opcional"
  platforms:
    - linkedin
    - bluesky
```

El estado real de publicación debe quedar en `.garden-share/ledger.json`, ignorado por Git si contiene identificadores o datos operativos. Si se necesita historial portable, se generará además un resumen sanitizado versionable.

## Adaptadores

- LinkedIn: comenzar con apertura del compositor o proveedor como Buffer/Make; el acceso de escritura de su API exige permisos y revisión que no conviene acoplar al jardín.
- Bluesky y Mastodon: buenos candidatos para adaptadores API directos.
- Instagram: el formato visual y las restricciones de publicación requieren un flujo específico; no debe tratarse como un simple enlace de texto.
- IndexNow: adaptador separado de SEO técnico, ejecutado después del despliegue; no es una red social.

## Estado de implementación

1. Selector local, generación limitada por plataforma, copia y URL de compositor: implementado.
2. Ledger local, escritura atómica e idempotencia: implementado.
3. Integración opcional con `publish-garden.sh` y `--dry-run`: implementado.
4. Adaptadores API directos: deliberadamente pendientes hasta decidir redes y permisos; requerirán confirmación y secretos externos.

Esta separación permite cambiar Buffer, Make o APIs sin tocar Quartz, la navegación ni el contenido del Vault.
