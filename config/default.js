require('dotenv').config({path: __dirname + '/../.env'});


module.exports = {
    debug: process.env['DEBUG'],
    db: {
        url: process.env['DB_URL'],
    },
    admin: {
        name: process.env['ADMIN_NAME'],
        pass: process.env['ADMIN_PASS'],
    },
    session: {
        secret: process.env['SESSION_SECRET'],
    }
};
