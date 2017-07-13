const Q = require('q');

const scraper = require('./scraper');
const Spec = require('../../models/spec');
const Applicant = require('../../models/applicant').Applicant;
const Application = require('../../models/applicant').Application;


/**
 *
 * @return {Promise.<void>}
 */
function update() {
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
        })
        .then(async function () {
            console.log('Successfully updated data');
            let count = await Application.count({lastUpdate: {'$exists': true}});
            console.log('count with lastUpdate: ', count);
            count = await Application.count({});
            console.log('count all: ', count);
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
                                doc: applicationObj.doc,
                                changedPos: false,
                                lastUpdate: new Date(),
                            });
                    });
                promises.push(p);
            }
            return Q.all(promises);
        })
}

module.exports = update;
