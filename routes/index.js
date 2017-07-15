const express = require('express');
const router = express.Router();

const api = require('../lib/api');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Search',
    });
});

function getByIdAndRender(view, apiFunc, hook) {
    return function (req, res, next) {
        const id = req.params['id'];
        hook && hook(req, res, next);
        apiFunc(id)
            .then(function (result) {
                if (result.status === 400) {
                    next()  // eventual 404
                }
                else {
                    if (view && view.length > 0)
                        res.render(view, result.data);
                    else
                        res.send(result);
                }
            })
            .catch(function (err) {
                console.error(err);
                next(err)
            })
    }
}

router.get('/univs', getByIdAndRender('', api.getUnivs));

router.get('/univ/:id', getByIdAndRender('', api.getFaculties, function (req) {
    const id = req.params['id'];
    console.log('univs_id:', id);
}));

router.get('/faculty/:id', getByIdAndRender('', api.getSpecs));

router.get('/specialization/:id', getByIdAndRender('', api.getApplications));

router.get('/applicant/:id', getByIdAndRender('applicant', api.getApplicant));

router.get('/search', function (req, res, next) {
    if (req.xhr) {
        const query = req.query.search;
        if (query && query.length > 0)
            api.search(query)
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
});


module.exports = router;
