const Q = require('q');

const Applicant = require('../models/applicant');
const Spec = require('../models/spec');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


/**
 * @returns {Promise}
 */
exports.getApplicant = function (id) {
    return Applicant
        .findById(id)
        .populate('applications')
        .then(function (applicant) {
            const applications = applicant.applications.map(mapper.application);
            const promises = applications.map(function (application) {
                return Spec
                    .findById(application.spec)
                    .then(function (spec) {
                        application.spec = spec;
                        return application;
                    })
            });
            return Q.all(promises)
                .then(function (applications) {
                    return {
                        applicant: mapper.applicant(applicant),
                        applications: applications,
                    }
                })
        })
        .catch(errorHandler)
};
