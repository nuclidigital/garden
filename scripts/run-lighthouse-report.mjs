import { existsSync } from "node:fs"
import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { launch } from "chrome-launcher"
import compression from "compression"
import lighthouse from "lighthouse"
import serveHandler from "serve-handler"

const browserCandidates = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  "/usr/sbin/chromium",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter(Boolean)
const chromePath = browserCandidates.find(existsSync)

const cleanupWslLauncherProfiles = async () => {
  // chrome-launcher may classify Linux Chromium under WSL as Windows Chrome
  // and leave its generated profile as a literal `C:\Users\...` directory in
  // cwd. Only its exact, numeric Lighthouse temp-name is eligible for removal.
  const generatedProfile = /^[A-Z]:\\Users\\[^\\]+\\AppData\\Local\\lighthouse\.\d+$/
  for (const entry of await readdir(process.cwd(), { withFileTypes: true })) {
    if (entry.isDirectory() && generatedProfile.test(entry.name)) {
      await rm(path.join(process.cwd(), entry.name), { recursive: true, force: true })
    }
  }
}

if (!chromePath) {
  throw new Error("No se encontró Chromium/Chrome; define CHROME_PATH para generar Lighthouse.")
}

const compress = compression()
const server = http.createServer((request, response) => {
  // Approximate the compression and immutable caching supplied by the static
  // production host, so the diagnostic measures the site rather than an
  // intentionally bare local server.
  response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  compress(request, response, () =>
    serveHandler(request, response, {
      public: "public",
      cleanUrls: true,
      directoryListing: false,
    }),
  )
})

await new Promise((resolve, reject) => {
  server.once("error", reject)
  server.listen(0, "127.0.0.1", resolve)
})

let chrome
try {
  const address = server.address()
  if (!address || typeof address === "string")
    throw new Error("No se pudo resolver el puerto local.")

  chrome = await launch({
    chromePath,
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  })
  const result = await lighthouse(`http://127.0.0.1:${address.port}/`, {
    port: chrome.port,
    output: ["html", "json"],
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  })
  if (!result) throw new Error("Lighthouse no devolvió resultados.")

  const reportsDir = path.join(process.cwd(), "reports")
  await mkdir(reportsDir, { recursive: true })
  const [htmlReport, jsonReport] = result.report
  await writeFile(path.join(reportsDir, "lighthouse.html"), htmlReport)
  await writeFile(path.join(reportsDir, "lighthouse.json"), jsonReport)

  console.log("Informe Lighthouse: reports/lighthouse.html")
  for (const [name, category] of Object.entries(result.lhr.categories)) {
    console.log(`  ${name}: ${Math.round((category.score ?? 0) * 100)}`)
  }
} finally {
  if (chrome) await chrome.kill()
  await new Promise((resolve) => server.close(resolve))
  await cleanupWslLauncherProfiles()
}
