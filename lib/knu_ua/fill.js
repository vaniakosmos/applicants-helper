const Q = require('q');

const scraper = require('./scraper');
const Univ = require('../../models/univ');
const Faculty = require('../../models/faculty');
const Spec = require('../../models/spec');
const Applicant = require('../../models/applicant');
const Application = require('../../models/application');


module.exports = function () {
    return setUpUniv()
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
};


/**
 * Scrap univ object, put it into DB and initiate faculty scraping.
 * @returns {Q.Promise}
 */
function setUpUniv() {
    return scraper.promiseUniv()
        .then(function (univObj) {
            return Univ.create(univObj)
        })
        .then(function (univ) {
            console.log('Wrote univ into DB.');
            return scraper.promiseFaculties()
                .then(function (facultyObjs) {
                    return setUpFaculties(univ, facultyObjs)
                })
        })
        .catch(function (err) {
            console.error(`Failed to set up univ:\n`, err);
        })
}


/**
 * Extend `facultyObjs` with univ id and add into DB.
 * Update univ.faculties.
 * Then sequentially scrap specs for each faculty and call `setUpSpecs`.
 * @param {Model.Univ} univ
 * @param {[]} facultyObjs - Model.Faculty-like object
 * @return {Promise}
 */
function setUpFaculties(univ, facultyObjs) {
    return Faculty
        .insertMany(facultyObjs.map(function (object) {
            object.univ = univ._id;
            return object;
        }))
        .then(function (faculties) {
            console.log('Wrote all faculties into DB.');
            return Univ
                .findOneAndUpdate({_id: univ._id}, {faculties: faculties})
                .then(() => faculties)
        })
        .then(function (faculties) {
            faculties = faculties.slice(0, 2);  // fixme: delete this
            return faculties.reduce(function (chain, faculty) {
                // console.time('faculty');
                return chain
                    .then(function () {
                        console.time('faculty')
                    })
                    .then(() => scraper.promiseSpecs(faculty))
                    .then(specObjs => setUpSpecs(faculty, specObjs))
                    .then(function () {
                        console.timeEnd('faculty')
                    })
            }, Q());
        })
        .catch(function (err) {
            console.error(`Failed to set up faculties:\n`, err);
        })
}

/**
 * Extend `specObjs` with faculty id and add into DB.
 * @param {Model.Faculty} faculty
 * @param {[]} specObjs
 * @returns {Promise}
 */
function setUpSpecs(faculty, specObjs) {
    return Spec
        .insertMany(specObjs.map(function (object) {
            object.faculty = faculty._id;
            return object
        }))
        .then(function (specs) {
            return Faculty
                .findOneAndUpdate({_id: faculty._id}, {specs: specs})
                .then(() => specs)
        })
        .then(function (specs) {
            return Q.all(specs.map(function (spec) {
                return scraper.promiseApplications(spec);
            }));
            // return specs.reduce(function (chain, spec) {
            //     return chain
            //         .then(() => scraper.promiseApplications(spec))
            //         .spread(function (applicationObjs, loDz) {
            //             console.log(loDz);
            //         })
            // }, Q())
        })
        .catch(function (err) {
            console.error(`Failed to set up specs:\n`, err);
        })
}

/**
 * Write specs into DB and categorize result with applicants by spec and faculty.
 * @param {Model.Spec[][]} specObjsByFaculty
 * @return {Promise}
 */
function setUpSpecAndApps(specObjsByFaculty) {
    // todo: maybe there is no point to categorize by faculty? But this probably helps not to overload the RAM.
    let chain = Q();
    for (let specObjs of specObjsByFaculty) {
        chain = chain.then(function () {
            // update specs and get applications
            const applicationObjsPromises = specObjs.map(function (spec) {
                return scraper.promiseApplications(spec)
            });
            return Q
                .all(applicationObjsPromises)
                .then(function (applicationObjsBySpec) {
                    return Spec
                        .insertMany(specObjs)
                        .then(function (specs) {
                            return setUpApps(specs, applicationObjsBySpec)
                        })
                })
        })
    }
    return chain
}


/**
 * Set up applications and applicants
 * @param {Spec[]} specs
 * @param applicationObjsBySpec
 * @returns {Q.Promise}
 */
function setUpApps(specs, applicationObjsBySpec) {
    const promises = [];
    applicationObjsBySpec.forEach(function (applicationObjs, i) {
        const spec = specs[i];
        for (let applicationObj of applicationObjs) {
            const p = Applicant
                .findOneAndUpdate(
                    {name: applicationObj.name},
                    {name: applicationObj.name},
                    {upsert: true, new: true}
                )
                .then(function (applicant) {
                    return Application.create({
                        spec_id: spec._id,
                        applicant_id: applicant._id,
                        pos: applicationObj.pos,
                        actualPos: applicationObj.actualPos,
                        score: applicationObj.score,
                        doc: applicationObj.doc
                    });
                });
            promises.push(p);
        }
    });
    return Q.all(promises)
}
