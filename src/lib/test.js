import shortid from 'shortid'

function Test(container, options = {}) {

  let canvas1 = document.createElement("canvas")
  let canvas2 = document.createElement("canvas")
  canvas1.id = shortid.generate()
  canvas2.id = shortid.generate()
  container.appendChild(canvas1)
  container.appendChild(canvas2)

  canvas1.style.backgroundColor = 'rgba(158, 167, 184, 0.2)'
  canvas2.style.backgroundColor = 'rgba(158, 167, 255, 0.2)'

  var ctx1 = canvas1.getContext('2d')
  var ctx2 = canvas2.getContext('2d')
  // ctx1.save();
  // ctx2.save();
  // ctx1.scale(3, 3);
  ctx1.fillRect(1, 10, 10, 10);
  // ctx1.restore()
  ctx1.fillStyle = 'orange';
  // ctx.font = '48px serif';
  ctx2.fillText('MDN', 1, 10);
  // ctx2.restore();
}

function Tutorial(container) {

  let canvas = document.createElement("canvas")
  container.appendChild(canvas)

  canvas.style.width = 150
  canvas.style.height = 150

  let ctx = canvas.getContext('2d')

  // ctx.fillStyle = 'rgb(200, 0, 0)';
  // ctx.fillRect(10, 10, 50, 50);
  //
  // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
  // ctx.fillRect(30, 30, 50, 50);

  // ctx.fillRect(25, 25, 100, 100);
  // ctx.clearRect(45, 45, 60, 60);
  // ctx.strokeRect(50, 50, 50, 50);

  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ', ' +
        Math.floor(255 - 42.5 * j) + ', 0)';
      ctx.fillRect(j * 25, i * 25, 25, 25);
    }
  }

}

module.exports = Tutorial
