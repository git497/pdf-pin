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
    })
  }

  function addPin(point) {
    new fabric.Image.fromURL('../data/location.png', imgInstance => {
      imgInstance.top = point.y - imgInstance.height
      imgInstance.left = point.x - imgInstance.width / 2
      imgInstance.lockUniScaling = true
      imgInstance.lockRotation = true
      imgInstance.topRate = point.y / viewport.height
      imgInstance.leftRate = point.x / viewport.width
      imgInstance.opacity = 0.85
      imgInstance.cornerColor = 'green'
      imgInstance.pdfPoint = getPdfPoint(point)
      pinCanvas.add(imgInstance)

      imgInstance.on('selected', e => {
      })

      imgInstance.on('moving', e => {
        imgInstance.topRate = (imgInstance.top + imgInstance.height) / viewport.height
        imgInstance.leftRate = (imgInstance.left + imgInstance.width / 2) / viewport.width
        const point = pinCanvas.getPointer(e.e)
        imgInstance.pdfPoint = getPdfPoint(point)
        imgInstance.setCoords()
      })
    })
  }

  function getPdfPoint(canvasPt) {
    return viewport.convertToPdfPoint(canvasPt.x, canvasPt.y)
  }

  // function zoomOut(delta) {
  // }

  function zoomIn(delta) {
    const currentScale = pdfViewer.currentScale
    const newScale = currentScale + delta
    const factor = newScale / currentScale

    // 更新pdfview: scale、viewport
    pdfViewer.currentScale = newScale
    viewport = page.getViewport(newScale)

    // 更新pinCanvas
    const height = pinCanvas.getHeight()
    const width = pinCanvas.getWidth()
    pinCanvas.setHeight(height * factor)
    pinCanvas.setWidth(width * factor)
    pinCanvas.getObjects().forEach(obj => {
      obj.set('top', viewport.height * obj.topRate - obj.height)
      obj.set('left', viewport.width * obj.leftRate - obj.width / 2)
      obj.setCoords()
    })
    pinCanvas.renderAll()
    pinCanvas.calcOffset()
  }
}

module.exports = Viewer
