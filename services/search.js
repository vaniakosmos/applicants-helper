const Q = require('q');

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant');

const {errorHandler} = require('./utils');
const mapper = require('./mappers');


exports.search = function search(query, limit = 5) {
    // todo: make some checks and query normalizations
    const regex = new RegExp(query, 'i');
    const findName = {name: {$regex: regex}};
    const findNameUrl = {
        '$or': [
            findName,
            {oUrl: {$regex: regex}},
        ]
    };
    const options = {limit: limit};
    return Q
        .all([
            Univ.find(findName, {}, options),
            Faculty.find(findNameUrl, {}, options),
            Spec.find(findNameUrl, {}, options),
            Applicant.find(findName, {}, options),
        ])
        .catch(function (err) {
            console.error("Search error:", err);
        })
        .then(function (res) {
            return {
                univs: res[0].map(mapper.univ),
                faculties: res[1].map(mapper.faculty),
                specs: res[2].map(mapper.spec),
                applicants: res[3].map(mapper.applicant),
                empty: !(res[0].length || res[1].length || res[2].length || res[3].length)
            }
        })
        .catch(errorHandler)
};
