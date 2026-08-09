# Fase 3 · distribución social controlada

## Decisión recomendada

No convertir Quartz en un publicador de redes. Quartz debe seguir siendo un generador determinista: Markdown entra, sitio estático sale. La distribución debe vivir en una pequeña aplicación local separada, invocada después de que `publish-garden.sh` termine correctamente.

Nombre de trabajo: `garden-share`.

## Flujo propuesto

1. Leer del Vault únicamente documentos con `publish: true`.
2. Excluir landings, tags, áreas, borradores y notas que no tengan URL canónica pública.
3. Mostrar un selector de notas con título, fecha, estado y URL.
4. Previsualizar un texto específico por red antes de hacer nada.
5. Permitir copiar al portapapeles, abrir el compositor de la red o enviar mediante un proveedor autorizado.
6. Registrar lo difundido en un ledger local, sin alterar el contenido editorial salvo decisión explícita.

La interfaz puede ser una TUI sencilla para terminal, coherente con el flujo actual:

```text
./publish-garden.sh
garden-share select
```

Una integración futura opcional sería `./publish-garden.sh --share`, pero debe ejecutarse solo después de confirmar que el despliegue está accesible. Nunca publicará automáticamente por el mero hecho de hacer build.

## Seguridad y control editorial

- Modo predeterminado: generar borrador/copiar, no publicar.
- Confirmación explícita por nota y red.
- Tokens solo en variables de entorno o almacén de secretos; nunca en frontmatter, `.env` versionado ni GitHub Pages.
- Idempotencia mediante ledger: fecha, canonical, hash del texto, plataforma e identificador remoto.
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

## Implementación por incrementos

1. Selector local + generación de texto + copia/URL de compositor.
2. Ledger e idempotencia.
3. Adaptadores API para las redes realmente utilizadas.
4. Integración opcional con `publish-garden.sh` y un modo `--dry-run` permanente.

Esta separación permite cambiar Buffer, Make o APIs sin tocar Quartz, la navegación ni el contenido del Vault.
