const mongoose = require('mongoose');
const Q = require('q');

const config = require('../config/default');
const fillDB = require('./knu_ua/fill');
const update = require('./knu_ua/updater');
const calculateActualPos = require('./knu_ua/actualPos');

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant').Applicant;
const Application = require('../models/applicant').Application;

const commands = require('./commands');

mongoose.Promise = Q.Promise;

console.log(config.db.url);
mongoose
    .connect(config.db.url, {
        useMongoClient: true,
    })
    .then(function () {
        console.log('Connected');
    })
    .catch(function (err) {
        console.error(err);
    })
    .then(function () {
        const key = process.argv[2];
        switch (key) {
            case 'stats':
                console.log('Getting database statistics...');
                return mongoose.connection.db.stats()
                    .then(function (stats) {
                        console.log(stats)
                    });
            case 'check':
                console.log('Checking out database...');
                return check();
            case "populate":
                console.log('Populating database...');
                return fillDB();
            case 'update':
                console.log('Updating applications...');
                return update();
            case 'calcpos':
                console.log('Recalculating actual positions...');
                return calculateActualPos();
            case 'dropdatabase':
                console.log('Dropping database...');
                return mongoose.connection.db.dropDatabase();
            default:
                console.log('did nothing');
        }
    })
    .then(function () {
        gracefulExit();
    });

async function check() {
    console.log('UNIV -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
    const univ = await Univ.find({}, {}, {limit: 5});
    console.log(univ);

    console.log('FACULTIES -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
    const faculties = await Faculty.find({}, {}, {limit: 5});
    console.log(faculties);

    console.log('SPECIALIZATIONS -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
    const specs = await Spec.find({}, {}, {limit: 5});
    console.log(specs);

    console.log('APPLICATIONS -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
    const applications = await Application.find({}, {}, {limit: 15});
    console.log(applications);

    console.log('DUDES -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
    const applicants = await Applicant.find({}, {}, {limit: 5});
    console.log(applicants);

}

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
    gracefulExit: gracefulExit,
};
