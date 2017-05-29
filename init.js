var app = require('./app');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/ejs views/');
app.locals.pageTitle = 'Welcome';
app.use(bodyParser.json());
// app related setting resides here