import assert from "node:assert/strict"
import test from "node:test"
import { composerUrl, generateDraft, isShareEligible } from "../../scripts/garden-share.mjs"

const entry = {
  filePath: "cuaderno/prueba.md",
  isIndex: false,
  slug: "cuaderno/prueba",
  data: {
    title: "Una nota en crecimiento",
    description: "Una descripción editorial breve.",
    publish: true,
    draft: false,
  },
}

test("solo ofrece notas editoriales públicas", () => {
  assert.equal(isShareEligible(entry), true)
  assert.equal(isShareEligible({ ...entry, data: { ...entry.data, draft: true } }), false)
  assert.equal(
    isShareEligible({ ...entry, data: { ...entry.data, share: { enabled: false } } }),
    false,
  )
})

test("genera borradores dentro del límite de Bluesky y conserva la canonical", () => {
  const draft = generateDraft(entry, "bluesky")
  assert.ok(Array.from(draft).length <= 300)
  assert.match(draft, /https:\/\/garden\.nuclidigital\.com\/cuaderno\/prueba$/)
})

test("codifica el borrador en el compositor de Bluesky", () => {
  const draft = generateDraft(entry, "bluesky")
  assert.equal(
    composerUrl("bluesky", draft, "https://garden.nuclidigital.com/cuaderno/prueba"),
    `https://bsky.app/intent/compose?text=${encodeURIComponent(draft)}`,
  )
})

test("Mastodon requiere una instancia explícita", () => {
  assert.throws(
    () => composerUrl("mastodon", "texto", "https://example.com", ""),
    /MASTODON_INSTANCE/,
  )
})
