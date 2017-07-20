const Q = require('q');

const Spec = require('../../models/spec');
const Application = require('../../models/application');

/**
 * Pseudocode:
 * <pre><code>
 *  for spec in specs:
 *      for applications in spec:
 *          sort applications by position (if needed)
 *          for each application:
 *              find all applications for current applicant
 *              if any application marked as applied (doc=true)
 *                  then for all other applications in current spec decrement actualScore
 *                  for applicant that has lower scores
 * </code></pre>
 * @return {Promise}
 */
module.exports = function () {
    return Spec.find()
        .then(function (specs) {
            return specs.reduce(function (chain, spec) {
                return chain.then(function () {
                    return handleSpecialization(spec)
                })
            }, Q());
        })
        .catch(function (err) {
            console.error('Error while recalculating actual positions:\n', err);
        })
        .then(async function () {
            console.log(await Application.find({changedPos: true}));
        })
};


function handleSpecialization(spec) {
    return Application.find({spec: spec._id})
        .then(function (applications) {
            console.log(`Found applications for spec: "${spec.name}"`);
            const promises = [];
            applications.sort((a, b) => a.pos - b.pos);
            for (let i = 0; i < applications.length; i++) {
                promises.push(handleParticularApplicant(applications, i))
            }
            return Q.all(promises)
        })
}


function handleParticularApplicant(applications, index) {
    return Application
        .find({applicant: applications[index].applicant})
        .then(function (applicationsForDude) {
            // console.log(`Found application for some dude with id "${applications[index].applicant_id}"`);
            let appliedApplicationId = undefined;
            for (let application of applicationsForDude) {
                if (application.doc === true) {
                    appliedApplicationId = application._id;
                    break;
                }
            }
            if (!applications[index]._id.equals(appliedApplicationId)) {
                return decrementPos(applications.slice(index + 1))
            }
        });
}


function decrementPos(applications) {
    const bulkOps = [];
    for (let application of applications) {
        bulkOps.push({
            'updateOne': {
                'filter': {_id: application._id},
                'update': {
                    '$inc': {'actualPos': -1},
                    '$set': {'changedPos': true},
                },
            }
        });
    }
    if (bulkOps.length)
        return Application.collection.bulkWrite(bulkOps);
}
