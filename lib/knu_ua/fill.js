const Q = require('q');
const {transliterate, slugify} = require("transliteration");

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
            faculties = faculties.slice(0, 1);  // fixme: delete this
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
 * Update faculty.specs.
 * Scrap applications and call `setUpApplications`.
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
                return scraper.promiseApplications(spec)
                    .spread(function (applicationObjs, loDz) {
                        return setUpApplications(spec, loDz, applicationObjs)
                    })
            }));
            // return specs.reduce(function (chain, spec) {
            //     return chain
            //         .then(() => scraper.promiseApplications(spec))
            //         .spread(function (applicationObjs, loDz) {
            //             return setUpApplications(spec, loDz, applicationObjs)
            //         })
            // }, Q())
        })
        .catch(function (err) {
            console.error(`Failed to set up specs:\n`, err);
        })
}

/**
 * For each application object upsert applicant and put application into DB.
 * Update spec: lo, dz, applications
 * Then for each application find applicant and push application to the list
 * @param spec
 * @param loDz
 * @param applicationObjs
 * @returns {Q.Promise}
 */
function setUpApplications(spec, loDz, applicationObjs) {
    const promises = [];
    for (let applicationObj of applicationObjs) {
        const p = Applicant
            .findOneAndUpdate(
                {name: applicationObj.name},
                {
                    name: applicationObj.name,
                    trName: transliterate(applicationObj.name),
                    slug: slugify(applicationObj.name),
                },
                {upsert: true, new: true}
            )
            .then(function (applicant) {
                return Application.create({
                    spec: spec._id,
                    applicant: applicant._id,
                    pos: applicationObj.pos,
                    actualPos: applicationObj.actualPos,
                    score: applicationObj.score,
                    doc: applicationObj.doc
                });
            });
        promises.push(p);
    }
    return Q.all(promises)
        .then(function (applications) {
            return Spec.findOneAndUpdate(
                {_id: spec._id},
                {
                    lo: loDz.lo,
                    dz: loDz.dz,
                    applications: applications,
                })
                .then(function () {
                    const promises = applications.map(function (application) {
                        return Applicant.findOneAndUpdate(
                            {_id: application.applicant},
                            {'$push': {applications: application._id}})
                    });
                    return Q.all(promises)
                })
        })
        .catch(function (err) {
            console.error(`Failed to set up applications:\n`, err);
        })
}
