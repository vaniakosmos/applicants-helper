const mongoose = require('mongoose');

/**
 * @typedef {Object} Model.Faculty
 * @property {Object} _id
 * @property {String} url
 * @property {String} name
 */

const facultySchema = new mongoose.Schema({
    url: String,
    name:  String,
    univ_id: mongoose.Schema.Types.ObjectId,
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
