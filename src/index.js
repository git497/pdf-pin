import './simple.html'
import App from './lib/app'
import PdfViewer from './lib/pdfViewer'
import Test from './lib/test'

window.onload = () => {

  const container = document.getElementById('root')
  const url = 'data/HYG.pdf'
  let app = new PdfViewer(container)
  app.load(url)
}
