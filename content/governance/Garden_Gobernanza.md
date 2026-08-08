---
title: "Gobernanza de Garden Digital"
description: "Fuente canónica para espacios, properties, tags, Bases y convenciones editoriales."
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
draft: true
aliases:
  - "Garden Governance"
  - "Taxonomía de Garden Digital"
---

# Gobernanza de Garden Digital

Las carpetas resuelven la clasificación gruesa; las properties estructuran; los tags describen; los wikilinks relacionan; las Bases auditan y presentan.

## Regla principal

```text
Creación/obra             → estudio
Vivencia/ciclo estacional → temporadas
Recopilación/catalogación → colecciones
Todo lo demás             → cuaderno
```

## Properties canónicas

| Property                          | Uso                            | Regla                                                           |
| --------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `title`, `description`, `created` | identidad y contexto editorial | descripción recomendada al publicar                             |
| `space`                           | caja principal                 | obligatoria; vocabulario cerrado                                |
| `area`                            | dominio macro                  | 0–2 recomendado                                                 |
| `kind`, `project`                 | estructura y proyecto          | opcionales                                                      |
| `season`, `phase`                 | ciclo estacional               | sólo si aplica                                                  |
| `tags`, `aliases`, `cssclasses`   | tema, nombres, presentación    | opcionales                                                      |
| `publish`                         | intención editorial            | `true` cuando esté lista; el filtro actual sigue siendo `draft` |

`space`: `cuaderno`, `temporadas`, `estudio`, `colecciones`.

`area` inicial: `digital`, `psicologia`, `jardin`, `quant`.

`kind` inicial: `note`, `issue`, `guide`, `research`, `reflection`, `tool`, `architecture`, `experience`, `work`, `resource`, `governance`.

`season`: `halloween`, `navidad`. `phase`: `anticipation`, `preparation`, `experience`, `closure`.

## Heurística

```text
esto ES...           → property
esto HABLA DE...     → tag
esto SE RELACIONA... → wikilink
```

Los tags usan minúsculas y kebab-case; su jerarquía sólo expresa relaciones padre/hijo reales. Antes de crear uno, buscar equivalente y preferir wikilink para entidades.

## Publicación

Hasta una futura migración explícita a publicación opt-in, Quartz mantiene `remove-draft`: `draft: true` no se publica. `publish` registra la decisión editorial y habilita las Bases; una nota pública debe tener ambos valores: `draft: false` y `publish: true`.
