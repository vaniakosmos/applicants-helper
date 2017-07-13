const mongoose = require('mongoose');
const Q = require('q');

const config = require('../config/default');
const fillDB = require('./knu_ua/fill');
const update = require('./knu_ua/updater');
const calculateActualPos = require('./knu_ua/actualPos');

mongoose.Promise = Q.Promise;

mongoose
    .connect(config.db.url, {
        useMongoClient: true,
    })
    .then(function () {
        console.log('Connected');
    }, function (err) {
        console.error(err);
    })
    .then(() => fillDB())
    .then(() => update())
    .then(() => calculateActualPos())
    .then(function () {
        console.log('finished everything');
        return mongoose.connection.db.dropDatabase(gracefulExit);
    })
    .catch(function (err) {
        console.error(err);
    })
    .then(function () {
        return mongoose.connection.db.dropDatabase(gracefulExit);
    });


function updateAndRecalculatePos() {
    return update()
        .then(() => calculateActualPos())
}


function gracefulExit() {
    mongoose.disconnect(function () {
        console.log('Mongoose is disconnected through app termination.');
        process.exit();
    });
}

process
    .on('SIGINT', gracefulExit)
    .on('SIGTERM', gracefulExit);


module.exports = {
    reload: fillDB,
    update: update,
    calculateActualPos: calculateActualPos,
    updateAndRecalculatePos: updateAndRecalculatePos,
};
