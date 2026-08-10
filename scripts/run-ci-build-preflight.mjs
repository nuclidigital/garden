import { spawnSync } from "node:child_process"
import process from "node:process"

if (process.env.CI === "true" && process.env.GARDEN_CI_PREFLIGHT_RUNNING !== "1") {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm"
  for (const script of ["audit:dependencies", "audit:editorial", "test"]) {
    console.log(`\nCI preflight: npm run ${script}`)
    const result = spawnSync(npm, ["run", script], {
      cwd: process.cwd(),
      env: { ...process.env, GARDEN_CI_PREFLIGHT_RUNNING: "1" },
      stdio: "inherit",
    })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`CI preflight falló en npm run ${script}`)
  }
}
