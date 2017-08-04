import shortid from 'shortid'
import 'pdfjs-dist/web/compatibility'
import {PDFJS} from 'pdfjs-dist/web/pdf_viewer'
import {getDocument} from 'pdfjs-dist/webpack'
import {fabric} from 'fabric'
import EventEmitter from 'eventemitter3'
import normalizeWheel from './normalizeWheel'

fabric.devicePixelRatio = 1 // Retina issue
PDFJS.disableTextLayer = true
const {PDFViewer} = PDFJS
const CSS_UNITS = 96.0 / 72.0

function Viewer(container, options = {}) {
  EventEmitter.call(this)
  const self = this

  self.load = load
  self.addPin = addPin // 使用当前屏幕坐标插入图钉
  self.addPinWithRate = addPinWithRate // 使用相对于viewport的横向、纵向比插入图钉
  self.addPinWithPdfPoint = addPinWithPdfPoint // 使用pdf中的坐标值插入图钉
  self.removePin = removePin
  self.zoomIn = zoomIn
  self.zoomOut = zoomOut

  self.pinImgURL = options.pinImgURL ||
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAvCAYAAABt7qMfAAAJKklEQVRYR61YfXBU1RX/nfdYEoyQooKY7AappaWDBUuKu+8ljKGVFMpQsQOCfLT8g6NQC1ItVSvy0TLaGaso2kFrrJXWqSgWYaCIpZnKvrcJRGescawoluwGUygfgkCy+947nfNyN25eNiSLPX8l+84593fPPR+/ewn9lLZx40oyJSW1xHyjRzSeiCrAfBmASwCcB3ACzCkA/yTgjY5MZvc1TU2f9sc99aXUZprDM0AtmOcCqAZQ2pcNgM8AWABeYk3bVRGPH7mQTa8gmseOHThkyJBZRLSCmccDGBBw5IFIdp8GEAIwNK8O0Axgg55Ov1jW1HQuH5i8ID6qrCwdGArdC6IfAyjJMTzhh5v5gEf0HjE3a7p+ymUeogFjGLiWmScQIKCH5diliehZraNjVVlT03+DQHqAaJ04MeLp+noQzQeQ/d4C5hcBvBo6d+7dEe+8c7a38CYNY5DO/HWX6CYA4uOarC4RvaYxryyz7fdz7buB+Lim5ksDOjqeAzCzS4n576Tr94Xj8UQ/cqGbSso0r2Pm9QCm5myoPkQ0Z4RlHe0Cl/3j4LRpRcWnTq0GsFIZuGCuC2naL3INCgVyuLp6qOY4q0F0h8odcfFk6OzZldmIdkUiaZoLwPw0gEGixcCmQZp2z7B4/EyhCwf15YiIeR0TrVAbdBhYXmHbT4quD+JQNHplSNO2A5ioHOwNEd3aWwQYoLZJk65wHGeE53mleih0Jp3JtI1qaDhGgJcPtESEXPd5Amao78060fQyyzrsg2iJxRZJ9gLQAJz2PG/WyIaGPfmc/XvSpKt0x7kdwM0ARqhm1U7AUSbarmUyG8v370/ms02ZpsHMfwEw3P/O/JNIIvEEHauqGtzBvJmZv6+O4dGj6fTKbzU1ZYKOUqY53WNeS8A3cxItqNYM5lWRRGJr8INEMBWLrQKR5J5Ifcbz5lLSMGRHzwMYDOC4zlxblki8ledcJcMlWmU5304DkJy5NNBJjzGwrMK2pay7yRHDGOMCbwAoByCNbgmlTPMRZpaEEflHUVHR9OH19dJ2uyQVjYY9TdtGwAT1YyuYn9GI9njAUdK0K9jzagDcBmCUr0P0AZinR2z7w1xffhWePLkVRN/z1Zifo2QsthdEk5XihohtLw+ibzHNJcTsZ7LkDAM/qrBtOdtu0hqLyXD7U7ZbEvP94URC+kQ3SZrmajA/qH58W47jAwCjFfplEct6PNeCZ8/WW5PJzUwkA0yS6fFwcfFPqb7eCTr3z9wwHgAgZ05g3tk+dOgPRu/a1ZGrqwqhTuXVEQEhE+4qdJbWwohty0665GA0OqSYaDeIYgDOep43dWRDw74ggOz/qerq8ey6fwNwOYD3QkSTg6WejMWmgUgiORBAhyBvY+BKAC4xzwsnEi/lLiD1rXveHmauBHBSZ74xX+JmbZLR6GhoWr1K4EPkeTeEGxqEZ3RJi2kKL3kNQJG/btIwDgL4igq1X7e5BtLtAOwA8G0AGQLmh217S2+ROByNTtE0TXYpZKcxnU7XBslNyjQXMrNUJBHwH6mO15l5ijgl5qfCicTSHolkGAJMxjqIaA8c59ZwY+PxoJ7qOc8w8xz17YWwbS8KdtEW0/wVMd+ndA7IcaxlQJJJpNHT9akj9+07mSd80nyEWzCYf8e6vjqXMX0yadIwx3HuV2B1vwcQzYtY1iu5vhRNlKOQyIpspFRV1WT2vD+rsvqUNG1qcGwfqay8xA2FNoFoQY5Dm5lf1oAUE0liy/i/IdtJGdieSacXBo8iaRjfQGezktb9GYgWkU/jSkvrwCwERErw4XAicS/5g/Rz8bkm86MA5gWOwQUgO+8SATCA6E4ZTj2O1jRXgvkh9fuOds+b7w8wlSi/VwOs1dO0746Mx4UbdpPU9ddfzpomvV96RucQ6i4nQLTVyWQeGLV/f1vw4+Hq6i9rnrcLzF/190u0tMKynvJBHKmurnBd93UAX1OGD0Zse22eRcA1NQM+aW8f5wA1BIwB0aUgErr3ITyv/vSZM2+PbW6WmdBDkoaxDMBj6kOLpmm15fH4v7pITYth/IaAu5TCu47jTMm3m6BnBrTeOESurqKOOwEY6ve6sG0vFtvPQZjmRGJ+GUAFAGnJt0dsW6bm/0VShjGbgT8AKAZwjIjmhi1rrzjvRnQD5fo+ue5N4cZGmS1fSJKGIWP71SxzY+CxiG2vyCZ/dxCdfX+XmiWycK+5UQgqlQtSWbLecSKaEbYsO+ujGwg1BUVZEkjkI0/Xa0fu23eokEVzdVuqqsrI8/4KQPqDzx/KI5HFtGWLlLYvPS4/agBJd7y2U4PWhMvL1+UaFQIoZRjLGXhElf8hnXl2cADmvQYqErNRgTzFwNwK295dyOKi2xqLVXlEkuxCiGVDP49Y1sNBP/lBSAhddyeI5E4pXfQVp7h4waj6+vb+ApF+0ppOyzBbpGwOqrnU42h7vZW3xGJziGiTIrDnifmOcCIh47df0mIYM6mzJIVAnyei5WHLkstVD+kVhOwk2dHxLAE/zO4Enjc90tAg/OOCIsSYOy9T1ynFrU5R0fzeInnBR5IjsdgEl0icddJ8oifC5eV39ZWkKdP8JTPLWBc5zpp2c0U8/mZvyC8Iwi9Z03wIzD9TDo5pwMxy25ZXmLySjEbHQdd3gDmiFJ4Oh8NLLgS8z+cif3Lq+mZ1vRe/luY4c/Nd9dS4l2k8TQF4kzxvXpBjBtH3CUIMFDEVhiQ3LamW1ZFEYk3QWUsstoKIpCeIdMhDS5BZ5Qtfv0AI8SkdPHg9E8nFSAhMijRtdi4DU4xJ5kP2ZaZOT6fv7O2dKhdMv0CIQdIwLiOibcwsL3hCu+Ku48ySce8/hLjuH7PHwMBb0LQZfb3aZYH0G4R/LN1r32/pEctarY7h1ypK7SBaHLEsyaN+SUEg/C7Y3r6BiZaId7kzeMA6DbibgavVii84RUW3FdJdCwIhi6hHErnyC7MWEWonFx3xdcB13Vuubmz8uF8hUEoFgxC7lGF8hwGpltzX3XNMNK/CsrYVAkBFtFAT4EBlZWj4wIFrCLhHveLKZfq3TlHR3YUcw0UlZi5cuUmlS0rqCLhFngC8AQMWBG9u/d3eRR1H1nkyFqsBkbzILQ3btlyaL0r+B7tw5ax4J5d3AAAAAElFTkSuQmCC'

  const viewerElem = document.createElement("div")
  viewerElem.id = shortid.generate()
  viewerElem.style.position = 'absolute'
  container.appendChild(viewerElem)

  let viewport = null
  let pinCanvas = null
  let page = null

  const pdfViewer = new PDFViewer({
    container,
    viewer: viewerElem,
  })

  function load(url) {
    return getDocument(url)
      .then(pdf => {
        return pdf.getPage(1)
          .then(data => {
            page = data
            viewport = page.getViewport(1)
            const scale = (container.clientWidth / viewport.width) / CSS_UNITS  //
            viewport = page.getViewport(scale)
            return pdfViewer.setDocument(pdf)
              .then(() => {
                pdfViewer.currentScale = scale
                initPinCanvas(viewport.width * CSS_UNITS, viewport.height * CSS_UNITS)
              })
          })
      })
  }

  function initPinCanvas(width, height) {

    const canvasElem = document.createElement("canvas")
    canvasElem.id = shortid.generate()
    canvasElem.width = width
    canvasElem.height = height
    // canvasElem.style.border = "medium dashed green"
    container.appendChild(canvasElem)

    pinCanvas = new fabric.Canvas(canvasElem.id)
    pinCanvas.selection = false

    fabric.util.addListener(document.getElementsByClassName('upper-canvas')[0], 'contextmenu', e => {
      const point = pinCanvas.getPointer(e)
      const o = pinCanvas.findTarget(e)
      self.emit('contextmenu', e, point, o)
      e.preventDefault()
    })

    pinCanvas.on('mouse:dblclick', e => {
      // const point = {x: e.e.offsetX, y: e.e.offsetY}
      const point = pinCanvas.getPointer(e.e)
      self.emit('mouse:dblclick', e.e, point)
      e.e.preventDefault()
    })

    pinCanvas.on('mouse:up', e => {
      const point = pinCanvas.getPointer(e.e)
      const o = pinCanvas.findTarget(e.e)
      self.emit('mouse:up', e.e, point, o)
      e.e.preventDefault()
    })

    pinCanvas.on('mouse:down', e => {
      const point = pinCanvas.getPointer(e.e)
      const o = pinCanvas.findTarget(e.e)
      self.emit('mouse:down', e.e, point, o)
      e.e.preventDefault()
    })

    pinCanvas.on('mouse:wheel', e => {
      const delta = normalizeWheel(e.e).pixelY / 3600
      self.emit('mouse:wheel', e.e, delta)
      e.e.preventDefault()
    })

    pinCanvas.on('object:selected', e => {
      const img = e.target
      self.emit('object:selected', img)
    })
  }

  function addPin(point, pinImgURL, textOptions = {}, extraData = {}) {
    if (pinImgURL) {
      self.pinImgURL = pinImgURL
    }

    if (!textOptions.text) {
      return addImage(self.pinImgURL)
    }

    return generatePicWithText(self.pinImgURL, textOptions)
      .then(addImage)

    function addImage(url) {
      return new Promise(resolve => {
        fabric.Image.fromURL(url, img => {
          img.top = point.y - img.height
          img.left = point.x - img.width / 2
          img.topRate = point.y / viewport.height
          img.leftRate = point.x / viewport.width
          img.opacity = 0.85
          img.hasControls = false
          img.hasRotatingPoint = false
          const [x, y] = getPdfPoint(point)
          img.pdfPoint = {x, y}
          img.index = pinCanvas.size()
          img.on('moving', e => movePin(e, img))
          Object.assign(img, extraData)
          pinCanvas.add(img)
          resolve(img)
        })
      })
    }
  }

  function generatePicWithText(imgURL, textOptions) {
    return new Promise(resolve => {
      fabric.Image.fromURL(imgURL, img => {
        const canvasPic = document.createElement("canvas")
        canvasPic.id = shortid.generate()
        canvasPic.width = img.width
        canvasPic.height = img.height
        canvasPic.style.display = 'none'
        container.appendChild(canvasPic)

        const c = new fabric.Canvas(canvasPic.id)
        img.left = 0
        img.top = 0
        c.add(img)

        const text = new fabric.Text(textOptions.text, {
          fontSize: textOptions.fontSize || 20,
          fill: textOptions.color || 'red',
          fontFamily: textOptions.fontFamily || 'Comic Sans',
          fontWeight: textOptions.fontWeight || 'normal'
        })
        text.left = img.left + (img.width - text.width) / 2
        text.top = img.top + (img.height - text.height) / 2.5 // 中间偏上一点(根据图钉图片需要微调)
        c.add(text)

        resolve(c.toDataURL())
        c.dispose()
        container.removeChild(canvasPic)
      })
    })
  }

  function addPinWithPdfPoint(pdfPt, pinImgURL, textOptions, extraData) {
    const [x, y] = viewport.convertToViewportPoint(pdfPt.x, pdfPt.y)
    const viewportPt = {x, y}
    return addPin(viewportPt, pinImgURL, textOptions, extraData)
  }

  function addPinWithRate(leftRate, topRate, pinImgURL, textOptions, extraData) {
    const viewportPt = {
      x: leftRate * viewport.width,
      y: topRate * viewport.height
    }
    return addPin(viewportPt, pinImgURL, textOptions, extraData)
  }

  function removePin(index) {
    const o = pinCanvas.item(index)
    if (o) {
      pinCanvas.remove(o)
      if (o.text) {
        pinCanvas.remove(o.text)
      }
    }
  }

  function zoomOut(delta) {
  }

  function zoomIn(delta) {
    const currentScale = pdfViewer.currentScale
    const newScale = currentScale + delta
    const factor = newScale / currentScale

    // update pdfView: scale, viewport
    pdfViewer.currentScale = newScale
    viewport = page.getViewport(newScale)

    // update pinCanvas
    const height = pinCanvas.getHeight()
    const width = pinCanvas.getWidth()
    pinCanvas.setHeight(height * factor)
    pinCanvas.setWidth(width * factor)
    pinCanvas.getObjects().forEach(obj => {
      obj.set('top', viewport.height * obj.topRate - obj.height)
      obj.set('left', viewport.width * obj.leftRate - obj.width / 2)
      obj.setCoords()
    })
    pinCanvas.renderAll()
    pinCanvas.calcOffset()
  }

  function getPdfPoint(canvasPt) {
    return viewport.convertToPdfPoint(canvasPt.x, canvasPt.y)
  }

  function movePin(e, img) {
    img.topRate = (img.top + img.height) / viewport.height
    img.leftRate = (img.left + img.width / 2) / viewport.width
    const [x, y] = getPdfPoint({
      x: img.left + img.width / 2,
      y: img.top + img.height,
    })
    img.pdfPoint = {x, y}
    img.setCoords()
    self.emit('object:moving', img)
  }
}

Viewer.prototype = Object.create(EventEmitter.prototype)
Viewer.prototype.constructor = Viewer

export default Viewer
