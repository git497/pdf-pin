import './index.html'
import Viewer from './lib/viewer'

window.onload = () => {
  const container = document.getElementById('container')
  const viewer = new Viewer(container)
  viewer.load('data/helloworld.pdf')

  viewer.on('mouse:dblclick', (e, pt) => {
    console.log(`mouse double click ${printObj(e)}, ${printObj(pt)}`)
    viewer.addPin(pt, null, {
      text: '6',
      fontSize: 20, // optional
      color: 'black', // optional
      fontFamily: 'Comic Sans', // optional
      fontWeight: 'normal' // optional
    })
  })

  viewer.on('mouse:down', (e, pt) => {
    console.log(`mouse down ${printObj(e)}, ${printObj(pt)}`)
  })

  viewer.on('contextmenu', (e, pt, pin) => {
    console.log(`contextmenu ${printObj(e)}, ${printObj(pt)}`)
    if (pin) {
      console.log(`${printObj(pin)}`)
    }
  })

  viewer.on('mouse:wheel', (e, delta) => {
    console.log(`mouse wheel ${printObj(delta)}`)
    viewer.zoomIn(delta)
  })

  viewer.on('object:selected', (key, obj) => {
    console.log(`object selected ${printObj(obj)}`)
  })

  function printObj(o) {
    return JSON.stringify(o, null, 2)
  }
}
