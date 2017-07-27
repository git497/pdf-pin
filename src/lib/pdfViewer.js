import pdfJS from 'pdfjs-dist/webpack'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'

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
      .then(document => {
        return document.getPage(1)
          .then(page => {
            const desiredWidth = container.clientWidth
            let viewport = page.getViewport(1)
            return pdfViewer.setDocument(document)
              .then(() => {
                const scale = (desiredWidth / viewport.width) / (96.0 / 72.0)
                pdfViewer.currentScale = scale
              })
          })
      })
  }

  function zoomIn(value) {
    pdfViewer.currentScale = value
  }
}

module.exports = Viewer
