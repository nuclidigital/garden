#!/usr/bin/env node

import { createHash } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { spawn, spawnSync } from "node:child_process"
import path from "node:path"
import process from "node:process"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"
import { canonicalFor, isEditorial, loadMarkdownEntries } from "./editorial-model.mjs"

export const PLATFORMS = new Set(["linkedin", "bluesky", "mastodon"])

const ownDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoDirectory = path.resolve(ownDirectory, "..")
const defaultVault = path.resolve(repoDirectory, "../GardenVault")
const defaultLedger = path.resolve(repoDirectory, ".garden-share/ledger.json")

const codePoints = (text) => Array.from(text)
const shorten = (text, limit) => {
  if (codePoints(text).length <= limit) return text
  return `${codePoints(text)
    .slice(0, Math.max(0, limit - 1))
    .join("")
    .trimEnd()}…`
}

export function isShareEligible(entry) {
  return isEditorial(entry) && entry.data.share?.enabled !== false && Boolean(entry.slug)
}

export function availablePlatforms(entry) {
  const configured = entry.data.share?.platforms
  if (!Array.isArray(configured) || configured.length === 0) return [...PLATFORMS]
  return configured.filter((platform) => PLATFORMS.has(platform))
}

export function generateDraft(entry, platform) {
  if (!PLATFORMS.has(platform)) throw new Error(`Plataforma no soportada: ${platform}`)
  const title = String(entry.data.title ?? entry.slug).trim()
  const excerpt = String(entry.data.share?.excerpt ?? entry.data.description ?? "").trim()
  const url = canonicalFor(entry)
  const limits = { linkedin: 3000, bluesky: 300, mastodon: 500 }
  const separator = excerpt ? "\n\n" : "\n"
  const suffix = `${separator}${url}`
  const room = Math.max(0, limits[platform] - codePoints(suffix).length)
  const message = excerpt ? `${title}\n\n${excerpt}` : title
  return `${shorten(message, room)}${suffix}`
}

export function composerUrl(
  platform,
  draft,
  canonical,
  mastodonInstance = process.env.MASTODON_INSTANCE,
) {
  if (platform === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`
  }
  if (platform === "bluesky") {
    return `https://bsky.app/intent/compose?text=${encodeURIComponent(draft)}`
  }
  if (!mastodonInstance) {
    throw new Error(
      "Define MASTODON_INSTANCE (por ejemplo, https://mastodon.social) para abrir Mastodon.",
    )
  }
  const base = mastodonInstance.replace(/\/$/, "")
  return `${base}/share?text=${encodeURIComponent(draft)}`
}

const parseArguments = (argv) => {
  const options = { command: "select" }
  const args = [...argv]
  if (args[0] && !args[0].startsWith("--")) options.command = args.shift()
  while (args.length > 0) {
    const argument = args.shift()
    if (!argument.startsWith("--")) throw new Error(`Argumento inesperado: ${argument}`)
    const [key, inlineValue] = argument.slice(2).split("=", 2)
    if (["copy", "open", "dry-run", "yes", "force"].includes(key)) options[key] = true
    else {
      const value = inlineValue ?? args.shift()
      if (!value || value.startsWith("--")) throw new Error(`Falta valor para --${key}`)
      options[key] = value
    }
  }
  return options
}

const loadEligibleEntries = async (vaultDirectory) =>
  (await loadMarkdownEntries(vaultDirectory))
    .filter(isShareEligible)
    .sort((a, b) =>
      String(b.data.created ?? b.data.date ?? "").localeCompare(
        String(a.data.created ?? a.data.date ?? ""),
      ),
    )

const findEntry = (entries, slug) => {
  if (!slug) return undefined
  const normalized = slug.replace(/^\//, "").replace(/\.md$/, "")
  return entries.find(
    (entry) => entry.slug === normalized || entry.filePath.replace(/\.md$/, "") === normalized,
  )
}

const choose = async (prompt, choices, rl) => {
  choices.forEach((choice, index) => console.log(`${index + 1}. ${choice.label}`))
  const raw = await rl.question(`${prompt} [1-${choices.length}]: `)
  const index = Number.parseInt(raw, 10) - 1
  if (!Number.isInteger(index) || !choices[index]) throw new Error("Selección no válida.")
  return choices[index].value
}

const copyDraft = (draft) => {
  const candidates =
    process.platform === "darwin"
      ? [["pbcopy"]]
      : process.platform === "win32"
        ? [["clip"]]
        : [["wl-copy"], ["xclip", "-selection", "clipboard"], ["clip.exe"]]
  for (const [command, ...args] of candidates) {
    const result = spawnSync(command, args, {
      input: draft,
      encoding: "utf8",
      stdio: ["pipe", "ignore", "ignore"],
    })
    if (!result.error && result.status === 0) return command
  }
  throw new Error("No encuentro wl-copy, xclip ni clip.exe para acceder al portapapeles.")
}

const openComposer = (url) => {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd.exe" : "xdg-open"
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url]
  const child = spawn(command, args, { detached: true, stdio: "ignore" })
  child.unref()
}

