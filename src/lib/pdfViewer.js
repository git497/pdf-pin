import {getDocument} from 'pdfjs-dist/webpack'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'
import shortid from 'shortid'

const CSS_UNITS = 96.0 / 72.0

function Viewer(container, options = {}) {
  const self = this
  const {PDFViewer} = PDFJS

  self.load = load

  let viewer = document.createElement("div")
  viewer.id = shortid.generate()
  viewer.style = "position: absolute"
  container.appendChild(viewer)

  let viewport = null
  let pinCanvas = null
  let scale = 1
  let page = null

  let pdfViewer = new PDFViewer({
    container,
    viewer: viewer,
  })

  function load(url) {
    return getDocument(url)
      .then(pdf => {
        return pdf.getPage(1)
          .then(data => {
            page = data
            viewport = page.getViewport(1)
            scale = (container.clientWidth / viewport.width) / CSS_UNITS
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

    let x = document.createElement("canvas");
    x.id = shortid.generate()
    x.width = width;
    x.height = height;
    x.style = "border: medium dashed green"
    container.appendChild(x);

    pinCanvas = new fabric.Canvas(x.id);
    fabric.Object.prototype.transparentCorners = false;

    pinCanvas.on('mouse:dblclick', e => {
      addPin({x: e.e.offsetX, y: e.e.offsetY})
    });

    pinCanvas.on('mouse:wheel', function (e) {
      const delta = e.e.wheelDelta / 3600
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
    let newScale = scale + delta
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
