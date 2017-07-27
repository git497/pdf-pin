import pdfJS from 'pdfjs-dist/webpack'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'
import $ from '../../node_modules/jquery/dist/jquery'


function Viewer(container, options = {}) {
  const self = this
  console.log(PDFJS)
  console.log(pdfJS)

  self.load = load

  const {getDocument} = pdfJS
  const {PDFViewer} = PDFJS

  let pdfViewer = new PDFViewer({
    container,
    viewer: document.getElementById('viewer'),
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

                let x = document.createElement("canvas");
                x.id = "pin-canvas";
                x.height = viewport.height;
                x.width = viewport.width;
                document.body.appendChild(x);

                let pinCanvas = this.__canvas = new fabric.Canvas('pin-canvas');
                fabric.Object.prototype.transparentCorners = false;

                pinCanvas.on('mouse:down', function (e) {
                  new fabric.Image.fromURL('../data/location.png',
                    imgInstance => {
                      pinCanvas.add(imgInstance);
                    }, {
                      top: e.e.offsetY,
                      topRange: (e.e.offsetY / viewport.height),
                      left: e.e.offsetX,
                      leftRange: (e.e.offsetX / viewport.width),
                      lockUniScaling: true,
                      lockRotation: true,
                      opacity: 0.85
                    })
                  pinCanvas.renderAll();

                });

                $(pinCanvas.wrapperEl).on('mousewheel', function (e) {
                  var delta = e.originalEvent.wheelDelta / 1200;
                  scale += delta
                  zoomIn(scale)
                  viewport = page.getViewport(scale);

                  pinCanvas.getObjects().forEach(obj => {
                    console.log(obj)
                    obj.set('top', (viewport.height ) * obj.topRange)
                    obj.set('left', (viewport.width ) * obj.leftRange)
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
