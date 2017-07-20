const Q = require('q');

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


/**
 * @returns {Promise}
 */
exports.getSpec = function (id) {
    return Spec
        .findById(id)
        .populate('applications')
        .then(function (spec) {
            const applications = spec.applications.map(mapper.application);
            const promises = applications.map(function (application) {
                return Applicant
                    .findById(application.applicant)
                    .then(function (applicant) {
                        application.applicant = {
                            name: applicant.name,
                            url: applicant.url,
                        };
                        return application
                    })
            });
            return Q.all(promises)
                .then(async function (applications) {
                    const faculty = await Faculty.findById(spec.faculty);
                    const univ = await Univ.findById(faculty.univ);
                    return {
                        univ: mapper.univ(univ),
                        faculty: mapper.faculty(faculty),
                        spec: mapper.spec(spec),
                        applications: applications,
                    }
                })
        })
        .catch(errorHandler)
};
