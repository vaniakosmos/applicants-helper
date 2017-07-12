const mongoose = require('mongoose');

/**
 * @typedef {Object} Model.Univ
 * @property {Object} _id
 * @property {String} url
 * @property {String} name
 */

const univSchema = new mongoose.Schema({
    url: String,
    name:  String,
});

const Univ = mongoose.model('Univ', univSchema);
module.exports = Univ;
