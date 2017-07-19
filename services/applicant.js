const Applicant = require('../models/applicant');
const {errorHandler} = require('./utils');
const {applicationMapper} = require('./application');


function applicantMapper(applicant) {
    return {
        name: applicant.name,
        url: applicant.url,
    }
}

exports.applicantMapper = applicantMapper;

/**
 * @returns {Promise}
 */
exports.getApplicant = function (id) {
    return Applicant
        .findById(id)
        .populate('applications')
        .then(function (applicant) {
            return {
                applicant: applicantMapper(applicant),
                applications: applicant.applications.map(applicationMapper)
            }
        })
        .catch(errorHandler)
};
