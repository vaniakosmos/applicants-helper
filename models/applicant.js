const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Model.Applicant
 * @property {Object} _id
 * @property {String} name
 * @property {Array.<Model.Application>} applications
 */
const applicantSchema = new Schema({
    name: String,
});
const Applicant = mongoose.model('Applicant', applicantSchema);

/**
 * @typedef {Object} Model.Application
 * @property {Object} _id
 * @property {Object} spec_id
 * @property {Object} applicant_id
 * @property {Number} pos
 * @property {Number} actualPos
 * @property {float} score
 * @property {Boolean} doc
 * @property {Boolean} changedPos
 */
const applicationSchema = new Schema({
    spec_id: Schema.Types.ObjectId,
    applicant_id: Schema.Types.ObjectId,
    pos: Number,
    actualPos: Number,
    name: String,
    score: Number,
    doc: Boolean,
    changedPos: {type: Boolean, default: false},
});
const Application = mongoose.model('Application', applicationSchema);

module.exports = {
    Applicant: Applicant,
    Application: Application,
};
