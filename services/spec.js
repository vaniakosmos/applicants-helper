const Spec = require('../models/spec');
const {errorHandler} = require('./utils');
const {applicationMapper} = require('./application');


function specMapper(spec) {
    return {
        name: spec.name,
        specialty: spec.specialty,
        form: spec.form,
        level: spec.level,
        dz: spec.dz,
        lo: spec.lo,
        lastUpdate: spec.lastUpdate,
        oUrl: spec.oUrl,
        url: spec.url,
    }
}

exports.specMapper = specMapper;

/**
 * @returns {Promise}
 */
exports.getSpec = function (id) {
    return Spec
        .findById(id)
        .populate('applications')
        .then(function (spec) {
            return {
                spec: specMapper(spec),
                applications: spec.applications.map(applicationMapper)  // todo: add applicants
            }
        })
        .catch(errorHandler)
};
