const credentials = require('../../config/default').admin;
const querystring = require('querystring');
const {reload, updateAndRecalculatePos, drop} = require('../../lib/database');


exports.index = function (req, res) {
    if (req.session.authorized) {
        res.render('admin/index', req.query);
    }
    else {
        res.redirect('/admin/login');
    }
};

exports.getLogin = function (req, res) {
    if (req.session.authorized) {
        res.redirect('.');
    }
    else {
        res.render('admin/login');
    }
};

exports.postLogin = function (req, res) {
    const {username, password} = req.body;
    if (username === credentials.name && password === credentials.pass) {
        console.log('logged in');
        req.session.authorized = true;
        res.redirect('.')
    }
    else {
        res.render('admin/login', {error: 'bad credentials', username: username})
    }
};

exports.postLogout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.error(err);
        console.log('logged out');
        res.redirect('/');
    })
};

exports.populate = function (req, res) {
    reload()
        .then(function () {
            res.json({message: "POPULATE: success"})
        })
        .catch(function (err) {
            res.json({message: 'POPULATE error: ' + err.message})
        });
};

exports.update = function (req, res) {
    updateAndRecalculatePos()
        .then(function () {
            res.json({message: "UPDATE: success"})
        })
        .catch(function (err) {
            res.json({message: 'UPDATE error: ' + err.message})
        });
};

exports.drop = function (req, res) {
    drop()
        .then(function () {
            res.json({message: "DROP: success"})
        })
        .catch(function (err) {
            res.json({message: 'DROP error: ' + err.message})
        });
};
