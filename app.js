const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const session = require('express-session');

const config = require('./config/default');
const database = require('./lib/database');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');


const app = express();


app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    err.status = err.status || 500;
    res.status(err.status);
    res.render('error', {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {},
    });
});

module.exports = app;
