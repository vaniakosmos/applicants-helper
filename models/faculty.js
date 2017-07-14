const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Faculty
 * @property {ObjectId} _id
 * @property {String} url
 * @property {String} name
 */

const facultySchema = new Schema({
    url: String,
    name:  String,
    univ_id: {type: ObjectId, ref: 'Univ'},
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
