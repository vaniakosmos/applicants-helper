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
    name: {type: String, required: true, max: 100, trim: true},
    applications: [{type: ObjectId, ref: 'Application'}]
});

applicantSchema.virtual('url').get(function () {
    return `applicants/${this._id}`
});

const Applicant = mongoose.model('Applicant', applicantSchema);
module.exports = Applicant;
