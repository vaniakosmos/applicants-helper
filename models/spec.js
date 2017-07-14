const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Spec
 * @property {ObjectId} _id
 * @property {ObjectId} faculty_id
 * @property {String} url
 * @property {String} name
 * @property {String} specialty
 * @property {String} form
 * @property {String} level
 * @property {int} lo - licensed volume
 * @property {int} dz - volume of the state order
 * @property {Date} lastUpdate
 */

const specSchema = new Schema({
    url: String,
    name:  String,
    specialty: String,
    form: String,
    level: String,
    lo: Number,
    dz: Number,
    lastUpdate: {type: Date, default: new Date()},
    faculty_id: {type: ObjectId, ref: 'Faculty'},
});

const Spec = mongoose.model('Spec', specSchema);
module.exports = Spec;
