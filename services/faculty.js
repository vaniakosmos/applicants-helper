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
