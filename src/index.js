import './index.html'
import Viewer from './lib/viewer'

window.onload = () => {
  const container = document.getElementById('container')
  new Viewer(container).load('data/HYG.pdf')
}
