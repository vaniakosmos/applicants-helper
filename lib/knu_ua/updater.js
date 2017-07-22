const Q = require('q');

const scraper = require('./scraper');
const Spec = require('../../models/spec');
const Applicant = require('../../models/applicant');
const Application = require('../../models/application');


/**
 * Sequentially update each specialization by setting new lastUpdate and
 * calling `scrap` function which for specified `Model.Spec` must update applications data.
 * @return {Promise.<void>}
 */
function update() {
    return Spec
        .find()
        .then(function (specs) {
            return specs.reduce(function (chain, spec) {
                return chain.then(function () {
                    return Spec
                        .findOneAndUpdate({_id: spec._id}, {lastUpdate: new Date()})
                        .then(function () {
                            return scrap(spec);
                        })
                })
            }, Q())
        })
        .catch(function (err) {
            console.error('Error while updating applications:\n', err);
        })
}

/**
 *
 * @param {Model.Spec} spec
 * @returns {Q.Promise}
 */
function scrap(spec) {
    return scraper.promiseApplications(spec)
        .spread(function (applicationObjs) {
            const promises = [];
            for (let applicationObj of applicationObjs) {
                const p = Applicant
                    .findOne({name: applicationObj.name})
                    .then(function (applicant) {
                        return Application.findOneAndUpdate(
                            {
                                applicant: applicant._id,
                                spec: spec._id,
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
