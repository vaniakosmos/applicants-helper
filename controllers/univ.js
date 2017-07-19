const service = require('../services/univ');
const {renderOrNext, propagateError} = require('./utils');


exports.getUniv = function (req, res, next) {
    const id = req.params['id'];
    service.getUniv(id)
        .then(renderOrNext('univ', res, next))
        .catch(propagateError(next))
};


exports.getListOfUnivs = function (req, res, next) {
    service.getListOfUnivs()
        .then(renderOrNext('univs', res, next))
        .catch(propagateError(next))
};
