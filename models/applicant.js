const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Model.Applicant
 * @property {Object} _id
 * @property {String} name
 * @property {Array.<Model.Application>} applications
 */
const applicantSchema = new Schema({
    name:  String,
    applications: [{type: Schema.Types.ObjectId, ref: 'Application'}]
});

/**
 * @typedef {Object} Model.Application
 * @property {Object} _id
 * @property {Object} spec_id
 * @property {Number} pos
 * @property {Number} actualPos
 * @property {float} score
 * @property {Boolean} doc
 */
const applicationSchema = new Schema({
    spec_id: Schema.Types.ObjectId,
    pos: Number,
    actualPos: Number,
    name:  String,
    score: Number,
    doc: Boolean,
});

const Applicant = mongoose.model('Applicant', applicantSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = {
    Applicant: Applicant,
    Application: Application,
};
