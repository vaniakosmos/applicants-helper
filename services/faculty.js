const Q = require('q');
const Univ = require('../models/univ');
const Faculty = require('../models/faculty');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


/**
 * @returns {Promise}
 */
exports.getFaculty = function (id) {
    return Faculty
        .findById(id)
        .populate('specs')
        .then(async function (faculty) {
            const univ = await Univ.findById(faculty.univ);
            return {
                univ: mapper.univ(univ),
                faculty: mapper.faculty(faculty),
                specs: faculty.specs.map(mapper.spec)
            }
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
            return Faculty
                .find({
                    name: {$regex: regex}
                }, {}, options)
        })
        .catch(function (err) {
            console.error(err);
            return []
        })
        .then(function (faculties) {
            return {
                faculties: faculties.map(mapper.faculty),
            }
        })
};
