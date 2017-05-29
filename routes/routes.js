var _ = require('lodash');

var AppRoutes = {};

AppRoutes.Root = function (req, res) {
    res.render('login', {
        title: '',
        invalid: false
    });
};


AppRoutes.BadRequest = function (req, res) {
    res.status(400).send("<h1>400 Oop's Page Not Found<h1/>");
};


module.exports = AppRoutes;