var app = require('./app');
var path = require('path');
var uuid = require('uuid/v1');
var _ = require('lodash');
var config = require('./config/config');
var init = require('./init');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var AppRoutes = require('./routes/routes');

var username = "",
    joinUrl = "";
var connectedUsers = [];

var drawingHistory = [];

app.get('/', AppRoutes.Root);

app.get('/:key', function (req, res) {
    if (_.some(connectedUsers, {
            "key": req.params.key
        })) {
        res.render('join', {
            title: '',
            invalid: false
        });
    } else {
        res.status(400).send("<h1>400 Oop's Page Not Found<h1/>");
    }
});

app.post('/board', function (req, res) {
    username = req.body.username;
    res.render('board', {
        title: ' To collaborative white board',
        username: req.body.username
    });
});

app.get('*', AppRoutes.BadRequest);

io.on('connection', function (socket) {
    var key = uuid();
    joinUrl = 'http://' + socket.handshake.headers.host + "/" + key;

    connectedUsers.push({
        username: username,
        id: socket.id,
        joinURL: socket.handshake.headers.host + "/" + key,
        key: key
    });

    socket.on('disconnect', function () {
        connectedUsers = _.filter(connectedUsers, function (item) {
            return item.id !== socket.id;
        });

        io.emit("user-disconnected", connectedUsers);
    });

    io.emit("new-user-connected", connectedUsers);

    socket.emit("join-url", {
        joinURL: joinUrl
    });

    socket.on('draw-from-client', function (data) {
        io.emit('draw-from-server', data);
    });

    socket.on('clear-the-canvas', function (data) {
        drawingHistory = [];
        io.emit('clear-the-canvas-from-server', data);
    });

    socket.on('maintain-history', function (data) {
        if (!_.some(drawingHistory, {
                "id": socket.id
            })) {
            drawingHistory.push({
                id: socket.id,
                history: []
            });
        }
        var drawingHistoryItem = _.find(drawingHistory, function (item) {
            return item.id === socket.id;
        });
        drawingHistoryItem.history.push({
            data: data
        });
    });

    socket.on('undo-canvas', function (data) {
        if (_.some(drawingHistory, {
                "id": socket.id
            })) {

            var drawingHistoryItem = _.filter(drawingHistory, function (item) {
                return item.id === socket.id;
            });


            var undoData = _.last(drawingHistoryItem[0].history)

            drawingHistoryItem[0].history.splice(-1);
            io.emit('clear-the-canvas-from-server', {});

            drawingHistory.forEach(function (item) {
                item.history.forEach(function (historyItem) {
                    io.emit('draw-from-server', historyItem.data);
                });
            });

            // if (undoData) {
            //     undoData.data.strokeStyle = "#c3c3c3";
            //     undoData.data.lineWidth = 8;
            //     io.emit('draw-from-server', undoData.data);
            // }
        }

    });
});

server.listen(config.port, function () {
    console.log('Application is running on http://localhost:' + config.port);
});