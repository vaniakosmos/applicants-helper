const Q = require('q');

const Univ = require('../models/univ');
const Faculty = require('../models/faculty');
const Spec = require('../models/spec');
const Applicant = require('../models/applicant').Applicant;

const {univMapper} = require('./univ');
const {facultyMapper} = require('./faculty');
const {specMapper} = require('./spec');
const {applicantMapper} = require('./applicant');
const {errorHandler} = require('./utils');


exports.search = function search(query, limit = 5) {
    // todo: make some checks and query normalizations
    const regex = new RegExp(query, 'i');
    const findName = {name: {$regex: regex}};
    const findNameUrl = {
        '$or': [
            findName,
            {url: {$regex: regex}},
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
                univs: res[0].map(univMapper),
                faculties: res[1].map(facultyMapper),
                specs: res[2].map(specMapper),
                applicants: res[3].map(applicantMapper),
                empty: !(res[0].length || res[1].length || res[2].length || res[3].length)
            }
        })
        .catch(errorHandler)
};
