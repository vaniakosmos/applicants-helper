const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Faculty
 * @property {ObjectId} _id
 * @property {String} oUrl - original url
 * @property {String} name
 * @property {ObjectId} univ
 * @property {ObjectId[]} specs
 */
const facultySchema = new Schema({
    oUrl: String,
    name:  {type: String, required: true, max: 100, trim: true},
    univ: {type: ObjectId, ref: 'Univ'},
    specs: [{type: ObjectId, ref: 'Spec'}]
});

facultySchema.virtual('url').get(function () {
    return `/faculties/${this._id}`
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
