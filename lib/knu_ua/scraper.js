const cheerio = require('cheerio');
const request = require('request');
const Q = require('q');

const config = require('./config');


/**
 * Get univ data.
 * @return {Q.Promise}
 */
exports.promiseUniv = function () {
    return Q({
        oUrl: config.rootUrl + '/ua/abit',
        name: config.univ,
    })
};


/**
 * Get list of faculties.
 * @property {Model.Univ} univ
 * @returns {Q.Promise}
 */
exports.promiseFaculties = function () {
    const faculties = [];
    const deferred = Q.defer();
    request.get(config.getBaseUrl(), function (error, response, html) {
        if (error) return console.error("din't fetch faculties");
        console.log('Got faculties list');
        let $ = cheerio.load(html);

        $('.b-references__link').each(function () {
            faculties.push({
                // univ: univ._id,
                oUrl: config.rootUrl + $(this).attr('href'),
                name: $(this).text().trim(),
            });
        });
        deferred.resolve(faculties);
    });
    return deferred.promise;
};


/**
 * Set up specialisations for faculty.
 * @param {Model.Faculty} faculty
 * @returns {Q.Promise}
 */
exports.promiseSpecs = function (faculty) {
    const specs = [];
    const nameRegex = /^(.+?)-(.+?)(?:-(.+?))?\.\s*(Денна форма навчання|Заочна форма навчання)$/i;
    const deferred = Q.defer();
    request.get(faculty.oUrl, function (error, response, html) {
        if (error) return console.error(`din't fetch specializations from ${response.url}`);
        console.log(`Got specs list for "${faculty.name}"`);
        const $ = cheerio.load(html);

        $('.b-references__link').each(function () {
            let match = nameRegex.exec($(this).text());
            specs.push({
                // faculty: faculty._id,
                oUrl: config.rootUrl + $(this).attr('href'),
                specialty: match[1].trim(),
                name: (match[3] || match[2]).trim(),
                form: match[4].trim(),
                level: 'Магістр',  // fixme
                lo: undefined,
                dz: undefined,
            });
        });
        deferred.resolve(specs);
    });
    return deferred.promise;
};


/**
 * Set up applicants for specialisation.
 * Also specify spec.lo and spec.dz.
 * @param {Model.Spec} spec
 * @returns {Q.Promise} - like Application[]
 * but instead of applicants id there is his/her name and no spec_id
 */
exports.promiseApplications = function (spec) {
    const applications = [];
    const deferred = Q.defer();
    request.get(spec.oUrl, function (error, response, html) {
        if (error) return console.error("din't fetch applications");
        console.log(`Got applicants list for spec "${spec.name}"`);
        const $ = cheerio.load(html);

        const titles = $('h1.b-body__title');
        const numRegex = /^.*?(\d+).*$/;
        const loMatch = numRegex.exec(titles.eq(-2).text());
        const dzMatch = numRegex.exec(titles.eq(-1).text());

        let lo = 0, dz = 0;
        if (loMatch) lo = parseInt(loMatch[1]);
        if (dzMatch) dz = parseInt(dzMatch[1]);

        $('tbody').find('tr:not(.rating)').each(function () {
            const elems = $(this).find('td');
            const pos = parseInt(elems.eq(0).text());
            applications.push({
                pos: pos,
                actualPos: pos,
                name: elems.eq(1).text(),
                score: parseFloat(elems.eq(2).text()),
                doc: elems.eq(-1).text() === '+',
            })
        });
        deferred.resolve([applications, {lo: lo, dz: dz}]);
    });
    return deferred.promise;
};
