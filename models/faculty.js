const mongoose = require('mongoose');

/**
 * @typedef {Object} Model.Faculty
 * @property {String} url
 * @property {String} name
 */

const facultySchema = new mongoose.Schema({
    url: String,
    name:  String,
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
