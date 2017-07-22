const service = require('../services/applicant');
const {renderOrNext, propagateError} = require('./utils');


exports.getApplicant = function (req, res, next) {
    const id = req.params['id'];
    service.getApplicant(id)
        .then(renderOrNext('applicant', res, next))
        .catch(propagateError(next))
};
