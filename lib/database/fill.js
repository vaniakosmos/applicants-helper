const Q = require('q');

const scraper = require('../scrapers/knu_ua');
const Univ = require('../../models/univ');
const Faculty = require('../../models/faculty');
const Spec = require('../../models/spec');
const {Applicant, Application} = require('../../models/applicant');


function fillDB() {
    return scraper.promiseUniv()
        .then(function (univObj) {
            return Univ.create(univObj).then(function (univ) {
                return scraper.promiseFaculties(univ)
            })
        })
        .then(setUpFaculty)
        .then(setUpSpecializations)
        .then(setUpApplicants)
        .then(function (foos) {
            // console.log(foos);
            // return Applicant.find({});
        }).then(function (applicant) {
            // console.log(applicant);
        }).then(function () {
            return Applicant.count({});
        }).then(function (count) {
            console.log("Applicants:", count);
            return Application.count({});
        }).then(function (count) {
            console.log("Applications:", count);
        })
}


/**
 *
 * @param {Model.Faculty[]} facultyObjs
 * @return {Promise.<Model.Spec[][]>}
 */
function setUpFaculty(facultyObjs) {
    return Faculty
        .insertMany(facultyObjs)
        .then(function (faculties) {
            console.log('Wrote all faculties into DB.');
            const promises = [];
            for (let faculty of faculties) {
                promises.push(scraper.promiseSpecs(faculty));
            }
            return Q.all(promises)
        });
}

/**
 * Write specs into DB and categorize result with applicants by spec and faculty.
 * @param {model.Spec[][]} specObjsByFaculty
 * @return {Promise.}
 */
function setUpSpecializations(specObjsByFaculty) {
    // const specsObjs = [].concat(...specObjsByFaculty);
    // return Spec
    //     .insertMany(specsObjs)
    const promises = [];
    for (let specObjs of specObjsByFaculty) {
        const p = Spec.insertMany(specObjs).then(function (specs) {
            const promises = [];
            for (let spec of specs) {
                promises.push(scraper.promiseApplications(spec));
            }
            return Q.all(promises)
        });
        promises.push(p);
    }
    return Q.all(promises);
}

/**
 *
 * @param applicationObjsByFaculty
 * @return {Promise}
 */
function setUpApplicants(applicationObjsByFaculty) {
    let chain = Q();
    for (let applicationObjsBySpec of applicationObjsByFaculty) {
        const applicationObjs = [].concat(...applicationObjsBySpec);
        const bulkOps = [];
        for (let application of applicationObjs) {
            bulkOps.push({
                'updateOne': {
                    'filter': {name: application.name},
                    'update': {name: application.name},
                    'upsert': true
                }
            });
        }
        chain = chain.then(function () {
            return Applicant.collection
                .bulkWrite(bulkOps)
                .then(function (res) {
                    console.log('wrote bulk for some faculty');
                    // console.log(res);
                    const ids = {};
                    for (let el of res.getUpsertedIds()) {
                        ids[el.index] = el._id;
                    }
                    // console.log(ids);
                    const applications = [];
                    for (let i = 0; i < applicationObjs.length; i++) {
                        const applicationObj = applicationObjs[i];
                        const app = {
                            spec_id: applicationObj.spec_id,
                            applicant_id: ids[String(i)],
                            pos: applicationObj.pos,
                            actualPos: applicationObj.actualPos,
                            score: applicationObj.score,
                            doc: applicationObj.doc
                        };
                        applications.push(app)
                    }
                    return Application.insertMany(applications);
                }).then(function () {
                    console.log('inserted applications for some faculty');
                    // console.log(res);
                })
        });
    }
    return chain;
}

module.exports = fillDB;
