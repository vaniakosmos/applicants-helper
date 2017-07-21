const service = require('../services/faculty');
const {renderOrNext, propagateError, validateId} = require('./utils');


exports.getFaculty = function (req, res, next) {
    const id = req.params['id'];
    validateId(id)
        .then(function (id) {
            return service.getFaculty(id);
        })
        .then(renderOrNext('faculty', res, next))
        .catch(propagateError(next))
};
