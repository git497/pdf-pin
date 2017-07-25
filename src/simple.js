
import './simple.html'
import PDFJS from 'pdfjs-dist/webpack'

const url = 'data/HYG.pdf';

let circles = [
    {
        id: '1',
        x: 0,
        y: 0
    },
    {
        id: '2',
        x: 30,
        y: 30
    },
    {
        id: '3',
        x: 100,
        y: 100
    }
]

// Asynchronous download of PDF
var loadingTask = PDFJS.getDocument(url);
loadingTask.then(function (pdf) {
    console.log('PDF loaded');

    // Fetch the first page
    var pageNumber = 1;
    pdf.getPage(pageNumber).then(function (page) {
        console.log('Page loaded');

        var scale = 1;
        var viewport = page.getViewport(scale);

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        context.fillStyle = "#FF0000";

        let isMouseDown = false

        canvas.onclick = e => {
            let x = e.offsetX
            let y = e.offsetY
            let id = Math.random().toString()
            let item = {
                id,
                x, y
            }
            makeSpan({
                id,
                x, y
            })
            circles.push(item)

            // context.beginPath();
            // context.arc(x, y, 10, 0, Math.PI * 2, true);
            // context.closePath();
            // context.fill();
        }

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);
        renderTask.then(function () {

            circles.forEach(circle => {
                makeSpan(circle)
            })
            console.log('Page rendered');
        })

        function makeSpan(circle) {
            let root = document.getElementById("root")

            let span = document.createElement("span");
            span.onmouseover = function (e) {
                if (isMouseDown) return

                this.style = `background: #aaa; position: absolute; left: ${circle.x}px; top: ${circle.y}px; width: 30px; height: 30px; border: solid 1px`
            }

            span.onmousedown = function (e) {
                isMouseDown = true
                this.id = circle.id
            }

            span.onmousemove = function (e) {
                if (!isMouseDown) return
                this.style = `background: #aaa; position: absolute; left: ${e.x - 20}px; top: ${e.y - 20}px; width: 30px; height: 30px; border: solid 1px`
            }

            span.onmouseup = function (e) {
                isMouseDown = false
                console.log(e)
                let find = circles.find(circle => {
                    return circle.id === this.id
                })
                find.x = e.x - 20
                find.y = e.y - 20
                this.style = `background: #aaa; position: absolute; left: ${e.x - 20}px; top: ${e.y - 20}px; width: 30px; height: 30px; border: solid 1px`
            }

            span.onmouseout = function (e) {
                if (isMouseDown) return

                this.style = `background: #aaa; position: absolute; left: ${circle.x}px; top: ${circle.y}px; width: 30px; height: 30px;`
            }
            span.id = circle.id
            span.style = `background: #aaa; position: absolute; left: ${circle.x}px; top: ${circle.y}px; width: 30px; height: 30px;`
            root.appendChild(span)
        }
    });
}, function (reason) {
    // PDF loading error
    console.error(reason);
});


