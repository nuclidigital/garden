# Quartz V5 · higiene SEO y confianza de Garden Digital

## Alcance

Esta customización mantiene Quartz V5 como generador y sustituye solo aquello que el core no permite configurar: el filtrado independiente de `sitemap.xml` y RSS. El índice JSON usado por búsqueda y navegación sigue siendo el del plugin oficial `content-index`.

## Componentes

- `garden/quartz/util/gardenSeo.ts`: política compartida de URL canónica, indexación, selección editorial, fechas y JSON-LD.
- `garden/quartz/plugins/emitters/gardenSeo.ts`: emite `robots.txt`, `sitemap.xml` e `index.xml`.
- `garden/quartz/components/Head.tsx`: añade canonical, robots, descubrimiento RSS, Open Graph coherente y JSON-LD.
- `garden/quartz/plugins/loader/config-loader.ts`: registra el emisor local como emisor integrado.
- `garden/quartz.config.yaml`: mantiene `content-index`, pero desactiva únicamente sus salidas RSS y sitemap para evitar colisiones.
- `publish-garden.sh`: sincroniza `.dev`, actualiza todos los archivos ya versionados y admite nuevas customizaciones bajo el árbol completo `quartz`; así componentes, estilos, scripts, emitters, loaders, utilidades y pruebas viajan juntos.

Hay pruebas de política en `gardenSeo.test.ts`, junto a la utilidad y al emisor.

## Política de URL e indexación

- `index` tiene canonical `https://garden.nuclidigital.com/`.
- Cualquier `carpeta/index` usa `/carpeta/`, nunca `/carpeta/index`.
- La portada es pública e indexable.
- `404`, documentos `unlisted`, páginas virtuales de áreas y páginas virtuales vacías llevan `noindex`.
- El índice general de tags lleva `noindex,follow`.
- Un tag solo es indexable cuando aparece al menos en dos documentos reales publicados. El umbral está en `MIN_INDEXABLE_TAG_ENTRIES`.
- `robots.txt` permite rastrear todo: no se bloquean las URL con `noindex`, porque el robot necesita acceder al HTML para leer esa directiva.
- El sitemap incluye únicamente canonical indexables y usa URL absolutas.

Las antiguas URL de los dos documentos de WSL se conservan como aliases y redirigen a:

- `/cuaderno/arch-wsl2-e-unexpected-informe`
- `/cuaderno/arch-wsl2-e-unexpected-recuperacion`

También continúan vigentes los aliases históricos bajo `/ithings/` y los aliases fechados.

## RSS editorial

El feed excluye portada, landings `index`, tags, áreas, páginas virtuales y notas muy breves. El umbral `MIN_RSS_WORDS` está fijado en 120 palabras y evita que fichas o landings de una frase desplacen a las notas sustantivas. El feed publica hasta 20 entradas y contiene autodiscovery mediante `<link rel="alternate">`.

## Datos estructurados

El `<head>` emite un grafo JSON-LD coherente con el contenido visible:

- `WebSite` y `Person` en el sitio.
- `ProfilePage` en `/sobre-mi`.
- `Article` en documentos reales que no sean landings ni tags.
- `BreadcrumbList` fuera de portada y 404.

La identidad pública se centraliza en `GARDEN_AUTHOR`. Si cambian los perfiles, deben actualizarse tanto esa constante como `quartz/components/garden.site.ts`.

## Mermaid y rendimiento

Se eliminó el bundle global personalizado de Mermaid y se activó la integración nativa de `obsidian-flavored-markdown`. Quartz carga Mermaid bajo demanda únicamente en páginas con diagramas. La dependencia directa `mermaid` dejó de ser necesaria en `package.json`.

## Publicación y comprobaciones

Después de `./publish-garden.sh`, comprobar:

```bash
curl -sS https://garden.nuclidigital.com/robots.txt
curl -sS https://garden.nuclidigital.com/sitemap.xml
curl -sS https://garden.nuclidigital.com/index.xml
```

En HTML se debe verificar una única canonical, `og:url` idéntica y un bloque JSON-LD válido.

## Alta en buscadores: paso externo pendiente

El código deja el sitio listo, pero el alta necesita una sesión del propietario y no debe automatizarse con credenciales dentro del repositorio.

1. Añadir `https://garden.nuclidigital.com/` como propiedad de prefijo de URL en Google Search Console y verificarla mediante la metaetiqueta instalada. Una propiedad de dominio completa exigiría verificación DNS.
2. En **Sitemaps**, enviar `https://garden.nuclidigital.com/sitemap.xml`.
3. Inspeccionar la portada y las dos notas WSL; solicitar indexación cuando el despliegue esté validado.
4. En Bing Webmaster Tools, importar el sitio verificado desde Search Console o verificarlo por DNS.
5. Enviar el mismo sitemap y revisar los informes de rastreo/indexación.

No se usa el antiguo ping anónimo de sitemaps de Bing, retirado por el buscador. Para una fase posterior de distribución técnica puede añadirse IndexNow tras un despliegue correcto, guardando su clave fuera del repositorio.

La propiedad dispone además de verificación por metaetiqueta en `Head.tsx`. Si Search Console renueva el token, debe sustituirse allí; no es un secreto y está destinado a ser público en el HTML.

Referencias operativas oficiales:

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b
- https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed
