const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Applicant
 * @property {ObjectId} _id
 * @property {String} name
 * @property {String} slug
 * @property {ObjectId} appliedSpec
 * @property {ObjectId[]} applications
 */
const applicantSchema = new Schema({
    name: {type: String, required: true, max: 100, trim: true},
    trName: {type: String, required: true, max: 100, trim: true},
    slug: {type: String, required: true, max: 100, trim: true},
    appliedSpec: {type: ObjectId, ref: 'Spec'},
    applications: [{type: ObjectId, ref: 'Application'}],
});

applicantSchema.virtual('url').get(function () {
    return `/applicants/${this.slug}`
});

const Applicant = mongoose.model('Applicant', applicantSchema);
module.exports = Applicant;
