import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import CookieConsent from "../CookieConsent"
import SiteBrand from "../SiteBrand"
import SiteNav from "../SiteNav"
import AreaNav from "../AreaNav"
import SocialLinks from "../SocialLinks"

const Header = HeaderConstructor()
const CookieConsentComponent = CookieConsent()
const SiteBrandComponent = SiteBrand()
const SiteNavComponent = SiteNav()
const AreaNavComponent = AreaNav()
const SocialLinksComponent = SocialLinks()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer: Footer,
  }: PageFrameProps) {
    return (
      <>
        {/* El lateral izquierdo va primero en el DOM, así que el teclado
            atraviesa marca, buscador, redes y explorador antes del artículo. */}
        <a class="skip-link" href="#garden-content">
          Saltar al contenido
        </a>
        {/* `SocialLinks` se pinta al final pero `custom.scss` lo reordena con
            `order` para que quede justo encima de «Entradas recientes». */}
        <div class="left sidebar">
          <SiteBrandComponent {...componentData} />
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
          <SocialLinksComponent {...componentData} />
        </div>
        <div class="center" id="garden-content" tabIndex={-1}>
          <SiteNavComponent {...componentData} />
          <AreaNavComponent {...componentData} />
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>
        <div class="right sidebar">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <Footer {...componentData} />
        <CookieConsentComponent {...componentData} />
      </>
    )
  },
}
