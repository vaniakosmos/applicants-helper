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
                    return Spec
                        .findOneAndUpdate({_id: spec._id}, {lastUpdate: new Date()})
                        .then(function () {
                            return scrap(spec);
                        })

                })
            }
            return chain
        })
}

function scrap(spec) {
    // todo: optimise single calls. But there is no such thing as 'bulk findOne' so probably it's not even possible...
    return scraper.promiseApplications(spec)
        .then(function (applicationObjs) {
            const promises = [];
            for (let applicationObj of applicationObjs) {
                const p = Applicant
                    .findOne({name: applicationObj.name})
                    .then(function (applicant) {
                        return Application.findOneAndUpdate(
                            {
                                applicant_id: applicant._id,
                                spec_id: applicationObj.spec_id,
                            },
                            {
                                pos: applicationObj.pos,
                                actualPos: applicationObj.actualPos,
                                score: applicationObj.score,
                                doc: applicationObj.doc,
                                changedPos: false,
                            });
                    });
                promises.push(p);
            }
            return Q.all(promises);
        })
}

module.exports = update;
