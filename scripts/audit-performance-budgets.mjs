import { readFile } from "node:fs/promises"
import path from "node:path"
import { gzipSync } from "node:zlib"

const root = process.cwd()
const publicDir = path.join(root, "public")
const config = JSON.parse(await readFile(path.join(root, "performance-budgets.json"), "utf8"))

const bytes = (value) => `${(value / 1024).toFixed(1)} KiB`
const resourcePattern = /<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi

const resolveResource = (page, resource) => {
  const url = new URL(resource, `https://garden.local/${page}`)
  if (url.origin !== "https://garden.local") return { externalOrigin: url.origin }
  const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "")
  return { localPath: path.join(publicDir, relativePath) }
}

const failures = []
for (const page of config.pages) {
  const htmlPath = path.join(publicDir, page)
  const html = await readFile(htmlPath)
  const source = html.toString("utf8")
  const localPaths = new Set()
  const externalOrigins = new Set()

  for (const match of source.matchAll(resourcePattern)) {
    const resource = match[1]
    if (!resource || resource.startsWith("data:")) continue
    const resolved = resolveResource(page, resource)
    if (resolved.externalOrigin) externalOrigins.add(resolved.externalOrigin)
    if (resolved.localPath) localPaths.add(resolved.localPath)
  }

  let cssGzipBytes = 0
  let javascriptGzipBytes = 0
  let largestAssetGzipBytes = 0
  for (const assetPath of localPaths) {
    const asset = await readFile(assetPath)
    const compressedSize = gzipSync(asset).byteLength
    largestAssetGzipBytes = Math.max(largestAssetGzipBytes, compressedSize)
    if (assetPath.endsWith(".css")) cssGzipBytes += compressedSize
    if (assetPath.endsWith(".js")) javascriptGzipBytes += compressedSize
  }

  const htmlGzipBytes = gzipSync(html).byteLength
  const result = {
    htmlGzipBytes,
    cssGzipBytes,
    javascriptGzipBytes,
    totalGzipBytes: htmlGzipBytes + cssGzipBytes + javascriptGzipBytes,
    localRequestCount: localPaths.size,
    externalOriginCount: externalOrigins.size,
    largestAssetGzipBytes,
  }

  console.log(`\n${page}`)
  console.log(
    `  HTML ${bytes(result.htmlGzipBytes)} | CSS ${bytes(result.cssGzipBytes)} | JS ${bytes(result.javascriptGzipBytes)} | total ${bytes(result.totalGzipBytes)}`,
  )
  console.log(
    `  ${result.localRequestCount} recursos locales | ${result.externalOriginCount} orígenes externos | mayor ${bytes(result.largestAssetGzipBytes)}`,
  )

  for (const [metric, limit] of Object.entries(config.limits)) {
    if (result[metric] > limit) {
      const render = metric.endsWith("Bytes") ? bytes : String
      failures.push(`${page}: ${metric} = ${render(result[metric])}, límite = ${render(limit)}`)
    }
  }
}

if (failures.length > 0) {
  console.error("\nPresupuesto de rendimiento excedido:")
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exitCode = 1
} else {
  console.log("\nPresupuestos de rendimiento: OK")
}
