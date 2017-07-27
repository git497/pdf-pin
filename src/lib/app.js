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
    })
  }

  function initFcanvas() {
    const bg = self.canvas.toDataURL("image/png")
    const fcanvas = new fabric.Canvas(self.canvas.id, {selection: false})

    fcanvas.setBackgroundImage(bg, () => fcanvas.renderAll())

    fcanvas.on('mouse:dblclick', event => {
      const point = fcanvas.getPointer(event.e)
      addPin(point.x, point.y)
    })

    pan()

    var zoomLevel = 0;
    var zoomLevelMin = 0;
    var zoomLevelMax = 3;

    fcanvas.on('mouse:wheel', event => {
      const delta = event.e.wheelDelta;
      if (delta !== 0) {
        const pointer = fcanvas.getPointer(event.e, true);
        const point = new fabric.Point(pointer.x, pointer.y);
        if (delta > 0) {
          zoomIn(point);
        } else if (delta < 0) {
          zoomOut(point);
        }
      }

      function zoomIn(point) {
        if (zoomLevel < zoomLevelMax) {
          zoomLevel++;
          fcanvas.zoomToPoint(point, Math.pow(2, zoomLevel));
          // keepPositionInBounds(canvas);
        }
      }

      function zoomOut(point) {
        if (zoomLevel > zoomLevelMin) {
          zoomLevel--;
          fcanvas.zoomToPoint(point, Math.pow(2, zoomLevel));
          // keepPositionInBounds(canvas);
        }
      }
    })

    self.fcanvas = fcanvas

    function pan() {
      let panning = false
      fcanvas.on('mouse:up', function (e) {
        panning = false
      })

      fcanvas.on('mouse:down', function (e) {
        panning = true
      })

      fcanvas.on('mouse:move', function (e) {
        if (panning && e && e.e) {
          const units = 10
          const delta = new fabric.Point(e.e.movementX, e.e.movementY)
          fcanvas.relativePan(delta)
        }
      })
    }
  }
}

export default App