const readLedger = async (ledgerPath) => {
  try {
    return JSON.parse(await readFile(ledgerPath, "utf8"))
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, entries: [] }
    throw error
  }
}

const recordShare = async (ledgerPath, entry, platform, draft, force) => {
  const ledger = await readLedger(ledgerPath)
  const hash = createHash("sha256").update(draft).digest("hex")
  const duplicate = ledger.entries.some(
    (item) =>
      item.canonical === canonicalFor(entry) &&
      item.platform === platform &&
      item.draftHash === hash,
  )
  if (duplicate && !force)
    throw new Error("Esta versión ya figura como difundida. Usa --force para repetirla.")
  ledger.entries.push({
    recordedAt: new Date().toISOString(),
    slug: entry.slug,
    canonical: canonicalFor(entry),
    platform,
    draftHash: hash,
    status: "shared-manually",
  })
  await mkdir(path.dirname(ledgerPath), { recursive: true })
  const temporary = `${ledgerPath}.tmp`
  await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 })
  await rename(temporary, ledgerPath)
}

const printEntries = (entries) => {
  for (const entry of entries) {
    const date = entry.data.created ?? entry.data.date ?? "sin fecha"
    const enabled = entry.data.share?.enabled === true ? "prioritaria" : "disponible"
    console.log(`${date}\t${enabled}\t/${entry.slug}\t${entry.data.title}`)
  }
}

export async function run(argv = process.argv.slice(2)) {
  const options = parseArguments(argv)
  if (!["list", "select", "draft", "record"].includes(options.command)) {
    throw new Error("Comando válido: list, select, draft o record.")
  }
  const vaultDirectory = path.resolve(options.vault ?? process.env.GARDEN_VAULT_DIR ?? defaultVault)
  const ledgerPath = path.resolve(options.ledger ?? defaultLedger)
  const entries = await loadEligibleEntries(vaultDirectory)
  if (options.command === "list") return printEntries(entries)
  if (entries.length === 0) throw new Error("No hay notas editoriales publicables en el Vault.")

  let rl
  let entry = findEntry(entries, options.slug)
  try {
    if (!entry) {
      if (!process.stdin.isTTY) throw new Error("Indica --slug en modo no interactivo.")
      rl = createInterface({ input: process.stdin, output: process.stdout })
      entry = await choose(
        "Elige una nota",
        entries.map((item) => ({ label: `${item.data.title} · /${item.slug}`, value: item })),
        rl,
      )
    }

    const allowedPlatforms = availablePlatforms(entry)
    if (allowedPlatforms.length === 0)
      throw new Error("La nota no tiene plataformas sociales válidas.")
    let platform = options.platform
    if (!platform) {
      if (!process.stdin.isTTY) throw new Error("Indica --platform en modo no interactivo.")
      rl ??= createInterface({ input: process.stdin, output: process.stdout })
      platform = await choose(
        "Elige una plataforma",
        allowedPlatforms.map((item) => ({ label: item, value: item })),
        rl,
      )
    }
    if (!allowedPlatforms.includes(platform))
      throw new Error(`${platform} no está habilitada para esta nota.`)

    const draft = generateDraft(entry, platform)
    const canonical = canonicalFor(entry)
    console.log(`\n--- Borrador para ${platform} ---\n${draft}\n--- fin ---\n`)
    if (options["dry-run"]) return

    if (options.command === "select" && !options.copy && !options.open) {
      rl ??= createInterface({ input: process.stdin, output: process.stdout })
      const action = await choose(
        "Acción",
        [
          { label: "Solo previsualizar", value: "preview" },
          { label: "Copiar", value: "copy" },
          { label: "Copiar y abrir compositor", value: "open" },
        ],
        rl,
      )
      options.copy = action === "copy" || action === "open"
      options.open = action === "open"
    }

    if (options.copy) console.log(`Copiado mediante ${copyDraft(draft)}.`)
    if (options.open) {
      openComposer(composerUrl(platform, draft, canonical, options.instance))
      console.log("Compositor abierto. Revisa el texto antes de publicarlo.")
    }
    if (options.command === "record") {
      if (!options.yes) {
        if (!process.stdin.isTTY)
          throw new Error("Usa --yes para registrar en modo no interactivo.")
        rl ??= createInterface({ input: process.stdin, output: process.stdout })
        const answer = await rl.question("¿Confirmas que ya lo has difundido? [s/N]: ")
        if (!/^s(?:í|i)?$/i.test(answer.trim()))
          return console.log("No se ha modificado el ledger.")
      }
      await recordShare(ledgerPath, entry, platform, draft, options.force)
      console.log(`Difusión registrada localmente en ${ledgerPath}.`)
    }
  } finally {
    rl?.close()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(`Error: ${error.message}`)
    process.exitCode = 1
  })
}
