import { slug as slugAnchor } from "github-slugger"
import type { Element as HastElement } from "hast"
import { clone } from "./clone"

// Isomorphic by design: this module is also bundled for the browser.

export const QUARTZ = "quartz"

type SlugLike<T> = string & { _brand: T }

export type FilePath = SlugLike<"FilePath">
export function isFilePath(s: string): s is FilePath {
  return !s.startsWith(".") && getFileExtension(s) !== undefined
}

export type FullSlug = SlugLike<"FullSlug">
export function isFullSlug(s: string): s is FullSlug {
  return (
    !(s.startsWith(".") || s.startsWith("/")) && !s.endsWith("/") && !containsForbiddenCharacters(s)
  )
}

export type SimpleSlug = SlugLike<"SimpleSlug">
export function isSimpleSlug(s: string): s is SimpleSlug {
  const validStart = !(s.startsWith(".") || (s.length > 1 && s.startsWith("/")))
  return (
    validStart &&
    !containsForbiddenCharacters(s) &&
    !endsWith(s, "index") &&
    getFileExtension(s) === undefined
  )
}

export type RelativeURL = SlugLike<"RelativeURL">
export function isRelativeURL(s: string): s is RelativeURL {
  return (
    /^\.{1,2}/.test(s) &&
    !endsWith(s, "index") &&
    ![".md", ".html"].includes(getFileExtension(s) ?? "")
  )
}

export function isAbsoluteURL(s: string): boolean {
  try {
    new URL(s)
  } catch {
    return false
  }
  return true
}

export function getFullSlug(window: Window): FullSlug {
  return window.document.body.dataset.slug! as FullSlug
}

function sluggify(s: string): string {
  return s
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, ""),
    )
    .join("/")
    .replace(/\/$/, "")
}

export function slugifyFilePath(fp: FilePath, excludeExt?: boolean): FullSlug {
  fp = stripSlashes(fp) as FilePath
  let ext = getFileExtension(fp)
  const withoutFileExt = fp.replace(new RegExp(`${ext}$`), "")
  if (excludeExt || [".md", ".html", undefined].includes(ext)) ext = ""
  let slug = sluggify(withoutFileExt)
  if (endsWith(slug, "_index")) slug = slug.replace(/_index$/, "index")
  return (slug + ext) as FullSlug
}

export function simplifySlug(fp: FullSlug): SimpleSlug {
  const result = stripSlashes(trimSuffix(fp, "index"), true)
  return (result.length === 0 ? "/" : result) as SimpleSlug
}

export function transformInternalLink(link: string): RelativeURL {
  const [filePathLike, anchor] = splitAnchor(decodeURI(link))
  const folderPath = isFolderPath(filePathLike)
  const segments = filePathLike.split("/").filter((segment) => segment.length > 0)
  const prefix = segments.filter(isRelativeSegment).join("/")
  const filePath = segments
    .filter((segment) => !isRelativeSegment(segment) && segment !== "")
    .join("/")
  const simpleSlug = simplifySlug(slugifyFilePath(filePath as FilePath))
  const joined = joinSegments(stripSlashes(prefix), stripSlashes(simpleSlug))
  return (_addRelativeToStart(joined) + (folderPath ? "/" : "") + anchor) as RelativeURL
}

const _rebaseHtmlElement = (element: Element, attribute: string, newBase: string | URL) => {
  const rebased = new URL(element.getAttribute(attribute)!, newBase)
  element.setAttribute(attribute, rebased.pathname + rebased.hash)
}

export function normalizeRelativeURLs(element: Element | Document, destination: string | URL) {
  element.querySelectorAll('[href=""], [href^="./"], [href^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "href", destination)
  })
  element.querySelectorAll('[src=""], [src^="./"], [src^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "src", destination)
  })
}

const _rebaseHastElement = (
  element: HastElement,
  attribute: string,
  currentBase: FullSlug,
  newBase: FullSlug,
) => {
  if (element.properties?.[attribute]) {
    if (!isRelativeURL(String(element.properties[attribute]))) return
    const relative = joinSegments(
      resolveRelative(currentBase, newBase),
      "..",
      element.properties[attribute] as string,
    )
    element.properties[attribute] = relative
  }
}

