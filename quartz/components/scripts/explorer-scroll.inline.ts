/**
 * Al cargar, el explorador llama a `scrollIntoView()` sobre el archivo activo.
 * Sin argumentos esa llamada equivale a `{ block: "start" }`, que alinea el
 * elemento con el borde superior del viewport *aunque ya se esté viendo*: en un
 * raíl lateral alto eso desplaza el documento varios cientos de píxeles y el
 * artículo aparece empezado por la mitad.
 *
 * No hay forma de desactivarlo desde CSS —`scrollIntoView` recorre todos los
 * contenedores desplazables hasta el documento—, así que se reescribe la
 * llamada solo para los nodos del explorador: `block: "nearest"` no mueve nada
 * si el elemento ya es visible. El resto del sitio conserva el comportamiento
 * nativo.
 *
 * Se evalúa antes que el router SPA, que es quien dispara el evento `nav` en el
 * que el explorador se inicializa.
 */
const nativeScrollIntoView = Element.prototype.scrollIntoView

Element.prototype.scrollIntoView = function (
  this: Element,
  options?: boolean | ScrollIntoViewOptions,
) {
  if (this.closest(".explorer")) {
    return nativeScrollIntoView.call(this, { block: "nearest", inline: "nearest" })
  }
  return nativeScrollIntoView.call(this, options as ScrollIntoViewOptions)
}
