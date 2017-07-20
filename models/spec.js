const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Spec
 * @property {ObjectId} _id
 * @property {String} oUrl - original url
 * @property {String} name
 * @property {String} specialty
 * @property {String} form
 * @property {String} level
 * @property {int} lo - licensed volume
 * @property {int} dz - volume of the state order
 * @property {Date} lastUpdate
 * @property {ObjectId} faculty
 * @property {ObjectId[]} applications
 */
const specSchema = new Schema({
    oUrl: String,
    name: {type: String, required: true, max: 100, trim: true},
    specialty: String,
    form: String,
    level: String,
    lo: Number,
    dz: Number,
    lastUpdate: {type: Date, default: new Date()},
    faculty: {type: ObjectId, ref: 'Faculty'},
    applications: [{type: ObjectId, ref: 'Application'}]
});

specSchema.virtual('url').get(function () {
    return `/specs/${this._id}`
});

const Spec = mongoose.model('Spec', specSchema);
module.exports = Spec;
