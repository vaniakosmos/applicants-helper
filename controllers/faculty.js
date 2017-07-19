const service = require('../services/faculty');
const {renderOrNext, propagateError} = require('./utils');


exports.getFaculty = function (req, res, next) {
    const id = req.params['id'];
    service.getFaculty(id)
        .then(renderOrNext('faculty', res, next))
        .catch(propagateError(next))
};
