# Estilo de redacción técnica — Bitácora de taller

## Propósito y ámbito

Este documento es contexto editorial para redactar o revisar notas técnicas en
Markdown destinadas a `content/cuaderno/` de Garden Digital.

Aplica un único estilo: **Bitácora de taller**. La voz es cercana e informal,
como la de una persona técnicamente competente que abre su cuaderno y explica
qué encontró, pero conserva rigor en los datos, las pruebas, los límites y las
fuentes. El lector debe sentir que alguien le acompaña durante el razonamiento,
no que lee documentación corporativa ni una conversación improvisada.

Cuando este documento se entregue a un LLM, sus reglas deben tratarse como
instrucciones editoriales. No inventar información para completar la plantilla.

## La voz en una frase

> Explica el sistema desde dentro, cuenta el recorrido sin dramatizarlo y deja
> cada afirmación importante apoyada por una observación, una prueba o una fuente.

## Principios de la Bitácora de taller

### 1. Cercanía sin charla vacía

- Escribir en español natural y directo.
- Usar primera persona solo cuando existe experiencia real detrás: «comprobé»,
  «en esta máquina observé», «la prueba que terminó de aclararlo fue…».
- Usar «podemos», «conviene» o una formulación impersonal para acompañar al
  lector en explicaciones y procedimientos generales.
- Permitir transiciones conversacionales sobrias: «La pista importante estaba
  aquí», «Esto parecía una contradicción, pero no lo era», «Antes de tocar nada…».
- Evitar saludos, chistes, entusiasmo artificial, preguntas retóricas en cadena,
  muletillas y complicidad impostada.

### 2. Rigor visible, no solemnidad

- Dar versiones, fechas, builds, identificadores, rutas, mensajes y mediciones
  exactas cuando sean relevantes.
- Separar siempre lo **observado**, lo **inferido** y lo **documentado por una
  fuente**. No presentar una correlación como causa.
- Indicar el alcance: un caso de campo no equivale a compatibilidad oficial; una
  prueba en un equipo no demuestra un comportamiento universal.
- Conservar resultados negativos y descartes si ayudan a entender por qué se
  tomó el siguiente camino.
- Explicar por qué se ejecuta una acción antes de mostrar el comando.
- Declarar incertidumbre con precisión: «es compatible con», «sugiere»,
  «constituye un factor plausible», «no quedó demostrado».
- No usar «obviamente», «simplemente» o «está claro» para cubrir un salto lógico.

### 3. Una historia técnica con dirección

La nota debe avanzar mediante esta secuencia, adaptada al tipo de pieza:

```text
contexto → síntoma o pregunta → observaciones → hipótesis → pruebas
        → descartes → intervención → validación → límites y aprendizajes
```

No hace falta convertir cada elemento en una sección. Sí debe resultar evidente
qué se sabía en cada momento y qué evidencia permitió avanzar. En una nota de
arquitectura, sustituir el incidente por este recorrido:

```text
pregunta → mapa del sistema → componentes → relaciones → estados de fallo
        → herramientas de observación → aplicación práctica
```

### 4. Precisión antes que densidad

- Abrir cada sección con su idea principal; desarrollar después el detalle.
- Mantener párrafos breves, normalmente de dos a cinco frases.
- Alternar explicación, evidencia y consecuencia. No acumular diez párrafos de
  teoría antes de mostrar por qué importan.
- Introducir cada sigla la primera vez: «Component Based Servicing (CBS)».
- Mantener los nombres propios de interfaces, eventos y componentes en su idioma
  original cuando traducirlos dificulte encontrarlos.
- Usar negrita para resultados o variables decisivas, no para decorar cada frase.
- Usar cursiva con moderación para términos extranjeros; usar código para tokens
  literales, rutas, comandos, archivos, claves, versiones y mensajes de error.

### 5. Utilidad reproducible

Una persona con un caso parecido debe poder distinguir:

- qué condiciones iniciales se daban;
- qué se midió y cómo;
- qué cambió entre dos pruebas;
- qué riesgos existían y qué salvaguardas se prepararon;
- qué resultado confirmó o refutó la hipótesis;
- cómo volver atrás;
- qué parte sigue siendo específica del caso.

No prometer reproducibilidad cuando faltan datos. En ese caso, señalar qué dato
no está disponible.

