const cheerio = require('cheerio');
const request = require('request');
const Q = require('q');


const config = {
    rootUrl: 'http://knu.ua',
    univ: 'Київський національний університет імені Тараса Шевченка',
    year: 2016,
    // 1 - bachelor, 2 - master, 3 - specialist, 4 - young specialist (?)
    level: 2,
};
config.getBaseUrl = function () {
    return this.rootUrl + `/ua/abit/${this.year}/Lists/${this.level}/`
};


function promiseUniv() {
    return Q({
        url: null,
        name: config.univ,
    })
}


/**
 * Get list of faculties.
 * @property {Model.Univ} univ
 * @returns {Promise.<Model.Faculty[]>}
 */
function promiseFaculties(univ) {
    const faculties = [];
    const deferred = Q.defer();
    request.get(config.getBaseUrl(), function (error, response, html) {
        if (error) return console.log('wow, such error, very in request');
        console.log('Got faculties list');
        let $ = cheerio.load(html);

        $('.b-references__link').each(function () {
            faculties.push({
                univ_id: univ._id,
                url: $(this).attr('href'),
                name: $(this).text().trim(),
            });
        });
        deferred.resolve(faculties);
    });
    return deferred.promise;
}


/**
 * Set up specialisations for faculty.
 * @param {Model.Faculty} faculty
 * @returns {Promise.<Model.Spec[]>}
 */
function promiseSpecs(faculty) {
    const specs = [];
    const nameRegex = /^(.+?)-(.+?)(?:-(.+?))?\.\s*(Денна форма навчання|Заочна форма навчання)$/i;
    const deferred = Q.defer();
    request.get(config.rootUrl + faculty.url, function (error, response, html) {
        if (error) return console.log('oops');
        console.log(`Got specs list for "${faculty.name}"`);
        const $ = cheerio.load(html);
        $('.b-references__link').each(function () {
            let match = nameRegex.exec($(this).text());
            specs.push({
                faculty_id: faculty._id,
                url: $(this).attr('href'),
                specialty: match[1].trim(),
                name: (match[3] || match[2]).trim(),
                form: match[4].trim(),
                level: 'Магістр',
                lo: 0,
                dz: 0,
            });
        });
        deferred.resolve(specs);
    });
    return deferred.promise;
}


/**
 * Set up applicants for specialisation.
 * Also specify spec.lo and spec.dz.
 * @param {Model.Spec} spec
 * @returns {Promise.<Model.Application[]>} - actully it's not Application
 * type but instead of applicants id there is his/her name
 */
function promiseApplications(spec) {
    const applications = [];
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
            const pos = parseInt(elems.eq(0).text());
            applications.push({
                spec_id: spec._id,
                pos: pos,
                actualPos: pos,
                name: elems.eq(1).text(),
                score: parseFloat(elems.eq(2).text()),
                doc: elems.eq(-1).text() === '+',
            })
        });
        deferred.resolve(applications);
    });
    return deferred.promise;
}


/**
 * ABSOLUTE MADNESS!!!1! THIS IS JUST ASYNC HELL! (but it's quite fast)
 * Fetch all data and fill up database using provided callbacks.
 * @param {function(Model.Faculty): Promise} setUpFaculty
 * @param {function(Model.Spec): Promise} setUpSpeciality
 * @param {function(Model.Applicant[]): Promise} setUpApplicants
 * @returns {Promise}
 */
function setUpAll(setUpFaculty, setUpSpeciality, setUpApplicants) {
    return promiseFaculties().then(function (faculties) {
        for (let faculty of faculties) {
            // Save data about faculty into DB.
            setUpFaculty(faculty);
            promiseSpecs(faculty).then(function (specs) {
                for (let spec of specs) {
                    promiseApplications(spec).then(function (applicants) {
                        // Save data about specialisation into DB. Update applicants data.
                        setUpApplicants(applicants);
                        setUpSpeciality(spec);
                    });
                }
            });
        }
    })
}

/**
 * Fetch all data and fill up database step by step using provided callbacks.
 * @param {function(Model.Faculty):Promise} setUpFaculty
 * @param {function(Model.Spec):Promise} setUpSpeciality
 * @param {function(Model.Applicant[]):Promise} setUpApplicants
 * @returns {Promise}
 */
async function setUpAllSync(setUpFaculty, setUpSpeciality, setUpApplicants) {
    const faculties = await promiseFaculties();
    for (let faculty of faculties) {
        // Save data about faculty into DB.
        await setUpFaculty(faculty);
        const specs = await promiseSpecs(faculty);
        for (let spec of specs) {
            const applicants = await promiseApplications(spec);
            // Save data about specialisation into DB. Update applicants data.
            await setUpSpeciality(spec);
            await setUpApplicants(applicants);
            console.log(applicants.length);
        }
        break
    }
}


module.exports = {
    promiseUniv: promiseUniv,
    promiseFaculties: promiseFaculties,
    promiseSpecs: promiseSpecs,
    promiseApplications: promiseApplications,
    setUpAll: setUpAll,
    setUpAllSync: setUpAllSync,
};
