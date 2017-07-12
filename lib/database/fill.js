const Q = require('q');

const scraper = require('../scrapers/knu_ua');
const Univ = require('../../models/univ');
const Faculty = require('../../models/faculty');
const Spec = require('../../models/spec');
const Applicant = require('../../models/applicant').Applicant;
const Application = require('../../models/applicant').Application;


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
    // todo: optimise single calls to DB
    let chain = Q();
    for (let applicationObjsBySpec of applicationObjsByFaculty) {
        const applicationObjs = [].concat(...applicationObjsBySpec);
        const promises = [];
        for (let applicationObj of applicationObjs) {
            const p = Applicant.findOneAndUpdate(
                {name: applicationObj.name},
                {name: applicationObj.name},
                {upsert: true, new: true}
            ).then(function (applicant) {
                return Application.create({
                    spec_id: applicationObj.spec_id,
                    applicant_id: applicant._id,
                    pos: applicationObj.pos,
                    actualPos: applicationObj.actualPos,
                    score: applicationObj.score,
                    doc: applicationObj.doc
                });
            });
            promises.push(p);
        }

        chain = chain.then(function () {
            return Q.all(promises)
        });
    }
    return chain;
}

module.exports = fillDB;