### 6. Knowledge base orientada al aprendizaje

Las notas técnicas del Cuaderno forman una **base de conocimiento**, no un
archivo de soluciones rápidas. Resolver el caso es importante, pero el propósito
editorial más duradero es que el lector aprenda el sistema subyacente y pueda
razonar ante una variante que todavía no está documentada.

Cada nota extensa debe dejar, además de la solución:

- un modelo mental de los componentes implicados y sus responsabilidades;
- las relaciones entre capas, procesos, estados y herramientas;
- el significado de las evidencias observables —logs, eventos, códigos, archivos
  o mediciones—;
- el criterio que permite elegir una prueba y descartar otra;
- principios reutilizables en incidentes parecidos.

No esconder el conocimiento general en una nota separada si es imprescindible
para comprender el caso. Integrarlo cerca del punto donde explica una
observación real: primero el problema despierta la pregunta; después el modelo
del sistema permite contestarla.

### 7. Aprendizaje visual

Se agradecen imágenes, tablas y diagramas Mermaid cuando enseñan algo que la
prosa sola obliga a mantener en la memoria. No son decoración: cada visual debe
responder una pregunta concreta.

Usar preferentemente:

- un diagrama de componentes para mostrar quién habla con quién;
- un flujo para explicar una secuencia de arranque, actualización o recuperación;
- un árbol de decisión para convertir evidencia en el siguiente paso;
- una línea temporal para ordenar estados antes/durante/después;
- una tabla para pruebas A/B, versiones, hipótesis o capas del sistema;
- una imagen real para conservar evidencia de interfaz, firmware, logs o estado
  final que no quede representada mejor como texto.

Antes de cada visual, explicar qué debe mirar el lector. Después, interpretar su
consecuencia; no abandonar el gráfico sin conectarlo con el razonamiento.

En Mermaid:

- mantener entre cuatro y doce nodos siempre que sea posible;
- dar a los nodos nombres conceptuales y legibles, no párrafos enteros;
- etiquetar las ramas de decisión y las transiciones decisivas;
- dividir un mapa enorme en dos diagramas con preguntas distintas;
- comprobar que sigue siendo comprensible en una pantalla estrecha;
- no inventar una relación arquitectónica solo para completar el dibujo.

Una nota breve no necesita un diagrama por obligación. Una nota larga sobre
varios componentes sí debería incluir al menos un mapa del sistema y un flujo de
diagnóstico o recuperación, salvo que el material disponible no permita hacerlo
con rigor.

## Forma literaria

### Apertura

Empezar con un hecho concreto que sitúe el problema o la idea. Preferir:

> Tras actualizar el equipo, el arranque pasó de dos minutos a casi una hora.

Evitar:

> En el vertiginoso mundo de la tecnología, los problemas de Windows pueden ser
> frustrantes para cualquier usuario.

Después de la apertura, incluir un callout `abstract` o `summary` que permita
entender el hallazgo principal sin leer toda la nota. Si la solución tiene un
riesgo o una limitación importante, colocar un `warning` cerca del resumen.

### Desarrollo

Construir una investigación legible. Una buena sección suele contener:

1. una observación concreta;
2. su interpretación provisional;
3. la prueba o fuente que la sostiene;
4. la consecuencia para el siguiente paso.

Usar pequeñas frases de orientación entre bloques técnicos. Ejemplos de tono:

- «El error parecía señalar al disco. La evidencia, sin embargo, no acompañaba
  esa hipótesis.»
- «La BIOS era pertinente, pero no era toda la solución.»
- «Aquí conviene separar dos estados que Windows muestra como si fueran uno.»
- «La prueba decisiva consistió en cambiar una sola variable.»

### Cierre

Cerrar con un resultado verificable y con lo que todavía no puede afirmarse.
Incluir, cuando corresponda:

- estado final y medición;
- explicación causal con su grado de certeza;
- riesgos residuales;
- criterio para aplicar o no aplicar la solución en otro entorno;
- enlaces internos en `## Relacionado`.

Evitar repetir literalmente el resumen o terminar con una moraleja genérica.

## Arquitectura recomendada de la nota

Elegir solo las secciones que aporten información. Los títulos deben describir
el contenido real, no obedecer mecánicamente a una plantilla.

