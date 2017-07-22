const applicantService = require('../services/applicant');
const univService = require('../services/univ');
const facultyService = require('../services/faculty');
const specService = require('../services/spec');

exports.search = function (req, res, next) {
    if (req.xhr) {
        try {
            let query = req.query.search.toLowerCase();
            const type = req.query.type;
            query = query.replace(/^[^\wа-яіїґ]+$/, '');
            console.log('query:', query);
            if (query && query.length > 0) {
                chooseService(type)
                    .search(query)
                    .then(function (result) {
                        result.type = type;
                        res.json(result)
                    });
            }
            else {
                res.json({
                    status: 400,
                    error: 'Bad query',
                    type: type,
                })
            }
        } catch (err) {
            console.error(err);
        }

    }
    else {
        next()
    }
};

function chooseService(type) {
    switch (type) {
        case 'dudes':
            return applicantService;
        case 'univs':
            return univService;
        case 'faculties':
            return facultyService;
        case 'specs':
            return specService;
        default:
            return applicantService;
    }
}
