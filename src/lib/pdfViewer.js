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
    viewer:document.getElementById('viewer'),
  })

  function load(url) {
    getDocument(url)
      .then(document => {
        pdfViewer.setDocument(document)
      })
  }
}

module.exports = Viewer
