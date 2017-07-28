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
  viewerElem.style.position = 'absolute'
  container.appendChild(viewerElem)

  let viewport = null
  let pinCanvas = null
  let scale = 1
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
            scale = (container.clientWidth / viewport.width) / CSS_UNITS  //
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
    canvasElem.style.border = "medium dashed green"
    container.appendChild(canvasElem)

    pinCanvas = new fabric.Canvas(canvasElem.id)
    fabric.Object.prototype.transparentCorners = false

    pinCanvas.on('mouse:dblclick', e => {
      addPin({x: e.e.offsetX, y: e.e.offsetY})
    })

    pinCanvas.on('mouse:wheel', function (e) {
      const delta = normalizeWheel(e.e).pixelY / 3600
      zoomIn(delta)
      viewport = page.getViewport(scale);

      pinCanvas.getObjects().forEach(obj => {
        // console.log(obj)
        obj.set('top', viewport.height * obj.topRange - obj.height)
        obj.set('left', viewport.width * obj.leftRange - obj.width / 2)
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
      pinCanvas.add(imgInstance)
    })
  }

  function zoomIn(delta) {
    const newScale = scale + delta
    const factor = scale / newScale
    scale = newScale
    pdfViewer.currentScale = scale

    // pinCanvas.setHeight(pinCanvas.getHeight() * factor);
    // pinCanvas.setWidth(pinCanvas.getWidth() * factor);
    // pinCanvas.renderAll();
    // pinCanvas.calcOffset();
  }
}

module.exports = Viewer
