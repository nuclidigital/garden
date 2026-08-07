const cookieConsentScript = `
(() => {
  const storageKey = "garden-cookie-consent";
  const bannerId = "garden-cookie-consent";

  const getConsent = () => {
    try { return window.localStorage.getItem(storageKey); } catch { return null; }
  };

  const setConsent = (value) => {
    try { window.localStorage.setItem(storageKey, value); } catch {}
  };

  const close = () => {
    const banner = document.getElementById(bannerId);
    if (banner) banner.hidden = true;
  };

  const show = () => {
    let banner = document.getElementById(bannerId);
    if (!banner) {
      banner = document.createElement("section");
      banner.id = bannerId;
      banner.className = "cookie-consent";
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-labelledby", "cookie-consent-title");
      banner.innerHTML =
        '<div class="cookie-consent__panel">' +
        '<div><h2 id="cookie-consent-title">Privacidad y analítica</h2>' +
        '<p>Usamos analítica opcional para conocer el uso del sitio. No se activa hasta que la aceptes.</p></div>' +
        '<div class="cookie-consent__actions">' +
        '<button type="button" class="cookie-consent__reject">Rechazar</button>' +
        '<button type="button" class="cookie-consent__accept">Aceptar analítica</button>' +
        '</div></div>';
      document.body.appendChild(banner);
      banner.querySelector(".cookie-consent__reject").addEventListener("click", () => {
        setConsent("rejected");
        close();
        window.dispatchEvent(new CustomEvent("garden-cookie-consent", { detail: "rejected" }));
      });
      banner.querySelector(".cookie-consent__accept").addEventListener("click", () => {
        setConsent("accepted");
        close();
        window.dispatchEvent(new CustomEvent("garden-cookie-consent", { detail: "accepted" }));
      });
    }
    banner.hidden = false;
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#cookie-settings"]');
    if (!link) return;
    event.preventDefault();
    show();
  });

  if (!getConsent()) show();
})();
`

export default cookieConsentScript
