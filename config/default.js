require('dotenv').config({path: __dirname + '/../.env'});


module.exports = {
    debug: process.env['DEBUG'],
    db: {
        url: process.env['DB_URL'],
    }
};