```markdown
---
title: Título concreto y buscable
description: Una frase que identifique problema, entorno y aportación
created: YYYY-MM-DD
updated: YYYY-MM-DD
space: cuaderno
area:
  - digital
kind: issue
project: []
tags:
  - tecnologia
  - troubleshooting
aliases:
  - Otra búsqueda razonable
publish: true
draft: false
cssclasses: []
---

# Título concreto y buscable

> [!abstract] Resultado
> Problema, hallazgo principal, solución o conclusión y alcance, en pocas frases.

> [!warning] Alcance
> Riesgo, compatibilidad no oficial o límite que el lector debe conocer pronto.

## Contexto y entorno

Datos mínimos para interpretar o reproducir el caso.

## Síntoma o pregunta

Qué ocurrió, desde cuándo y cómo se manifestó.

## Observaciones e hipótesis

Qué mostraban los datos y qué explicaciones competían entre sí.

## Pruebas y descartes

Qué variable se cambió, qué se mantuvo constante y qué resultado apareció.

## Intervención

Salvaguardas, pasos, comandos y criterio de rollback.

## Validación

Pruebas posteriores y comparación antes/después.

## Límites y conclusión

Qué queda demostrado, qué no y dónde sería prudente detenerse.

## Relacionado

- [[Nota relacionada]]
```

`kind` debe pertenecer al vocabulario editorial del Garden. Para piezas técnicas,
usar normalmente uno de estos valores:

- `issue`: diagnóstico o informe de una incidencia;
- `guide`: procedimiento reproducible;
- `research`: investigación abierta o comparativa;
- `architecture`: explicación de un sistema y sus relaciones;
- `tool`: nota centrada en una herramienta;
- `note`: apunte técnico breve que no encaja mejor en los anteriores.

No inventar nuevos valores de `kind`. `area` admite como máximo dos valores en
minúsculas y kebab-case. Toda nota publicada debe incluir `description`, una
fecha, `publish: true`, `draft: false` y una sección final `## Relacionado` con
wikilinks cuando existan relaciones reales.

## Evidencia y trazabilidad

### Jerarquía de afirmaciones

Redactar de modo que el lector pueda reconocer el nivel de cada afirmación:

| Nivel       | Formulación adecuada                                           |
| ----------- | -------------------------------------------------------------- |
| Medido      | «El arranque tardó 17 s en tres pruebas consecutivas.»         |
| Observado   | «`CBS.log` registró el error durante el instalador MOF.»       |
| Inferido    | «Esto sugiere que el bloqueo estaba dentro de esa transición.» |
| Documentado | «Microsoft describe este estado como…» + fuente                |
| No resuelto | «No se pudo determinar qué proceso truncó el archivo.»         |

Nunca fabricar mediciones, logs, citas, URLs, versiones, fechas, compatibilidad
ni resultados. Si el material de entrada no los aporta, omitirlos o marcarlos
explícitamente como pendientes: `TODO: aportar salida exacta`.

### Fuentes

- Preferir documentación oficial, especificaciones, código fuente, changelogs y
  advisories del fabricante.
- Usar fuentes comunitarias para corroborar casos de campo, identificándolas como
  testimonios y no como documentación oficial.
- Colocar el enlace junto a la afirmación que respalda o usar notas al pie cuando
  la referencia necesita contexto.
- No añadir una bibliografía ornamental que no se cite en el cuerpo.
- Parafrasear. Reservar las citas literales para mensajes o formulaciones cuya
  literalidad sea relevante.

### Tablas, diagramas e imágenes

- Usar una tabla para comparar estados, versiones, pruebas A/B o antes/después.
- Usar Mermaid solo cuando haga más clara una secuencia, dependencia o decisión.
- No duplicar en un diagrama lo que ya se entiende en tres frases.
- Toda captura debe aportar evidencia y llevar texto alternativo descriptivo.
- Recortar o redactar claves, tokens, correos, identificadores personales,
  números de serie y códigos de recuperación antes de publicar.

## Comandos y procedimientos

- Especificar el intérprete correcto en la cerca de código: `bash`, `powershell`,
  `cmd`, `json`, `yaml`, etc.
- Mantener separados los comandos de la salida observada.
- Explicar privilegios, directorio de trabajo y precondiciones si importan.
- No presentar como inocuo un comando destructivo, irreversible o difícil de
  revertir.
