import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import {
  canonicalUrl,
  isLandingSlug,
  isSourcePage,
  pageDate,
  robotsDirective,
  structuredData,
} from "../util/gardenSeo"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
// @ts-expect-error - inline script imported as string by esbuild loader
import explorerOverlayScript from "./scripts/explorer-overlay.inline.ts"
// @ts-expect-error - inline script imported as string by esbuild loader
import linkReliabilityScript from "./scripts/link-reliability.inline.ts"
// @ts-expect-error - inline script imported as string by esbuild loader
import explorerScrollScript from "./scripts/explorer-scroll.inline.ts"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
    allFiles,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    const pageUrl = canonicalUrl(cfg, fileData.slug ?? "index")
    const rssUrl = new URL("index.xml", canonicalUrl(cfg, "index")).href
    const robots = robotsDirective(fileData, allFiles)
    const isArticle =
      isSourcePage(fileData) &&
      !isLandingSlug(fileData.slug ?? "") &&
      fileData.slug !== "sobre-mi" &&
      !fileData.slug?.startsWith("tags/")
    const published = pageDate(fileData, "published")
    const modified = pageDate(fileData, "modified")
    const schema = JSON.stringify(
      structuredData(cfg, fileData, allFiles, title, description),
    ).replace(/</g, "\\u003c")

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        {fileData.hasMermaidDiagram && (
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="google-site-verification"
          content="rQ9hd-VIG6mfpvktYAP06b-HG2AJGfTnKIseOBgHw8w"
        />
        {/* El sitio es solo oscuro: se lo decimos al navegador para que pinte
            controles de formulario, barras de scroll y el fondo inicial en
            oscuro, sin destello blanco antes de aplicar el CSS. */}
        <meta name="color-scheme" content="dark" />

        <link rel="canonical" href={pageUrl} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${cfg.pageTitle ?? "Garden Digital"} RSS`}
          href={rssUrl}
        />
        <meta name="robots" content={robots} />

        <meta property="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={pageUrl}></meta>
            <meta property="twitter:url" content={pageUrl}></meta>
          </>
        )}

        {isArticle && published && (
          <meta property="article:published_time" content={published.toISOString()} />
        )}
        {isArticle && modified && (
          <meta property="article:modified_time" content={modified.toISOString()} />
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  // Head es el único componente local que el emisor `componentResources`
  // recoge automáticamente, así que los scripts propios cuelgan de aquí.
  Head.afterDOMLoaded = [explorerScrollScript, explorerOverlayScript, linkReliabilityScript]
  return Head
}) satisfies QuartzComponentConstructor
