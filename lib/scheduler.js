const schedule = require('node-schedule');
const {updateAndRecalculatePos} = require('./database');


exports.scheduleUpdate = function () {
    schedule.scheduleJob('0 20 * * *', function(){
        updateAndRecalculatePos()
            .then(function () {
                console.log('SCHEDULER: database was updated.');
            })
            .catch(function (err) {
                console.error('SCHEDULER: got en error while proceed update: ' + err.message);
            })
    });
};
