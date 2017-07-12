const mongoose = require('mongoose');
const Q = require('q');

const config = require('../../config/default');
const fillDB = require('./fill');

mongoose.Promise = Promise;

mongoose.connect(config.db.url, {
    useMongoClient: true,
}).then(function () {
    console.log('Connected');
}, function (err) {
    console.error(err);
}).then(function () {
    return fillDB();
}).then(function () {
    console.log('finished everything');
    return mongoose.connection.db.dropDatabase(gracefulExit);
}).catch(function (err) {
    console.error(err);
}).then(function () {
    return mongoose.connection.db.dropDatabase(gracefulExit);
});


function gracefulExit() {
    mongoose.disconnect(function () {
        console.log('Mongoose is disconnected through app termination.');
        process.exit();
    });
}

process
    .on('SIGINT', gracefulExit)
    .on('SIGTERM', gracefulExit);
