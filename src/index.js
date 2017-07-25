import './simple.html'
import App from './lib/app'

window.onload = () => {

  const container = document.getElementById('root')
  const url = 'data/HYG.pdf'
  let app = new App(container)
  app.load(url)
}
