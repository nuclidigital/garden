# Arquitectura editorial de Garden Digital

## Modelo

La portada expone cuatro espacios estables y navegables:

| Espacio | Función |
| --- | --- |
| `cuaderno` | conocimiento, notas y experimentos |
| `temporadas` | vivencias y ciclos estacionales |
| `estudio` | obra y procesos creativos |
| `colecciones` | catálogos y recopilaciones |

`space` indica dónde vive una pieza. `kind` expresa qué tipo de pieza es. `area`, `project`, `tags` y `aliases` son listas; un documento admite como máximo dos áreas. Las áreas usan minúsculas y kebab-case.

## Contrato automatizado

`scripts/editorial-model.mjs` contiene el vocabulario y la resolución de canonical/permalink compartidos. `scripts/audit-editorial-architecture.mjs` valida:

- título, descripción, espacio y tipo;
- `publish: true` junto con `draft: false`;
- listas y áreas normalizadas;
- canonical no duplicadas;
- las cuatro landings publicadas y enlazadas desde portada;
- fecha y sección `## Relacionado` en cada nota editorial real.

Se ejecuta con:

```bash
npm run audit:editorial
```

El audit forma parte de `npm run check`, del publicador y de la puerta automática de build en CI. `GardenVault` sigue siendo la fuente canónica; la copia de `garden/content` se regenera al publicar.

## Presentación

La portada usa `.garden-space-grid` y `.garden-space-card` en `quartz/styles/custom.scss`. Es una cuadrícula de dos columnas que pasa a una en móvil, conserva objetivos táctiles amplios, foco visible y variantes Everforest diferenciadas para cada espacio.
