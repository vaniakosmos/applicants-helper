const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Applicant
 * @property {ObjectId} _id
 * @property {String} name
 * @property {ObjectId[]} applications
 */
const applicantSchema = new Schema({
    name: String,
    applications: [{type: ObjectId, ref: 'Application'}]
});
const Applicant = mongoose.model('Applicant', applicantSchema);

/**
 * @typedef {Object} Model.Application
 * @property {ObjectId} _id
 * @property {ObjectId} spec_id
 * @property {ObjectId} applicant_id
 * @property {Number} pos
 * @property {Number} actualPos
 * @property {float} score
 * @property {Boolean} doc
 * @property {Boolean} changedPos
 */
const applicationSchema = new Schema({
    spec_id: {type: ObjectId, ref: 'Spec'},
    applicant_id: {type: ObjectId, ref: 'Applicant'},
    pos: Number,
    actualPos: Number,
    score: Number,
    doc: Boolean,
    changedPos: {type: Boolean, default: false},
});
const Application = mongoose.model('Application', applicationSchema);

module.exports = {
    Applicant: Applicant,
    Application: Application,
};
