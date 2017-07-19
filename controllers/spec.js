const service = require('../services/spec');
const {renderOrNext, propagateError} = require('./utils');


exports.getSpec = function (req, res, next) {
    const id = req.params['id'];
    service.getSpec(id)
        .then(renderOrNext('spec', res, next))
        .catch(propagateError(next))
};
