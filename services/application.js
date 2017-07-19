const Application = require('../models/application');
const {errorHandler} = require('./utils');


function applicationMapper(application) {
    return {
        pos: Number,
        actualPos: Number,
        score: application.score,
        doc: application.doc,
    }
}

exports.applicationMapper = applicationMapper;
