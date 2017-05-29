var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, "libs")));
app.use(express.static(path.join(__dirname, "libs","img")));
//app.use(express.static(path.join(__dirname, "public")));

module.exports = app;