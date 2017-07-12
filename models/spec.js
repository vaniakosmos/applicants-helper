const mongoose = require('mongoose');

/**
 * @typedef {Object} Model.Spec
 * @property {Object} _id
 * @property {String} url
 * @property {String} name
 * @property {String} specialty
 * @property {String} form
 * @property {String} level
 * @property {int} lo - licensed volume
 * @property {int} dz - volume of the state order
 */

const specSchema = new mongoose.Schema({
    url: String,
    name:  String,
    specialty: String,
    form: String,
    level: String,
    lo: Number,
    dz: Number,
    faculty_id: mongoose.Schema.Types.ObjectId,
});

const Spec = mongoose.model('Spec', specSchema);
module.exports = Spec;
