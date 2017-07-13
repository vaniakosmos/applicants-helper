const Q = require('q');
const ObjectId = require('mongoose').Types.ObjectId;

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant').Applicant;
const Application = require('../models/applicant').Application;


const urlMapper = {
    univ: (id) => `/univ/${id}`,
    faculty: (id) => `/faculty/${id}`,
    specialization: (id) => `/specialization/${id}`,
};

function mapUniv(o) {
    return {
        name: o.name,
        oUrl: o.url,
        url: urlMapper.univ(o._id)
    }
}

function mapFaculty(o) {
    return {
        name: o.name,
        oUrl: o.url,
        url: urlMapper.faculty(o._id)
    }
}

function mapSpec(o) {
    return {
        name: o.name,
        specialty: o.specialty,
        form: o.form,
        level: o.level,
        dz: o.dz,
        lo: o.lo,
        lastUpdate: o.lastUpdate,
        oUrl: o.url,
        url: urlMapper.specialization(o._id)
    }
}

function errorObj(err) {
    return {
        code: 400,
        error: err.message,
    }
}


/**
 * Search for some stuff
 * @param {String} query
 * @param {int} [limit=5]
 * @returns {Promise.<{univs, faculties, specs, applicants}>}
 */
module.exports.search = function search(query, limit = 5) {
    // todo: make some checks and query normalizations
    query = "фак";
    let now = new Date();
    const regex = new RegExp(query, 'i');
    const findName = {name: {$regex: regex}};
    const findNameUrl = {
        '$or': [
            findName,
            {url: {$regex: regex}},
        ]
    };
    const options = {limit: limit};
    return Q.all([
        Univ.find(findName, {}, options),
        Faculty.find(findNameUrl, {}, options),
        Spec.find(findNameUrl, {}, options),
        Applicant.find(findName, {}, options),
    ])
        .catch(function (err) {
            console.error("Search error:", err);
        })
        .then(function (res) {
            const result = {
                univs: res[0].map(mapUniv),
                faculties: res[1].map(mapFaculty),
                specs: res[2].map(mapSpec),
                applicants: res[3].map(function (o) {
                    return {
                        name: o.name,
                    }
                }),
            };
            console.log(result);
            console.log(new Date() - now);
            return result;
        })
};

/**
 *
 * @returns {Promise.<{univs}>}
 */
module.exports.getUnivs = function getUnivs() {
    return Univ
        .find({})
        .then(function (univs) {
            return {
                univs: univs.map(mapUniv)
            }
        })
        .catch(errorObj)
};


/**
 *
 * @param {ObjectId|String} univ_id
 * @returns {Promise}
 */
module.exports.getFaculties = function getFaculties(univ_id) {
    return Q
        .fcall(function () {
            if (typeof univ_id === 'string' && ObjectId.isValid(univ_id))
                univ_id = ObjectId(univ_id);
            else
                throw new Error('Bad id');
            return univ_id
        })
        .then(function (univ_id) {
            return Q.all([
                Univ.findById(univ_id),
                Faculty.find({univ_id: univ_id})
            ])
        })
        .spread(function (univ, faculties) {
            return {
                univ: mapUniv(univ),
                faculties: faculties.map(mapFaculty)
            };
        })
        .catch(errorObj);
};

/**
 *
 * @param {ObjectId|String} faculty_id
 * @returns {Promise}
 */
module.exports.getSpecs = function getSpecs(faculty_id) {
    return Q
        .fcall(function () {
            if (typeof faculty_id === 'string' && ObjectId.isValid(faculty_id))
                faculty_id = ObjectId(faculty_id);
            else
                throw new Error('Bad id');
            return faculty_id
        })
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
            return {
                univ: mapUniv(univ),
                faculty: mapFaculty(faculty),
                specs: specs.map(mapSpec)
            }
        })
        .catch(errorObj);

};

/**
 *
 * @param spec_id
 * @returns {Promise.<{}>}
 */
module.exports.getApplications = async function getApplications(spec_id) {
    return Q
        .fcall(function () {
            if (typeof spec_id === 'string' && ObjectId.isValid(spec_id))
                spec_id = ObjectId(spec_id);
            else
                throw new Error('Bad id');
            return spec_id
        })
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
            return {
                univ: mapUniv(univ),
                faculty: mapFaculty(faculty),
                spec: mapSpec(spec),
                applications: applications.map(function (o, index) {
                    return {
                        pos: o.pos,
                        actualPos: o.actualPos,
                        name: applicants[index].name,
                        score: o.score,
                        doc: o.doc,
                        changedPos: o.changedPos,
                    }
                })
            }
        })
        .catch(errorObj);
};

module.exports.getApplicant = function getApplicant() {

};
