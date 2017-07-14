const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');

// require('dotenv').config({path: '.env'});
const database = require('./lib/database');

const indexRouter = require('./routes/index');
const apiSetup = require('./routes/api');
const staticHelper = require('./lib/static');


const app = express();


// set up handlebars view engine
app.engine('hbs', handlebars.create({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        'static': function(name) {
            return staticHelper.map(name)
        },
        'section': function(name, options){
            if(!this._sections)
                this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
    }
}).engine);
app.set('view engine', 'hbs');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

apiSetup.setup(app);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    console.log('error');
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
