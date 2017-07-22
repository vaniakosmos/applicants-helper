const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

/**
 * @typedef {Object} Model.Application
 * @property {ObjectId} _id
 * @property {ObjectId} spec
 * @property {ObjectId} applicant
 * @property {Number} pos
 * @property {Number} actualPos
 * @property {float} score
 * @property {Boolean} doc
 * @property {Boolean} changedPos
 */
const applicationSchema = new Schema({
    spec: {type: ObjectId, ref: 'Spec'},
    applicant: {type: ObjectId, ref: 'Applicant'},
    pos: Number,
    actualPos: Number,
    score: Number,
    doc: Boolean,
    changedPos: {type: Boolean, default: false},
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
