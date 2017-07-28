import {getDocument} from 'pdfjs-dist/webpack'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/compatibility'
import shortid from 'shortid'
import {fabric} from 'fabric'
import normalizeWheel from './normalizeWheel'

PDFJS.disableTextLayer = true
const {PDFViewer} = PDFJS
const CSS_UNITS = 96.0 / 72.0

function Viewer(container, options = {}) {
  const self = this

  self.load = load

  const viewerElem = document.createElement("div")
  viewerElem.id = shortid.generate()
  // viewerElem.style.border = "medium dotted yellow"
  viewerElem.style.position = 'absolute'
  // viewerElem.style.width = container.style.width
  // viewerElem.style.height = container.clientHeight || 500
  // viewerElem.style.overflow = 'auto'
  container.appendChild(viewerElem)

  let viewport = null
  let pinCanvas = null
  let page = null

  const pdfViewer = new PDFViewer({
    container,
    viewer: viewerElem,
  })

  function load(url) {
    return getDocument(url)
      .then(pdf => {
        return pdf.getPage(1)
          .then(data => {
            page = data
            viewport = page.getViewport(1)
            const scale = (container.clientWidth / viewport.width) / CSS_UNITS  //
            viewport = page.getViewport(scale)
            return pdfViewer.setDocument(pdf)
              .then(() => {
                pdfViewer.currentScale = scale
                initPinCanvas(viewport.width * CSS_UNITS, viewport.height * CSS_UNITS)
              })
          })
      })
  }

  function initPinCanvas(width, height) {

    const canvasElem = document.createElement("canvas")
    canvasElem.id = shortid.generate()
    canvasElem.width = width
    canvasElem.height = height
    // canvasElem.style.border = "medium dashed green"
    container.appendChild(canvasElem)

    pinCanvas = new fabric.Canvas(canvasElem.id)
    fabric.Object.prototype.transparentCorners = false

    pinCanvas.on('mouse:dblclick', e => {
      const point = pinCanvas.getPointer(e.e)
      // const point = {x: e.e.offsetX, y: e.e.offsetY}
      addPin(point)
    })

    pinCanvas.on('mouse:wheel', e => {
      const delta = normalizeWheel(e.e).pixelY / 3600
      zoomIn(delta)

      viewport = page.getViewport(pdfViewer.currentScale)
      pinCanvas.getObjects().forEach(obj => {
        obj.set('top', viewport.height * obj.topRange - obj.height)
        obj.set('left', viewport.width * obj.leftRange - obj.width / 2)
        obj.setCoords()

        // const [x, y] = obj.pdfPoint
        // const [top, left] = viewport.convertToViewportPoint(x, y)
        // obj.set('top', top - obj.height)
        // obj.set('left', left - obj.width / 2)
      })
      pinCanvas.renderAll()
    })
  }

  function addPin(point) {
    new fabric.Image.fromURL('../data/location.png', imgInstance => {
      imgInstance.top = point.y - imgInstance.height
      imgInstance.left = point.x - imgInstance.width / 2
      imgInstance.lockUniScaling = true
      imgInstance.lockRotation = true
      imgInstance.topRange = point.y / viewport.height
      imgInstance.leftRange = point.x / viewport.width
      imgInstance.opacity = 0.85
      // imgInstance.setCoords()
      imgInstance.cornerColor = 'green'

      // const pdfPoint = viewport.convertToPdfPoint(point.x, point.y)
      // imgInstance.pdfPoint = pdfPoint
      pinCanvas.add(imgInstance)

      imgInstance.on('selected', e => {
        console.log('event: selected')
      })

      imgInstance.on('moving', e => {
        const point = pinCanvas.getPointer(e.e)
        // imgInstance.set('top', point.y - imgInstance.height)
        // imgInstance.set('left', point.x - imgInstance.width / 2)
        imgInstance.topRange = (imgInstance.top + imgInstance.height) / viewport.height
        imgInstance.leftRange = (imgInstance.left + imgInstance.width / 2) / viewport.width
        imgInstance.setCoords()
        console.log('event: moving')
      })

    })


  }

  // function zoomOut(delta) {
  // }

  function zoomIn(delta) {
    const currentScale = pdfViewer.currentScale
    const newScale = currentScale + delta
    const factor = newScale / currentScale
    pdfViewer.currentScale = newScale

    const height = pinCanvas.getHeight()
    const width = pinCanvas.getWidth()
    pinCanvas.setHeight(height * factor);
    pinCanvas.setWidth(width * factor);
    pinCanvas.renderAll();
    pinCanvas.calcOffset();
  }
}

module.exports = Viewer
