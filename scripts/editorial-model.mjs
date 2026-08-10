import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import YAML from "yaml"

export const SITE_URL = "https://garden.nuclidigital.com"
export const SPACES = new Set(["cuaderno", "temporadas", "estudio", "colecciones"])
export const KINDS = new Set([
  "note",
  "issue",
  "guide",
  "research",
  "reflection",
  "tool",
  "architecture",
  "experience",
  "work",
  "resource",
  "governance",
  "profile",
])

const walk = async (directory) => {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(entryPath)))
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(entryPath)
  }
  return files
}

export function parseMarkdown(source, filePath = "") {
  if (!source.startsWith("---\n")) return { filePath, data: {}, body: source }
  const end = source.indexOf("\n---", 4)
  if (end === -1) throw new Error(`${filePath}: frontmatter sin cierre`)
  const raw = source.slice(4, end)
  return { filePath, data: YAML.parse(raw) ?? {}, body: source.slice(end + 4).trimStart() }
}

export function slugFor(filePath, contentDir, data = {}) {
  if (typeof data.permalink === "string" && data.permalink.trim()) {
    return data.permalink.trim().replace(/^\/+|\/+$/g, "")
  }
  const relative = path
    .relative(contentDir, filePath)
    .replaceAll(path.sep, "/")
    .replace(/\.md$/, "")
  return relative === "index" ? "" : relative.replace(/\/index$/, "")
}

export function canonicalFor(entry) {
  const slug = entry.slug ? `/${entry.slug}` : "/"
  return `${SITE_URL}${slug}`
}

export async function loadMarkdownEntries(contentDir) {
  const entries = []
  for (const filePath of await walk(contentDir)) {
    const source = await readFile(filePath, "utf8")
    const parsed = parseMarkdown(
      source,
      path.relative(contentDir, filePath).replaceAll(path.sep, "/"),
    )
    entries.push({
      ...parsed,
      absolutePath: filePath,
      slug: slugFor(filePath, contentDir, parsed.data),
      isIndex: path.basename(filePath) === "index.md",
    })
  }
  return entries
}

export function isEditorial(entry) {
  const { data, filePath } = entry
  return (
    data.publish === true &&
    data.draft !== true &&
    data.unlisted !== true &&
    !entry.isIndex &&
    !filePath.startsWith("tags/") &&
    !filePath.startsWith("templates/") &&
    !filePath.startsWith("governance/") &&
    data.kind !== "governance" &&
    data.kind !== "profile"
  )
}
