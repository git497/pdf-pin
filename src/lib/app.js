import {fabric} from 'fabric'
import pdfJS from 'pdfjs-dist/webpack'
import shortid from 'shortid'

function App(container, options = {}) {
  const self = this

  self.load = load
  self.addPin = addPin
  self.canvas = null
  self.fcanvas = null
  self.pinUrl = options.pinUrl || 'data/location.png'

  let canvas = document.createElement("canvas")
  canvas.id = shortid.generate()
  container.appendChild(canvas)
  self.canvas = canvas

  function load(pdfPath) {
    return pdfJS.getDocument(pdfPath)
      .then(pdf => {
        const pageNumber = 1
        return pdf.getPage(pageNumber)
      })
      .then(page => {

        const desiredWidth = container.clientWidth
        let viewport = page.getViewport(1)
        const scale = desiredWidth / viewport.width
        viewport = page.getViewport(scale)

        self.canvas.height = viewport.height
        self.canvas.width = viewport.width
        const context = self.canvas.getContext('2d')
        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        return page.render(renderContext)
      })
      .then(() => {
        initFcanvas()
      })
  }

  function addPin(x, y) {
    fabric.Image.fromURL(self.pinUrl, function (oImg) {
      oImg.left = x - oImg.width / 2
      oImg.top = y - oImg.height / 2
      self.fcanvas.add(oImg)
    });
  }

  function initFcanvas() {
    const bg = self.canvas.toDataURL("image/png")
    let fcanvas = new fabric.Canvas(self.canvas.id, {selection: false})
    fcanvas.setBackgroundImage(bg, () => fcanvas.renderAll())
    fcanvas.on('mouse:dblclick', data => addPin(data.e.offsetX, data.e.offsetY))
    self.fcanvas = fcanvas
  }
}

export default App
