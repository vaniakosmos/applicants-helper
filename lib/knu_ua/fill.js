const Q = require('q');

const scraper = require('./scraper');
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
        .then(setUpSpecAndApps)
        .then(async function () {
            const count = await Applicant.count({});
            console.log("Applicants:", count);
        })
        .then(async function () {
            const count = await Application.count({});
            console.log("Applications:", count);
        })
        .catch(function (err) {
            console.error('Error while filling DB:\n', err);
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
            // return Q.all(faculties.map(faculty => scraper.promiseSpecs(faculty)));
            const promises = [];
            for (let faculty of faculties) {
                promises.push(scraper.promiseSpecs(faculty));
                break  // fixme
            }
            return Q.all(promises)
        });
}

/**
 * Write specs into DB and categorize result with applicants by spec and faculty.
 * @param {Model.Spec[][]} specObjsByFaculty
 * @return {Promise.}
 */
function setUpSpecAndApps(specObjsByFaculty) {
    // todo: maybe there is no point to categorize by faculty? But this probably helps not to overload the RAM.
    let chain = Q();
    for (let specObjs of specObjsByFaculty) {
        chain = chain.then(function () {
            // update specs and get applications
            const applicationsPromises = specObjs.map(function (spec) {
                return scraper.promiseApplications(spec)
            });
            return Q
                .all(applicationsPromises)
                .then(function (applicationObjsBySpec) {
                    return setUpApps(applicationObjsBySpec)
                })
                .then(function () {
                    return Spec.insertMany(specObjs)
                })
        })
    }
    return chain
}


/**
 * Set up applications and applicants
 * @param applicationObjsBySpec
 * @returns {Promise}
 */
function setUpApps(applicationObjsBySpec) {
    const applicationObjs = [].concat(...applicationObjsBySpec);
    const promises = [];
    for (let applicationObj of applicationObjs) {
        const p = Applicant
            .findOneAndUpdate(
                {name: applicationObj.name},
                {name: applicationObj.name},
                {upsert: true, new: true}
            )
            .then(function (applicant) {
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
    return Q.all(promises)
}

module.exports = fillDB;
