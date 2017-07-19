const Faculty = require('../models/faculty');
const {errorHandler} = require('./utils');
const {specMapper} = require('./spec');


function facultyMapper(faculty) {
    return {
        name: faculty.name,
        oUrl: faculty.oUrl,
        url: faculty.url,
    }
}

exports.facultyMapper = facultyMapper;

/**
 * @returns {Promise}
 */
exports.getFaculty = function (id) {
    return Faculty
        .findById(id)
        .populate('specs')
        .then(function (faculty) {
            return {
                faculty: facultyMapper(faculty),
                specs: faculty.specs.map(specMapper)
            }
        })
        .catch(errorHandler)
};