export function normalizeHastElement(
  rawElement: HastElement,
  currentBase: FullSlug,
  newBase: FullSlug,
) {
  const element = clone(rawElement)
  _rebaseHastElement(element, "src", currentBase, newBase)
  _rebaseHastElement(element, "href", currentBase, newBase)
  if (element.children) {
    element.children = element.children.map((child) =>
      normalizeHastElement(child as HastElement, currentBase, newBase),
    )
  }
  return element
}

export function pathToRoot(slug: FullSlug): RelativeURL {
  const rootPath = slug
    .split("/")
    .filter((segment) => segment !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return (rootPath.length === 0 ? "." : rootPath) as RelativeURL
}

export function resolveRelative(current: FullSlug, target: FullSlug | SimpleSlug): RelativeURL {
  return joinSegments(pathToRoot(current), simplifySlug(target as FullSlug)) as RelativeURL
}

export function splitAnchor(link: string): [string, string] {
  let [filePath, anchor] = link.split("#", 2)
  if (filePath.endsWith(".pdf")) return [filePath, anchor === undefined ? "" : `#${anchor}`]
  anchor = anchor === undefined ? "" : `#${slugAnchor(anchor)}`
  return [filePath, anchor]
}

export function slugTag(tag: string) {
  return tag
    .split("/")
    .map((segment) => sluggify(segment))
    .join("/")
}

export function joinSegments(...segments: string[]): string {
  if (segments.length === 0) return ""
  let joined = segments
    .filter((segment) => segment !== "" && segment !== "/")
    .map((segment) => stripSlashes(segment))
    .join("/")
  if (segments[0].startsWith("/")) joined = `/${joined}`
  if (segments.at(-1)!.endsWith("/")) joined = `${joined}/`
  return joined
}

export function getAllSegmentPrefixes(tags: string): string[] {
  const segments = tags.split("/")
  return segments.map((_, index) => segments.slice(0, index + 1).join("/"))
}

export interface TransformOptions {
  strategy: "absolute" | "relative" | "shortest"
  allSlugs: FullSlug[]
}

export function transformLink(
  source: FullSlug,
  target: string,
  options: TransformOptions,
): RelativeURL {
  const targetSlug = transformInternalLink(target)
  if (options.strategy === "relative") return targetSlug
  const folderTail = isFolderPath(targetSlug) ? "/" : ""
  const canonicalSlug = stripSlashes(targetSlug.slice(".".length))
  const [targetCanonical, targetAnchor] = splitAnchor(canonicalSlug)
  if (options.strategy === "shortest") {
    const matches = options.allSlugs.filter((slug) => targetCanonical === slug.split("/").at(-1))
    if (matches.length === 1)
      return (resolveRelative(source, matches[0]) + targetAnchor) as RelativeURL
  }
  return (joinSegments(pathToRoot(source), canonicalSlug) + folderTail) as RelativeURL
}

export function isFolderPath(filePathLike: string): boolean {
  return (
    filePathLike.endsWith("/") ||
    endsWith(filePathLike, "index") ||
    endsWith(filePathLike, "index.md") ||
    endsWith(filePathLike, "index.html")
  )
}

export function endsWith(s: string, suffix: string): boolean {
  return s === suffix || s.endsWith(`/${suffix}`)
}

export function trimSuffix(s: string, suffix: string): string {
  return endsWith(s, suffix) ? s.slice(0, -suffix.length) : s
}

function containsForbiddenCharacters(s: string): boolean {
  return s.includes(" ") || s.includes("#") || s.includes("?") || s.includes("&")
}

export function getFileExtension(s: string): string | undefined {
  return s.match(/\.[A-Za-z0-9]+$/)?.[0]
}

function isRelativeSegment(s: string): boolean {
  return /^\.{0,2}$/.test(s)
}

export function stripSlashes(s: string, onlyStripPrefix?: boolean): string {
  if (s.startsWith("/")) s = s.substring(1)
  if (!onlyStripPrefix && s.endsWith("/")) s = s.slice(0, -1)
  return s
}

function _addRelativeToStart(s: string): string {
  if (s === "") s = "."
  return s.startsWith(".") ? s : joinSegments(".", s)
}
