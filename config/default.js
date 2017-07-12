require('dotenv').config({path: '../.env'});

module.exports = {
    debug: process.env['DEBUG'],
    db: {
        url: process.env['DB_URL'],
    }
};
