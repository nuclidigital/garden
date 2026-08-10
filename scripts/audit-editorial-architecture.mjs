import path from "node:path"
import { KINDS, SPACES, loadMarkdownEntries, isEditorial } from "./editorial-model.mjs"

const contentDir = path.resolve(process.argv[2] ?? "content")
const entries = await loadMarkdownEntries(contentDir)
const errors = []
const warnings = []
const canonicalOwners = new Map()
const counts = new Map()

const requireText = (entry, property) => {
  if (typeof entry.data[property] !== "string" || entry.data[property].trim() === "") {
    errors.push(`${entry.filePath}: falta ${property}`)
  }
}

for (const entry of entries) {
  const { data, filePath } = entry
  if (filePath === "index.md" || filePath.startsWith("templates/") || data.publish !== true)
    continue

  requireText(entry, "title")
  requireText(entry, "description")
  requireText(entry, "space")
  requireText(entry, "kind")

  if (!SPACES.has(data.space)) errors.push(`${filePath}: space no canónico «${data.space}»`)
  if (!KINDS.has(data.kind)) errors.push(`${filePath}: kind no canónico «${data.kind}»`)
  for (const property of ["area", "project", "tags", "aliases"]) {
    if (data[property] !== undefined && !Array.isArray(data[property])) {
      errors.push(`${filePath}: ${property} debe ser una lista YAML`)
    } else if (
      Array.isArray(data[property]) &&
      new Set(data[property]).size !== data[property].length
    ) {
      errors.push(`${filePath}: ${property} contiene valores duplicados`)
    }
  }
  if (Array.isArray(data.area) && data.area.length > 2) {
    errors.push(`${filePath}: area admite como máximo dos valores`)
  }
  for (const area of data.area ?? []) {
    if (typeof area !== "string" || !/^[\p{Ll}\p{N}]+(?:-[\p{Ll}\p{N}]+)*$/u.test(area)) {
      errors.push(`${filePath}: area debe usar lowercase/kebab-case («${area}»)`)
    }
  }
  if (data.draft !== false) errors.push(`${filePath}: publish:true exige draft:false`)

  const canonical = entry.slug
  if (canonicalOwners.has(canonical)) {
    errors.push(`${filePath}: canonical duplicada con ${canonicalOwners.get(canonical)}`)
  }
  canonicalOwners.set(canonical, filePath)
  counts.set(data.space, (counts.get(data.space) ?? 0) + 1)

  if (isEditorial(entry)) {
    if (!data.created && !data.date)
      errors.push(`${filePath}: una nota editorial exige created o date`)
    if (!/^## Relacionado\s*$/m.test(entry.body)) {
      errors.push(`${filePath}: falta la sección «## Relacionado»`)
    } else if (!/^## Relacionado\s*\n+[\s\S]*?\[\[/m.test(entry.body)) {
      warnings.push(`${filePath}: «Relacionado» todavía no contiene wikilinks`)
    }
  }
}

for (const space of SPACES) {
  const landing = entries.find((entry) => entry.filePath === `${space}/index.md`)
  if (!landing || landing.data.publish !== true) errors.push(`${space}: falta landing publicada`)
}

const home = entries.find((entry) => entry.filePath === "index.md")
if (!home || home.data.publish !== true) {
  errors.push("index.md: la portada debe estar publicada")
} else {
  for (const space of SPACES) {
    if (!home.body.includes(`href="/${space}"`)) {
      errors.push(`index.md: falta la ruta editorial visible /${space}`)
    }
  }
}

console.log(`Arquitectura editorial: ${entries.length} Markdown analizados.`)
console.log([...SPACES].map((space) => `${space}=${counts.get(space) ?? 0}`).join(" | "))
warnings.forEach((warning) => console.warn(`Aviso: ${warning}`))

if (errors.length > 0) {
  errors.forEach((error) => console.error(`Error: ${error}`))
  process.exitCode = 1
} else {
  console.log("Contrato editorial: OK")
}
