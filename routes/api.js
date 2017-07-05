const express = require('express');
const fs = require('fs');
const Rest = require('connect-rest');
const vhost = require('vhost');
const marked = require('marked');

const router = express.Router();
const rest = Rest.create({
    context: '',
    domain: require('domain').create()
});
router.use(vhost('api.*', rest.processRequest()));

marked.setOptions({
    "breaks": true,
});

/**
 * About API endpoints.
 * */
router.get('/', function (req, res) {
    const endpoints = get_docs();
    res.render('api/index', {
        endpoints: endpoints,
    });
});

/**
 * Retrieves list of applicants based on given name.
 * Takes `limit` as querystring parameter.
 *
 * Example of response:
 * ```
 * {
 *   status: 200,
 *   data: {
 *     students: [],
 *     name: "dude",
 *     limit: 7
 *   }
 * }
 * ```
 * */
rest.get('/applicant/:name', function (req, content, cb) {
    let limit = parseInt(req.query.limit);
    if (!limit || limit <= 0 && limit >= 15) {
        limit = 5
    }
    cb(null, {
        status: 200,
        data: {
            students: [],
            name: req.params.name,
            limit: limit,
        },
    });
});

/**
 * Retrieves info about applicant by given id.
 * */
rest.get('/applicant/:id', function (req, content, cb) {
    cb(null, {
        status: 200,
        data: {
            name: 'dude',
            specs: [
                {
                    id: '1',
                    faculty: "f",
                    name: "one",
                    position: 5,
                    actualPosition: 2,
                    chance: 0.8,
                    originalUrl: "",
                },
            ],
        },
    });
});

/**
 * Retrieves specialty info and list of applicants by id.
 * */
rest.get('/specialty/:id', function (req, content, cb) {
    cb(null, {
        status: 200,
        data: {
            id: 1,
            name: "one",
            originalUrl: "",
            students: []
        },
    });
});


module.exports = router;

function get_docs() {
    // match docstring and endpoint url
    const re = /\/\*\*\s*((?: \*.*\n)+).*\*\/\s*\w+\.(get|post|put|delete)\('(.{2,})',/gi;
    const endpoints = [];
    const data = fs.readFileSync(__filename, 'utf8');
    if (data) {
        let match;
        while (match = re.exec(data)) {
            let endpoint = {};
            endpoint.verb = match[2].toUpperCase();
            endpoint.url = match[3];
            endpoint.docstring = match[1]
                .trim()
                .split('\n')
                .map(x => x.replace(/^\s*\*\s?/, ''))
                .join('\n');
            endpoint.docstring = marked(endpoint.docstring);
            endpoints.push(endpoint);
        }
    }
    return endpoints;
}
