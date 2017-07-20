'use strict';

PDFJS.workerSrc = 'lib/pdfjs-1.7.225-dist/build/pdf.worker.js';
PDFJS.disableWorker = false;

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = 'helloworld.pdf';

var canvasState;
var viewport;

// Disable workers to avoid yet another cross-origin issue (workers need
// the URL of the script to be loaded, and dynamically loading a cross-origin
// script does not work).
// PDFJS.disableWorker = true;

// The workerSrc property shall be specified.
// Asynchronous download of PDF

var loadingTask = PDFJS.getDocument(url);
loadingTask.promise.then(function (pdf) {
  console.log('PDF loaded');

  // Fetch the first page
  var pageNumber = 1;
  pdf.getPage(pageNumber).then(function (page) {
    console.log('Page loaded');

    var scale = 1;
    viewport = page.getViewport(scale);

    // Prepare canvas using PDF page dimensions
    var canvas = document.getElementById('viewerContainer');
    var context = canvas.getContext('2d');

    // let sw = canvas.width/viewport.width;
    // let sh = canvas.height/viewport.height;

    // scale = sw;


    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var canvasPin = document.getElementById('canvasPin');
    canvasPin.height = viewport.height;
    canvasPin.width = viewport.width;

    // canvas.addEventListener('click', function (event) {
    //   var pos = getMousePos(canvas, event);
    //   addcircle(pos.x, pos.y, 30);

    //   console.log("pos——x=" + pos.x + "  pos——y=" + pos.y);
    //   var point = viewport.convertToPdfPoint(pos.x, pos.y);
    //   console.log(point);
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    // }, false);

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.then(function () {
      console.log('Page rendered');
      init();
    });

  });
}, function (reason) {
  // PDF loading error
  console.error(reason);
});

function addcircle(centerX, centerY, radius) {
  var canvas = document.getElementById('viewerContainer');
  var context = canvas.getContext('2d');

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#003300';
  context.stroke();
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, id) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x
  this.image = new Image();
  this.image.src = "location.png";
  this.x = x || 0;
  this.y = y || 0;
  this.id = id || 0;
}

// Draws this shape to a given context
Shape.prototype.draw = function (ctx) {
  ctx.drawImage(this.image, this.x, this.y);
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function (mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return (this.x <= mx) && (this.x + this.image.width >= mx) &&
    (this.y <= my) && (this.y + this.image.height >= my);
}

function CanvasState(canvas) {
  // **** First some setup! ****

  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');
  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
    this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
    this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
    this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****

  this.valid = false; // when set to false, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;

  // **** Then events! ****

  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  var mySelId = "";

  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function (e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  function selectStartEvent(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l - 1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {

        // alert("mousedown");

        var mySel = shapes[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        myState.mySelId = mySel.id;
        return;
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }
  canvas.addEventListener('mousedown', selectStartEvent, true);
  canvas.addEventListener('touchstart', function (e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l - 1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {

        // alert("touch start");

        var mySel = shapes[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        myState.mySelId = mySel.id;
        return;
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }

  }, true);

  function moveEvent(e) {
    if (myState.dragging) {
      var mouse = myState.getMouse(e);
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;
      myState.valid = false; // Something's dragging so we must redraw
    }
  }
  canvas.addEventListener('mousemove', moveEvent, true);
  canvas.addEventListener('touchmouve', moveEvent, true);

  function selectEndEvent(e) {
    if (myState.dragging) {
      console.log("icon is clicked=" + myState.mySelId);
      var mouse = myState.getMouse(e);
      console.log("x=" + mouse.x + "   y=" + mouse.y);
      var point = viewport.convertToPdfPoint(mouse.x, mouse.y);
      console.log(point);
    }
    myState.dragging = false;
  }
  canvas.addEventListener('mouseup', selectEndEvent, true);
  canvas.addEventListener('touchend', selectEndEvent, true);

  // double click for making new shapes
  canvas.addEventListener('dblclick', function (e) {
    var mouse = myState.getMouse(e);
    myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
  }, true);

  // **** Options! ****

  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;
  this.interval = 30;
  setInterval(function () { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function (shape) {
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function () {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();

    // ** Add stuff you want drawn in the background all the time here **

    // draw all shapes
    var l = shapes.length;
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
        shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }

    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
    }

    // ** Add stuff you want drawn on top all the time here **

    this.valid = true;
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function (e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;

  // We return a simple javascript object (a hash) with x and y defined
  return { x: mx, y: my };
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();

function initPinData(pinArr) {
  var l = pinArr.length;
  for (var i = 0; i < l; i++) {
    canvasState.addShape(new Shape(pinArr[i].x, pinArr[i].y, pinArr[i].id));
  }
}

function init() {
  canvasState = new CanvasState(document.getElementById('canvasPin'));
  // s.addShape(new Shape(40, 40, "1")); // The default is gray
  // s.addShape(new Shape(60, 140, "2"));
  // // Lets make some partially transparent
  // s.addShape(new Shape(80, 150, "3"));
  // s.addShape(new Shape(125, 80, "4"));

  // let pin1 = {
  //   x: 1060,
  //   y: 1032,
  //   id: "1"
  // };
  // let pin2 = {
  //   x: 890,
  //   y: 1252,
  //   id: "2"
  // };
    let pin1 = {
    x: 50,
    y: 50,
    id: "1"
  };
  let pin2 = {
    x: 100,
    y: 100,
    id: "2"
  };

  var pinArr = new Array();
  pinArr.push(pin1);
  pinArr.push(pin2);
  initPinData(pinArr);
}

// Now go make something amazing!

