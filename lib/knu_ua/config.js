const config = {
    rootUrl: 'http://knu.ua',
    univ: 'Київський національний університет імені Тараса Шевченка',
    year: 2016,
    // 1 - bachelor, 2 - master, 3 - specialist, 4 - young specialist (?)
    level: 2,  //todo: make array and scrap all levels
};

config.getBaseUrl = function () {
    return this.rootUrl + `/ua/abit/${this.year}/Lists/${this.level}/`
};

module.exports = config;
