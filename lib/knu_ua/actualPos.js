const Q = require('q');

const Spec = require('../../models/spec');
const Application = require('../../models/applicant').Application;

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
function calculateActualPos() {
    return Spec.find({})
        .then(function (specs) {
            let chain = Q();
            for (let spec of specs) {
                chain = chain.then(function () {
                    return handleSpecialization(spec)
                });
            }
            return chain
        })
        .catch(function (err) {
            console.error('Error while recalculating actual positions:\n', err);
        })
}


function handleSpecialization(spec) {
    return Application.find({spec_id: spec._id})
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
        .find({applicant_id: applications[index].applicant_id})
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


module.exports = calculateActualPos;
