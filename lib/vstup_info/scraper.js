const cheerio = require('cheerio');
const request = require('request');
const Q = require('q');


const config = {
    rootUrl: 'http://vstup.info',
    univs: {
        'Київський національний університет імені Тараса Шевченка': {
            // 1 - young specialist, 2 - bachelor, 3 - specialist, 4 - master
            levels: [4]
        }
    },
    year: 2016,
    // 27 - Kyiv
    cityCode: 27,
    // 1 - bachelor, 2 - master, 3 - specialist, 4 - young specialist (?)
    level: 2,
};
config.getBaseUrl = function () {
    return this.rootUrl + `/${this.year}/i${this.year}o${this.cityCode}.html`
};
/**
 * @param {String} url
 */
config.applyUrl = function (url) {
    if (url.charAt(0) === '.') url = url.slice(1);
    return `${this.rootUrl}/${this.year}${url}`;
};

/**
 * Get list of Univs
 * @returns {Promise.<Model.Univ[]>}
 */
function promiseUnivs() {
    const univs = [];
    const deferred = Q.defer();
    request.get(config.getBaseUrl(), function (error, response, html) {
        if (error) return console.log('wow, such error, very in request');
        console.log('Got univs list');
        let $ = cheerio.load(html);

        $('#vnzt0').find('a').each(function () {
            const univName = $(this).text();
            if (Object.keys(config.univs).includes(univName))
                univs.push({
                    name: univName,
                    url: $(this).attr('href')
                })
        });
        deferred.resolve(univs);
    });
    return deferred.promise;
}

/**
 * Get list of specializations (not fully filled)
 * @param {Model.Univ} univ
 * @returns {Promise.<Model.Spec[]>}
 */
function promiseSpecs(univ) {
    const specs = [];
    const types = [
        'Молодший спеціаліст',
        'Магістр',
        'Бакалавр',
        'Спеціаліст'
    ];
    const deferred = Q.defer();
    console.log(config.applyUrl(univ.url));
    request.get(config.applyUrl(univ.url), function (error, response, html) {
        if (error) return console.log('wow, such error, very in request');
        console.log('Got specs list');
        let $ = cheerio.load(html, {decodeEntities: false});

        $('table:not(#about) tbody tr').each(function () {
            const cols = $(this).find('td');

            const spec_info = cols.eq(0).html().split(',<br>');

            const volumes = cols.eq(2).text();
            const regex = /.+?(\d+)/gi;
            let match = regex.exec(volumes);
            let lo = parseInt(match[1]);
            let dz = 0;
            if (match = regex.exec(volumes))
                dz = parseInt(match[1]);

            let chosenType;
            for (let type of types)
                if (spec_info[0].startsWith(type))
                    chosenType = type;

            const url = cols.eq(1).find('a').attr('href');
            if (url) {
                const spec = {
                    url: url,
                    level: chosenType,
                    specialty: '',
                    name: '',
                    form: '',
                    lo: lo,
                    dz: dz
                };
                specs.push(spec)
            }
        });
        deferred.resolve(specs);
    });
    return deferred.promise;
}

/**
 * Specify name, specialty and  form for specialization and get faculty and list of applicants
 * @param {Model.Spec} spec
 * @returns {Promise.<Model.Faculty, Model.Applicant[]>}
 */
function promiseConcreteSpec(spec) {
    const applicants = [];
    const deferred = Q.defer();
    console.log(config.applyUrl(spec.url));
    request.get(config.applyUrl(spec.url), function (error, response, html) {
        if (error) return console.log('wow, such error, very in request');
        console.log('Got page with specialization');
        let $ = cheerio.load(html, {decodeEntities: false});

        const titles = $('.title-page').find('p').eq(-1).html().split('<br>');

        spec.specialty = titles[titles.length-5].replace(/Спеціальність: \d+ /, '');
        spec.name = titles[titles.length-4].replace('Спеціалізація: ', '');
        spec.form = titles[titles.length-2];

        const faculty = {
            name: titles[titles.length-3].replace('факультет: ', ''),
            url: undefined,
        };
        console.log(spec);

        const table = $('table').eq(-2);

        const cols = {};
        let index = 0;
        table.find('thead').find('th').each(function () {
            cols[$(this).text()] = index;
            index++;
        });

        table.find('tbody').find('tr').each(function () {
            const elems = $(this).find('td');
            applicants.push({
                number: parseInt(elems.eq(cols['#']).text()),
                name: elems.eq(cols['ПІБ']).text(),
                score: parseFloat(elems.eq(cols['Σ']).text()),
                doc: elems.eq(cols['Д']).text() === '+',
            })
        });
        deferred.resolve([faculty, applicants]);
    });
    return deferred.promise;
}


async function main() {
    const univs = await promiseUnivs();
    for (let univ of univs) {
        const specs = await promiseSpecs(univ);
        let index = 4;
        for (let spec of specs) {
            promiseConcreteSpec(spec).spread(function (faculty, applicants) {
                console.log(faculty);
                console.log(applicants);
            });
            if (!index--) break;
        }
    }
}

/**
 * Fetch all data and fill up database using provided callbacks.
 * @param {function(Model.Faculty): Promise} setUpFaculty
 * @param {function(Model.Spec): Promise} setUpSpeciality
 * @param {function(Model.Applicant[]): Promise} setUpApplicants
 * @returns {Promise}
 */
function setUpAll(setUpFaculty, setUpSpeciality, setUpApplicants) {
    return promiseUnivs().then(function (univs) {
        for (let univ of univs) {
            // Save data about faculty into DB.
            promiseSpecs(univ).then(function (specs) {
                for (let spec of specs) {
                    promiseConcreteSpec(spec).spread(function (faculty, applicants) {
                        console.log(faculty);
                        console.log(applicants);
                        // fill up data base
                        // setUpFaculty(faculty);
                        // setUpSpeciality(spec);
                        // setUpApplicants(applicants);
                    });
                }
            })
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
    const univs = await promiseUnivs();
    for (let univ of univs) {
        const specs = await promiseSpecs(univ);
        for (let spec of specs) {
            await promiseConcreteSpec(spec).spread(function (faculty, applicants) {
                console.log(faculty);
                console.log(applicants);
                // fill up data base
                // setUpFaculty(faculty);
                // setUpSpeciality(spec);
                // setUpApplicants(applicants);
            });
        }
    }
}

main();

module.exports = {
    setUpAll: setUpAll,
    setUpAllSync: setUpAllSync,
};
