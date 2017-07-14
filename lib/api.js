const Q = require('q');
const ObjectId = require('mongoose').Types.ObjectId;

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant').Applicant;
const Application = require('../models/applicant').Application;


const urlMapper = {
    root: 'http://localhost:3000',
    univ: (id) => `${urlMapper.root}/univ/${id}`,
    faculty: (id) => `${urlMapper.root}/faculty/${id}`,
    specialization: (id) => `${urlMapper.root}/specialization/${id}`,
    applicant: (id) => `${urlMapper.root}/applicant/${id}`,
};

const mapModel = {
    univ: function (object) {
        return {
            name: object.name,
            oUrl: object.url,
            url: urlMapper.univ(object._id)
        }
    },
    faculty: function (object) {
        return {
            name: object.name,
            oUrl: object.url,
            url: urlMapper.faculty(object._id)
        }
    },
    spec: function (object) {
        return {
            name: object.name,
            specialty: object.specialty,
            form: object.form,
            level: object.level,
            dz: object.dz,
            lo: object.lo,
            lastUpdate: object.lastUpdate,
            oUrl: object.url,
            url: urlMapper.specialization(object._id)
        }
    },
};

function wrapInResObject(res) {
    return {
        status: 200,
        data: res
    }
}

function errorHandler(err) {
    return {
        status: 400,
        error: err.message,
    }
}

/**
 *
 * @param {*} id
 * @returns {function}
 */
function validateId(id) {
    return function () {
        if (typeof id === 'string' && ObjectId.isValid(id))
            id = ObjectId(id);
        else
            throw new Error('Bad identifier.');
        return id
    }
}


/**
 * Search for some stuff
 * @param {String} query
 * @param {int} [limit=5]
 * @returns {Q.Promise.<{univs, faculties, specs, applicants}>}
 */
module.exports.search = function search(query, limit = 5) {
    // todo: make some checks and query normalizations
    const regex = new RegExp(query, 'i');
    const findName = {name: {$regex: regex}};
    const findNameUrl = {
        '$or': [
            findName,
            {url: {$regex: regex}},
        ]
    };
    const options = {limit: limit};
    return Q
        .all([
            Univ.find(findName, {}, options),
            Faculty.find(findNameUrl, {}, options),
            Spec.find(findNameUrl, {}, options),
            Applicant.find(findName, {}, options),
        ])
        .catch(function (err) {
            console.error("Search error:", err);
        })
        .then(function (res) {
            return wrapInResObject({
                univs: res[0].map(mapModel.univ),
                faculties: res[1].map(mapModel.faculty),
                specs: res[2].map(mapModel.spec),
                applicants: res[3].map(function (o) {
                    return {name: o.name}
                }),
            })
        })
        .catch(errorHandler)
};

/**
 *
 * @returns {Promise.<{univs}>}
 */
module.exports.getUnivs = function getUnivs() {
    return Univ
        .find({})
        .then(function (univs) {
            return wrapInResObject({
                univs: univs.map(mapModel.univ)
            })
        })
        .catch(errorHandler)
};


/**
 *
 * @param {ObjectId|String} univ_id
 * @returns {Q.Promise}
 */
module.exports.getFaculties = function getFaculties(univ_id) {
    return Q
        .fcall(validateId(univ_id))
        .then(function (univ_id) {
            return Q.all([
                Univ.findById(univ_id),
                Faculty.find({univ_id: univ_id})
            ])
        })
        .spread(function (univ, faculties) {
            return wrapInResObject({
                univ: mapModel.univ(univ),
                faculties: faculties.map(mapModel.faculty)
            });
        })
        .catch(errorHandler);
};

/**
 *
 * @param {ObjectId|String} faculty_id
 * @returns {Q.Promise}
 */
module.exports.getSpecs = function getSpecs(faculty_id) {
    return Q
        .fcall(validateId(faculty_id))
        .then(function (faculty_id) {
            return Q.all([
                Faculty.findById(faculty_id),
                Spec.find({faculty_id: faculty_id})
            ])
        })
        .spread(function (faculty, specs) {
            return Univ.findById(faculty.univ_id).then(function (univ) {
                return [univ, faculty, specs]
            })
        })
        .spread(function (univ, faculty, specs) {
            return wrapInResObject({
                univ: mapModel.univ(univ),
                faculty: mapModel.faculty(faculty),
                specs: specs.map(mapModel.spec)
            })
        })
        .catch(errorHandler);
};

/**
 *
 * @param {ObjectId|String} spec_id
 * @returns {Q.Promise}
 */
module.exports.getApplications = async function getApplications(spec_id) {
    return Q
        .fcall(validateId(spec_id))
        .then(async function (spec_id) {
            const [spec, applications] = await Q.all([
                Spec.findById(spec_id),
                Application.find({spec_id: spec_id})
            ]);
            const faculty = await Faculty.findById(spec.faculty_id);
            const univ = await Univ.findById(faculty.univ_id);
            const applicants = await Q.all(applications
                .map(function (application) {
                    return Applicant.findById(application.applicant_id);
                }));
            return wrapInResObject({
                univ: mapModel.univ(univ),
                faculty: mapModel.faculty(faculty),
                spec: mapModel.spec(spec),
                applications: applications.map(function (o, index) {
                    return {
                        pos: o.pos,
                        actualPos: o.actualPos,
                        applicantUrl: urlMapper.applicant(applicants[index]._id),
                        name: applicants[index].name,
                        score: o.score,
                        doc: o.doc,
                        changedPos: o.changedPos,
                    }
                })
            })
        })
        .catch(errorHandler);
};

/**
 *
 * @param {ObjectId|String} applicant_id
 * @returns {Q.Promise<>}
 */
module.exports.getApplicant = function getApplicant(applicant_id) {
    return Q
        .fcall(validateId(applicant_id))
        .then(function () {
            return Application
                .find({applicant_id: applicant_id})
                .populate('applicant_id spec_id')
        })
        .then(function (applications) {
            return wrapInResObject({
                applications: applications.map(function (o) {
                    return {
                        pos: o.pos,
                        actualPos: o.actualPos,
                        doc: o.doc,
                        score: o.scope,
                        name: o.applicant_id.name,
                    }
                })
            })
        })
        .catch(errorHandler);
};
