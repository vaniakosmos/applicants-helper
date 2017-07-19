const sercive = require('../services/search');

exports.search = function (req, res, next) {
    if (req.xhr) {
        const query = req.query.search;
        if (query && query.length > 0)
            // todo get searches from
            sercive.search(query)
                .then(function (result) {
                    res.json(result.data)
                });
        else
            res.json({
                status: 400,
                error: 'Bad query'
            })
    }
    else {
        next()
    }
};
