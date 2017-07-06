const express = require('express');
const fs = require('fs');
const vhost = require('vhost');
const cors = require('cors');
const marked = require('marked');

const router = express.Router();
const rest = require('connect-rest').create({
    context: '',
    domain: require('domain').create()
});

exports.setup = function (app) {
    app.use(vhost('api.*', router));
    router.use(vhost('api.*', rest.processRequest()));
    router.use(cors());
};


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
 * Takes `name` and `limit` as querystring parameters.
 *
 * `name` - applicant name (or part of it);
 * `limit` (default is `5`) - output limit. Limit of limit is range between 1 and 15 (inclusively).
 *
 * Example of request:
 * `applicants?name={name}&limit={limit}` [(test)](applicants?name=dude&limit=5)
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
rest.get('/applicants', function (req, content, cb) {
    let name = req.params.name || 'dude';
    let limit = parseInt(req.query.limit);
    if (!limit || limit <= 0 && limit > 15)
        limit = 5;
    cb(null, {
        status: 200,
        data: {
            students: [],
            name: name,
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
 * Retrieves specialty info and list of applicants by specialty id.
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
