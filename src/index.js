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
      .then(pin => {
        printObj(pin)
      })
  })

  viewer.on('mouse:down', (e, pt, pin) => {
    console.log(`mouse down ${printObj(e)}, ${printObj(pt)}, ${printObj(pin)}`)
  })

  viewer.on('mouse:up', (e, pt, pin) => {
    console.log(`mouse up ${printObj(e)}, ${printObj(pt)}, ${printObj(pin)}`)
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

  viewer.on('object:selected', pin => {
    console.log(`object selected ${printObj(pin)}`)
  })

  function printObj(o) {
    return JSON.stringify(o, null, 2)
  }
}
