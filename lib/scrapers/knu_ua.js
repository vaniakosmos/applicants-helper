const cheerio = require('cheerio');
const request = require('request');
const Q = require('q');


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
 * @returns {Promise.<Scraper.Faculty[]>}
 */
function promiseFaculties() {
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
            });
        });
        deferred.resolve(faculties);
    });
    return deferred.promise;
}


/**
 * Set up specialisations for faculty.
 * @param {Scraper.Faculty} faculty
 * @returns {Promise.<Scraper.Spec[]>}
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
 * @param {Scraper.Spec} spec
 * @returns {Promise.<Scraper.Applicant[]>}
 */
function promiseApplicants(spec) {
    const applicants = [];
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
            applicants.push({
                number: parseInt(elems.eq(0).text()),
                name: elems.eq(1).text(),
                score: parseFloat(elems.eq(2).text()),
                doc: elems.eq(-1).text() === '+',
            })
        });
        deferred.resolve(applicants);
    });
    return deferred.promise;
}


/**
 * ABSOLUTE MADNESS!!!1! THIS IS JUST ASYNC HELL! (but it's quite fast)
 * Fetch all data and fill up database using provided callbacks.
 * @param {function(Scraper.Faculty): Promise} setUpFaculty
 * @param {function(Scraper.Spec): Promise} setUpSpeciality
 * @param {function(Scraper.Applicant[]): Promise} setUpApplicants
 * @returns {Promise}
 */
function setUpAll(setUpFaculty, setUpSpeciality, setUpApplicants) {
    return promiseFaculties().then(function (faculties) {
        for (let faculty of faculties) {
            // Save data about faculty into DB.
            setUpFaculty(faculty);
            promiseSpecs(faculty).then(function (specs) {
                for (let spec of specs) {
                    promiseApplicants(spec).then(function (applicants) {
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
 * @param {function(Scraper.Faculty):Promise} setUpFaculty
 * @param {function(Scraper.Spec):Promise} setUpSpeciality
 * @param {function(Scraper.Applicant[]):Promise} setUpApplicants
 * @returns {Promise}
 */
async function setUpAllSync(setUpFaculty, setUpSpeciality, setUpApplicants) {
    const faculties = await promiseFaculties();
    for (let faculty of faculties) {
        // Save data about faculty into DB.
        await setUpFaculty(faculty);
        const specs = await promiseSpecs(faculty);
        for (let spec of specs) {
            const applicants = await promiseApplicants(spec);
            // Save data about specialisation into DB. Update applicants data.
            await setUpSpeciality(spec);
            await setUpApplicants(applicants);
            console.log(applicants.length);
        }
        break
    }
}

const setUpFaculty = function (faculty) {
    return new Promise(function (resolve) {
        console.log(faculty.name);
        resolve(0);
    });
};

const setUpSpeciality = function (spec) {
    return new Promise(function (resolve) {
        console.log(spec.name);
        resolve(1);
    });
};

const setUpApplicants = function (applicants) {
    return new Promise(function (resolve) {
        console.log(applicants.length);
        resolve(2);
    });
};

// main()
setUpAll(setUpFaculty, setUpSpeciality, setUpApplicants).then(function () {
    console.log('done');
});
// setUpAllSync(setUpFaculty, setUpSpeciality, setUpApplicants).then(function () {
//     console.log('done');
// });

module.exports = {
    promiseFaculties: promiseFaculties,
    promiseSpecs: promiseSpecs,
    promiseApplicants: promiseApplicants,
    setUpAll: setUpAll,
    setUpAllSync: setUpAllSync,
};
