const mongoose = require('mongoose');

/**
 * @typedef {Object} Model.Applicant
 * @property {Number} number
 * @property {String} name
 * @property {float} score
 * @property {Boolean} doc
 */

const applicantSchema = new mongoose.Schema({
    number: Number,
    name:  String,
    score: Number,
    doc: Boolean,
});

const Applicant = mongoose.model('Applicant', applicantSchema);
module.exports = Applicant;
