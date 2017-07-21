const service = require('../services/spec');
const {renderOrNext, propagateError, validateId} = require('./utils');


exports.getSpec = function (req, res, next) {
    const id = req.params['id'];
    validateId(id)
        .then(function (id) {
            return service.getSpec(id);
        })
        .then(renderOrNext('spec', res, next))
        .catch(propagateError(next))
};
