import pdfJS from 'pdfjs-dist/webpack'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'

function Viewer(container, options = {}) {
  const self = this

  self.load = load

  const {getDocument} = pdfJS
  const {PDFViewer} = PDFJS

  let viewer = document.createElement("div")
  viewer.id = "viewer"
  viewer.style = "position: absolute"
  container.appendChild(viewer);
  let pdfViewer = new PDFViewer({
    container,
    viewer: viewer,
  })

  function load(url) {
    getDocument(url)
      .then(pdf => {
        return pdf.getPage(1)
          .then(page => {
            const desiredWidth = container.clientWidth
            let viewport = page.getViewport(1)
            return pdfViewer.setDocument(pdf)
              .then(() => {
                let scale = (desiredWidth / viewport.width) / (96.0 / 72.0)
                pdfViewer.currentScale = scale

                viewport = page.getViewport(scale)
                console.log(viewport)
                let x = document.createElement("canvas");
                x.id = "pin-canvas";
                x.height = viewport.height * (96.0 / 72.0);
                x.width = viewport.width * (96.0 / 72.0);
                container.appendChild(x);

                let pinCanvas = this.__canvas = new fabric.Canvas('pin-canvas');
                fabric.Object.prototype.transparentCorners = false;

                pinCanvas.on('mouse:down', function (e) {
                  new fabric.Image.fromURL('../data/location.png',
                    imgInstance => {
                      imgInstance.top = e.e.offsetY - imgInstance.height
                      imgInstance.left = e.e.offsetX - imgInstance.width / 2
                      imgInstance.lockUniScaling = true
                      imgInstance.lockRotation = true
                      imgInstance.topRange = e.e.offsetY / viewport.height
                      imgInstance.leftRange = e.e.offsetX / viewport.width
                      imgInstance.opacity = 0.85
                      pinCanvas.add(imgInstance)
                    })

                  pinCanvas.renderAll();

                });

                pinCanvas.on('mouse:wheel', function (e) {
                  var delta = e.e.wheelDelta / 3600;
                  scale += delta
                  zoomIn(scale)
                  viewport = page.getViewport(scale);

                  pinCanvas.getObjects().forEach(obj => {
                    console.log(obj)
                    obj.set('top', viewport.height * obj.topRange - obj.height)
                    obj.set('left', viewport.width * obj.leftRange - obj.width / 2)
                  })
                  pinCanvas.renderAll();
                });
              })
          })
      })
  }

  function zoomIn(value) {
    pdfViewer.currentScale = value
  }
}

module.exports = Viewer
