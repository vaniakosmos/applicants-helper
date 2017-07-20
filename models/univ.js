const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Univ
 * @property {ObjectId} _id
 * @property {String} oUrl - original url
 * @property {String} name - name of university
 * @property {ObjectId[]} faculties
 */
const univSchema = new Schema({
    oUrl: String,
    name:  {type: String, required: true, max: 100, trim: true},
    faculties: [{type: ObjectId, ref: 'Faculty'}]
});

univSchema.virtual('url').get(function () {
    return `/univs/${this._id}`
});

const Univ = mongoose.model('Univ', univSchema);
module.exports = Univ;
