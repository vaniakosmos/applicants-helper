const Q = require('q');
const ObjectId = require('mongoose').Types.ObjectId;

const Applicant = require('../models/applicant');
const Spec = require('../models/spec');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


/**
 * @returns {Promise}
 */
exports.getApplicant = function (id) {
    const promiseToFind = ObjectId.isValid(id)
        ? Applicant.findById(id)
        : Applicant.findOne({slug: id});
    return promiseToFind
        .populate('applications')
        .then(function (applicant) {
            if (applicant === null)
                return;
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
                        applications: applications.map(function (o) {
                            return mapper.application(o, o.spec)
                        }),
                    }
                })
        })
        .catch(errorHandler)
};


exports.search = function (query, limit = 5) {
    const options = {
        limit: limit
    };
    return Q
        .fcall(function () {
            return new RegExp(query, 'i');
        })
        .then(function (regex) {
            return Applicant
                .find({
                    '$or': [
                        {name: {$regex: regex}},
                        {trName: {$regex: regex}},
                    ]
                }, {}, options)
        })
        .catch(function (err) {
            console.error(err);
            return []
        })
        .then(function (applicants) {
            return {
                applicants: applicants.map(mapper.applicant),
            }
        })
};
