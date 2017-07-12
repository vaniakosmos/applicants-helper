const mongoose = require('mongoose');
const Q = require('q');

const scraper = require('./scrapers/knu_ua');
const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const foo = require('../models/applicant');
const Applicant = foo.Applicant;
const Application = foo.Application;

const config = require('../config/default');

mongoose.Promise = Promise;

mongoose.connect(config.db.url, {
    useMongoClient: true,
}).then(function () {
    console.log('Connected');
}, function (err) {
    console.log(err);
}).then(function () {
    return fillDB();
}).then(function () {
    console.log('finished everything');
    // return mongoose.connection.db.dropDatabase();
}).catch(function (err) {
    console.error(err);
});


function setUpFaculty(facultyObjs) {
    const promises = [];
    for (let faculty of facultyObjs) {
        promises.push(Faculty.create(faculty).then(function (faculty) {
            return scraper.promiseSpecs(faculty);
        }));
        break
    }
    return Q.all(promises);
}

function setUpSpeciality(specObjsByFaculty) {
    // console.log(specObjsByFaculty.slice(0, 2));
    const promises = [];
    for (let specObjs of specObjsByFaculty) {
        for (let specObj of specObjs) {
            promises.push(Spec.create(specObj).then(function (spec) {
                return scraper.promiseApplications(spec)
            }))
        }
        break
    }
    return Q.all(promises);
}

function setUpApplicants(applicationObjsBySpec) {
    // console.log(applicationObjsBySpec[0]);
    const promises = [];
    for (let applicationObjs of applicationObjsBySpec) {
        for (let applicationObj of applicationObjs) {
            const applicantName = applicationObj.name;
            // console.log(applicationsObj);
            const promise = Application.create({
                spec_id: applicationObj.spec_id,
                pos: applicationObj.pos,
                actualPos: applicationObj.actualPos,
                score: applicationObj.score,
                doc: applicationObj.doc
            }).then(function (application) {
                // console.log(application._id, typeof application._id);
                // console.log(applicantName);
                return Applicant.update(
                    {name: applicantName},
                    {
                        name: applicantName,
                        $addToSet: {applications: application._id}
                    },
                    {upsert: true}
                );
            });
            promises.push(promise)
        }
    }
    return Q.all(promises);
}


function fillDB() {
    return scraper.promiseUniv().then(function (univObj) {
        return Univ.create(univObj).then(function (univ) {
            return scraper.promiseFaculties(univ)
        })
    }).then(setUpFaculty)
        .then(setUpSpeciality)
        .then(setUpApplicants)
        .then(function (applicants) {
            // console.log(applicants);
            return Application.find({});
        }).then(function (applicant) {
            console.log(applicant);
        });
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
