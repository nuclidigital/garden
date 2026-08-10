import { writeFile } from "node:fs/promises"
import { execFileSync, spawnSync } from "node:child_process"
import path from "node:path"

const graphDir = path.join(process.cwd(), ".quartz/plugins/graph")
const graphRelativeScript = "src/components/scripts/graph.inline.ts"
const graphScript = path.join(graphDir, graphRelativeScript)
// Always patch the pristine plugin revision. This makes repeated publication
// runs idempotent even though `.quartz` is a local installation cache.
const source = execFileSync("git", ["show", `HEAD:${graphRelativeScript}`], {
  cwd: graphDir,
  encoding: "utf8",
})
const utilsImport = `import {
  removeAllChildren,
  getBasePath,
  getFullSlugFromUrl,
  simplifySlug,
  resolveBasePath,
} from "@quartz-community/utils";`
const localUtils = `function removeAllChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function getBasePath() {
  return document.body?.dataset?.basepath || "";
}

function getFullSlugFromUrl() {
  var slug = window.location.pathname.replace(/^\\/|\\/$/g, "");
  return slug;
}

function simplifySlug(slug) {
  var simplified = slug.replace(/^\\/|\\/$/g, "").replace(/\\/index$/, "");
  return simplified || "/";
}

function resolveBasePath(target) {
  return getBasePath() + "/" + target.replace(/^\\//, "");
}`

if (!source.includes(utilsImport)) {
  throw new Error("Graph cambió sus utilidades; revisa la customización antes de publicar.")
}

const selfContainedSource = source.replace(utilsImport, localUtils)
const start = selfContainedSource.indexOf("  Promise.all([")
const end = selfContainedSource.indexOf("\n\n  function initGraph()", start)

if (start === -1 || end === -1) {
  throw new Error("Graph cambió su cargador; revisa la customización antes de publicar.")
}

const lazyLoader = `  var graphMedia = window.matchMedia("(min-width: 1201px)");
  var graphStarted = false;

  function loadGraphLibraries() {
    if (graphStarted || !graphMedia.matches) return;
    graphStarted = true;
    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"),
      loadScript("https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.js"),
    ])
      .then(function () {
        initGraph();
      })
      .catch(function (err) {
        console.error("[Graph] Failed to load libraries:", err);
        var containers = document.querySelectorAll(".graph-container");
        for (var i = 0; i < containers.length; i++) {
          containers[i].textContent = "Graph could not load. Check your network connection.";
          containers[i].style.display = "flex";
          containers[i].style.alignItems = "center";
          containers[i].style.justifyContent = "center";
          containers[i].style.color = "var(--gray)";
          containers[i].style.fontSize = "0.9rem";
        }
      });
  }

  loadGraphLibraries();
  graphMedia.addEventListener("change", loadGraphLibraries);`

await writeFile(
  graphScript,
  selfContainedSource.slice(0, start) + lazyLoader + selfContainedSource.slice(end),
)
await writeFile(
  path.join(graphDir, "src/util/lang.ts"),
  `export function classNames(displayClass, ...classes) {
  if (displayClass) classes.push(displayClass)
  return classes.join(" ")
}
`,
)
console.log("Plugin Graph: carga de D3/Pixi limitada al layout desktop visible.")

const build = spawnSync("npm", ["run", "build"], { cwd: graphDir, stdio: "inherit" })
if (build.status !== 0) throw new Error("No se pudo recompilar el plugin Graph customizado.")
