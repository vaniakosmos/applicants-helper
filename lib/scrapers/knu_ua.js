const cheerio = require('cheerio');
const request = require('request');
const Q = require('q');

/**
 * @typedef {Object} Faculty
 * @property {String} url
 * @property {String} name
 * @property {Array.<Spec>} specs
 */

/**
 * @typedef {Object} Spec
 * @property {String} url
 * @property {String} name
 * @property {String} desc
 * @property {String} type
 * @property {Number} lo - licensed volume
 * @property {Number} dz - volume of the state order
 * @property {Array.<Applicants>} applicants
 */

/**
 * @typedef {Object} Applicants
 * @property {Number} number
 * @property {String} name
 * @property {Number} score
 * @property {Boolean} doc
 */

const config = {
    rootUrl: 'http://knu.ua',
    year: 2016,
    // 1 - bachelor, 2 - master, 3 - specialist, 4 - young specialist (?)
    level: 2,
};
config.getBaseUrl = function () {
    return this.rootUrl + `/ua/abit/${this.year}/Lists/${this.level}/`
};


/**
 * Get list of faculties.
 * @returns {promise}
 */
function getFaculties() {
    const faculties = [];
    const deferred = Q.defer();
    request.get(config.getBaseUrl(), function (error, response, html) {
        if (error) return console.log('wow, such error, very in request');
        console.log('Got faculties list');
        let $ = cheerio.load(html);

        $('.b-references__link').each(function () {
            faculties.push({
                url: $(this).attr('href'),
                name: $(this).text().trim(),
                specs: [],
            });
        });
        deferred.resolve(faculties);
    });
    return deferred.promise;
}


/**
 * Set up specialisations for faculty.
 * @param {Faculty} faculty
 * @returns {promise}
 */
function getSpecs(faculty) {
    const nameRegex = /^(.+?)-(.+?)(?:-(.+?))?\.(.+?)$/i;
    const deferred = Q.defer();
    request.get(config.rootUrl + faculty.url, function (error, response, html) {
        if (error) return console.log('oops');
        console.log(`Got specs list for "${faculty.name}"`);
        const $ = cheerio.load(html);

        $('.b-references__link').each(function () {
            let match = nameRegex.exec($(this).text());
            faculty.specs.push({
                url: $(this).attr('href'),
                desc: match[1].trim(),
                name: (match[3] || match[2]).trim(),
                type: match[4].trim(),
                lo: 0,
                dz: 0,
                applicants: [],
            });
        });
        deferred.resolve(faculty);
    });
    return deferred.promise;
}


/**
 * Set up applicants for specialisation.
 * @param {Spec} spec
 * @returns {promise}
 */
function getApplicants(spec) {
    const deferred = Q.defer();
    request.get(config.rootUrl + spec.url, function (error, response, html) {
        if (error) return console.log('oops');
        console.log(`Got applicants list for spec "${spec.name}"`);
        const $ = cheerio.load(html);

        const titles = $('h1.b-body__title');
        const numRegex = /^.*?(\d+).*$/;
        const loMatch = numRegex.exec(titles.eq(-2).text());
        const dzMatch = numRegex.exec(titles.eq(-1).text());
        if (loMatch) spec.lo = parseInt(loMatch[1]);
        if (dzMatch) spec.dz = parseInt(dzMatch[1]);

        $('tbody').find('tr:not(.rating)').each(function () {
            const elems = $(this).find('td');
            spec.applicants.push({
                number: parseInt(elems.eq(0).text()),
                name: elems.eq(1).text(),
                score: parseFloat(elems.eq(2).text()),
                doc: elems.eq(-1).text() === '+',
            })
        });
        deferred.resolve(spec);
    });
    return deferred.promise;
}

/**
 * Example of usage.
 */
function main() {
    module.exports.getFaculties().then(function (faculties) {
        // promise to get spec for each faculty
        const promises = [];
        for (let faculty of faculties) {
            const promise = getSpecs(faculty);
            promises.push(promise);
        }
        // wait for all specs
        Q.all(promises).then(function (faculties) {
            for (let faculty of faculties) {
                const promises = [];
                for (let spec of faculty.specs) {
                    const promise = getApplicants(spec);
                    promises.push(promise);
                }
                Q.all(promises).then(function (specs) {
                    console.log(specs);
                });
                break
            }
        });
    });
}

main();

module.exports = {
    getFaculties: getFaculties,
    getSpecs: getSpecs,
    getApplicants: getApplicants,
};
