var socket = io();
var joinURL = "";

socket.on('draw-from-server', function (data) {
    DrawOnClientCanvas(data.clickX, data.clickY, data.clickDrag, data.strokeStyle, data.lineWidth)
});

socket.on('clear-the-canvas-from-server', function (data) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
});

socket.on("join-url", function (data) {
    joinURL = data.joinURL;
})

socket.on("new-user-connected", function (data) {
    $("#connectedUsers").html("");
    data.forEach(function (element) {
        $("#connectedUsers").append("<li>" + element.username + "</li>")
    }, this);
})

socket.on("user-disconnected", function (data) {
    $("#connectedUsers").html("");
    data.forEach(function (element) {
        $("#connectedUsers").append("<li>" + element.username + "</li>")
    }, this);
})

//prepare canvas
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
context.fillStyle = "#FF0000";

var offsetLeft = 0
var offsetTop = 0

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var strokeStyle = "red";
var lineWidth = 5;

function SetContextProperties(mode) {
    if (mode === 'erase') {
        this.strokeStyle = "#c3c3c3";
        this.lineWidth = 10;
        document.getElementById('myCanvas').style.cursor = "cell";
    } else {
        this.strokeStyle = "red";
        this.lineWidth = 5;
        document.getElementById('myCanvas').style.cursor = "crosshair";

    }
}

function SetStrokeStyle(color) {
    this.strokeStyle = color;
}

$('#myCanvas').mousedown(function (e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;

    paint = true;
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    DrawOnCanvas();
});

$('#myCanvas').mousemove(function (e) {
    if (paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        DrawOnCanvas();
    }
});

$('#myCanvas').mouseup(function (e) {
    paint = false;
    ClearDrawCoordinates();
});

$('#myCanvas').mouseleave(function (e) {
    paint = false;
    ClearDrawCoordinates();
});

function ClearDrawCoordinates() {

    if (clickX.length > 0) {
        socket.emit('maintain-history', {
            clickX: clickX,
            clickY: clickY,
            clickDrag: clickDrag,
            strokeStyle: this.strokeStyle,
            lineWidth: this.lineWidth
        });
    }
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
}

function DrawOnCanvas() {
    context.strokeStyle = this.strokeStyle;
    context.lineJoin = "round";
    context.lineWidth = this.lineWidth;

    for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
            context.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
    }

    socket.emit('draw-from-client', {
        clickX: clickX,
        clickY: clickY,
        clickDrag: clickDrag,
        strokeStyle: this.strokeStyle,
        lineWidth: this.lineWidth
    });
}


function DrawOnClientCanvas(recClickX, recClickY, recClickDrag, recStrokeStyle, recLineWidth) {
    context.strokeStyle = recStrokeStyle; // "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = recLineWidth;

    for (var i = 0; i < recClickX.length; i++) {
        context.beginPath();
        if (recClickDrag[i] && i) {
            context.moveTo(recClickX[i - 1], recClickY[i - 1]);
        } else {
            context.moveTo(recClickX[i] - 1, recClickY[i]);
        }
        context.lineTo(recClickX[i], recClickY[i]);
        context.closePath();
        context.stroke();
    }
}

function addClick(x, y, dragging) {
    if (x) {
        clickX.push(x);

        clickY.push(y);
        clickDrag.push(dragging);
    }
}

function Share() {
    alert(joinURL)
}


function ClearCanvas() {
    var confirmed = confirm('All data will be deleted permanently, Are you sure you want to do this?');
    if (confirmed) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        socket.emit('clear-the-canvas', {});
    }
}

function UndoCanvas() {
    socket.emit('undo-canvas', {});
}