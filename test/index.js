import './index.html'
import Viewer from '../src/viewer'

window.onload = () => {
  const container = document.getElementById('container')
  const viewer = new Viewer(container)
  viewer.load('drawing.pdf')

  viewer.on('mouse:dblclick', (e, pt) => {
    console.log(`mouse double click ${printObj(e)}, ${printObj(pt)}`)
    const imgURL = 'pin.png' // or null
    const textOptions = {
      text: '0',
      fontSize: 20, // optional
      color: 'black', // optional
      fontFamily: 'Comic Sans', // optional
      fontWeight: 'normal' // optional
    }
    const extraData = {_id: 'i am id'}
    viewer.addPin(pt, imgURL, textOptions, extraData)
      .then(pin => {
        console.log(pin.index)
        // viewer.removePin(pin.index)
        // viewer.addPinWithPdfPoint(pin.pdfPoint, imgURL, textOptions, extraData) // test addPinWithPdfPoint
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

  viewer.on('object:moving', pin => {
    console.log(`object moving ${printObj(pin)}`)
  })

  function printObj(o) {
    return JSON.stringify(o, null, 2)
  }
}
