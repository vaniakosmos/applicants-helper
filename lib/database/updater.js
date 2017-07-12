const Q = require('q');

const scraper = require('../scrapers/knu_ua');
const Spec = require('../../models/spec');
const Applicant = require('../../models/applicant').Applicant;
const Application = require('../../models/applicant').Application;


function updater() {
    return Spec
        .find({})
        .then(function (specs) {
            let chain = Q();
            for (let spec of specs) {
                chain = chain.then(function () {
                    return scrap(spec)
                })
            }
            return chain
        }).then(function () {
            console.log('Successfully updated data');
            return Application.find({});
        }).then(function (res) {
            console.log(res);
        })
}

function scrap(spec) {
    return scraper.promiseApplications(spec)
        .then(function (applicationObjs) {
            const promises = [];
            for (let applicationObj of applicationObjs) {
                const p = Applicant
                    .findOne({name: applicationObj.name})
                    .then(function (applicant) {
                        return Application.findOneAndUpdate(
                            {applicant_id: applicant._id},
                            {
                                pos: applicationObj.pos,
                                actualPos: applicationObj.actualPos,
                                score: applicationObj.score,
                                doc: applicationObj.doc
                            });
                    });
                promises.push(p);
            }
            return Q.all(promises);
        })
}

module.exports = updater;
