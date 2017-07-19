const Univ = require('../models/univ');
const {errorHandler} = require('./utils');
const {facultyMapper} = require('./faculty');


function univMapper(univ) {
    return {
        name: univ.name,
        oUrl: univ.oUrl,
        url: univ.url,
    }
}

exports.univMapper = univMapper;

/**
 * @returns {Promise}
 */
exports.getUniv = function (id) {
    return Univ
        .findById(id)
        .populate('faculties')
        .then(function (univ) {
            return {
                univ: univMapper(univ),
                faculties: univ.faculties.map(facultyMapper),
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
                univs: univs.map(univMapper)
            }
        })
        .catch(errorHandler)
};
