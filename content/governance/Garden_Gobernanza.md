---
title: "Gobernanza de Garden Digital"
description: "Fuente canónica para gobernar espacios, properties, tags, Bases y convenciones editoriales."
created: 2026-08-08
space: cuaderno
area:
  - digital
kind: governance
project:
  - garden-digital
tags:
  - garden-digital/governance
  - obsidian
  - quartz
publish: false
aliases:
  - "Garden Governance"
  - "Taxonomía de Garden Digital"
---

# Gobernanza de Garden Digital

> [!summary]
> Las carpetas resuelven la clasificación gruesa; las **properties** estructuran; los **tags** describen; los **wikilinks** relacionan; las **Bases** auditan/presentan; `TagPage` da navegación temática.

## Regla principal

```text
Creación/obra             → estudio
Vivencia/ciclo estacional → temporadas
Recopilación/catalogación → colecciones
Todo lo demás             → cuaderno
```

## Diccionario canónico de properties

| Property      | Tipo     | Uso                          | Regla                   |
| ------------- | -------- | ---------------------------- | ----------------------- |
| `title`       | text     | título                       | recomendada             |
| `description` | text     | resumen editorial/SEO/search | recomendada al publicar |
| `created`     | date     | creación                     | recomendada             |
| `space`       | text     | caja principal               | obligatoria             |
| `area`        | list     | dominio macro                | 0–2 recomendado         |
| `kind`        | text     | naturaleza estructural       | opcional                |
| `project`     | list     | proyectos                    | opcional                |
| `season`      | text     | temporada                    | condicional             |
| `phase`       | text     | fase temporada               | condicional             |
| `tags`        | tags     | conceptos                    | opcional                |
| `aliases`     | list     | nombres alternativos         | opcional                |
| `publish`     | checkbox | publicación opt-in           | recomendada             |
| `cssclasses`  | list     | presentación                 | opcional                |

## Regla para crear una nueva property

Sólo crearla si:

1. responde a una pregunta estructural estable;
2. servirá para filtrar/agrupar/automatizar;
3. tendrá significado idéntico en muchas notas.

En otro caso → tag o wikilink.

## Vocabulario `space`

```text
cuaderno
temporadas
estudio
colecciones
```

Cerrado. No ampliarlo por crecimiento temático.

## Vocabulario `area`

Inicial:

```text
digital
psicologia
jardin
quant
```

Mantenerlo pequeño. Añadir una nueva área sólo cuando exista un dominio estable y voluminoso.

## Vocabulario `kind`

Inicial y deliberadamente opcional:

```text
note
issue
guide
research
reflection
tool
architecture
experience
work
resource
governance
```

No rellenar por obligación.

## Vocabulario `season`

Inicial:

```text
halloween
navidad
```

## Vocabulario `phase`

```text
anticipation
preparation
experience
closure
```

## `project`

Lista abierta de identificadores estables, preferiblemente kebab-case.

Inicial:

```text
garden-digital
podsplot
quant
```

## Política de tags

Los tags responden a “¿de qué habla?”

Preferir:

- lowercase;
- kebab-case;
- jerarquía sólo cuando exista padre/hijo real.

Ejemplos:

```text
linux
linux/wsl
filesystem
conducta-humana
demencia/cuerpos-de-lewy
perros/whippet
arquitectura-empresarial
```

Evitar usar tags para simular properties:

```text
#space/cuaderno
#status/solved
#project/podsplot
```

## Antes de crear un tag

1. buscar equivalente;
2. reutilizar el término existente;
3. evitar singular/plural y sinónimos accidentales;
4. considerar wikilink si representa una entidad;
5. crear landing editorial si el tag se vuelve importante.

## Índices dinámicos disponibles

### Obsidian

- **Properties view → All properties**: lista todas las properties, su tipo y frecuencia.
- **Tags view**: lista tags y frecuencia; puede mostrar nested tags como árbol.
- **Bases**: vistas filtradas/agregadas sobre metadata.

### Quartz

- `TagPage`: página por tag.
- `/tags`: índice global de tags.
- `TagList`: tags clicables dentro de una nota.
- `BasesPage`: render de archivos `.base`.

## Heurística

```text
esto ES...           → property
esto HABLA DE...     → tag
esto SE RELACIONA... → wikilink
```

## Landings editoriales

Para temas principales puede existir:

```text
content/tags/digital.md
content/tags/psicologia.md
content/tags/jardin.md
content/tags/quant.md
```

Estas notas enriquecen las páginas temáticas, pero **no contienen físicamente** las notas clasificadas.

## Revisión periódica

### Properties

- ¿apareció alguna no registrada?
- ¿hay duplicados semánticos?
- ¿alguna property debería volver a ser tag?

### Tags

- ¿sinónimos?
- ¿singular/plural?
- ¿jerarquías demasiado profundas?
- ¿alguno merece landing?

### Bases

- ¿responden a una pregunta real?
- ¿hay vistas duplicadas?
- ¿alguna debe ser pública?

### Estructura

- no crear una nueva caja principal por crecimiento temático.

## Registro de cambios

| Fecha      | Cambio          | Motivo                                           |
| ---------- | --------------- | ------------------------------------------------ |
| 2026-08-08 | Esquema inicial | separar caja, estructura, tema, relación y vista |
