const Univ = require('../models/univ');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


/**
 * @returns {Promise}
 */
exports.getUniv = function (id) {
    return Univ
        .findById(id)
        .populate('faculties')
        .then(function (univ) {
            return {
                univ: mapper.univ(univ),
                faculties: univ.faculties.map(mapper.faculty),
            }
        })
        .catch(errorHandler)
};


/**
 * @returns {Promise}
 */
exports.getListOfUnivs = function () {
    return Univ
        .find()
        .then(function (univs) {
            return {
                univs: univs.map(mapper.univ)
            }
        })
        .catch(errorHandler)
};