- Antes de firmware, particiones, cifrado, bootloaders, bases de paquetes o
  borrados, incluir copia de seguridad, validación y rollback.
- Usar placeholders inequívocos, por ejemplo `<RUTA_DEL_VHDX>`, y decir qué debe
  sustituirse. No usar valores que parezcan credenciales reales.
- No recomendar `--force`, desactivar seguridad o borrar cachés como reflejo. Si
  una acción así está justificada, explicar el riesgo y la evidencia que la hace
  necesaria.

## Convenciones Markdown y Obsidian

- Un solo `#` para el título; secciones principales con `##` y subsecciones con
  `###`.
- Usar wikilinks `[[...]]` para conectar notas del Garden.
- Usar enlaces Markdown normales para fuentes externas.
- Elegir callouts por función: `abstract`/`summary` para síntesis, `info` para
  contexto, `warning` para riesgo, `important` para una condición decisiva y
  `success` para un resultado validado.
- No encadenar callouts ni listas durante páginas enteras: la prosa sigue siendo
  el hilo principal.
- Numerar secciones solo en documentos largos o procedimientos donde ayude a
  conservar la orientación.
- Escribir nombres de archivo y rutas con su capitalización real.

## Léxico y tono

Preferir verbos concretos: `medir`, `aislar`, `comparar`, `registrar`, `descartar`,
`restaurar`, `validar`, `reproducir`.

Preferir:

- «falló con `0x80070570`»;
- «la prueba no reprodujo el síntoma»;
- «el resultado acota el fallo a la distribución»;
- «no hay evidencia suficiente para atribuirle la causa».

Evitar:

- «solución definitiva» sin límites ni validación;
- «magia», «increíble», «superfácil», «infalible»;
- «como todos sabemos»;
- exceso de anglicismos cuando existe una expresión española precisa;
- tono de tutorial SEO: «en este artículo aprenderás…»;
- prosa burocrática: «se procede a efectuar la realización de…»;
- conclusiones del tipo «y eso es todo».

Los anglicismos técnicos útiles —_boot_, _rollback_, _payload_, _servicing_,
_write-up_— pueden mantenerse si son el término que el lector encontrará en la
interfaz o la documentación. Explicarlos la primera vez si no son evidentes.

## Reglas de edición para un LLM

Al generar una nota:

1. Identificar primero el tipo de pieza, la audiencia y la afirmación principal.
2. Extraer del material disponible hechos, observaciones, inferencias, fuentes y
   vacíos; no mezclarlos.
3. Elegir la estructura mínima que conserve el recorrido técnico.
4. Redactar con voz cercana y sobria; incorporar detalle solo donde cambie la
   comprensión o la acción.
5. No completar huecos factuales por plausibilidad. Formular preguntas o dejar
   `TODO` cuando un dato sea necesario.
6. Revisar comandos, versiones, unidades, cronología y consistencia entre tablas
   y prosa.
7. Terminar con `## Relacionado` y wikilinks pertinentes.
8. Entregar Markdown válido, sin comentarios sobre el proceso de generación.

Si se solicita reescribir una nota, preservar hechos, citas, comandos, enlaces,
frontmatter y grado de certeza salvo instrucción expresa. Mejorar la voz y la
estructura no autoriza a cambiar el contenido técnico.

## Lista de control final

Antes de entregar, comprobar:

- [ ] La apertura presenta un hecho o una pregunta concreta.
- [ ] El resumen permite entender el hallazgo y su alcance.
- [ ] Se distinguen observación, inferencia y fuente.
- [ ] Las versiones, fechas, rutas, errores y unidades son consistentes.
- [ ] Cada comando tiene propósito, contexto y riesgo suficiente.
- [ ] Los pasos sensibles incluyen salvaguarda y rollback.
- [ ] Los descartes relevantes explican el avance del diagnóstico.
- [ ] La validación compara el estado inicial y el final.
- [ ] El tono es cercano, informal y sobrio, sin perder precisión.
- [ ] No hay hechos, fuentes ni resultados inventados.
- [ ] No se publica información sensible en texto, logs o capturas.
- [ ] El frontmatter cumple el contrato editorial.
- [ ] La nota termina con `## Relacionado`.
