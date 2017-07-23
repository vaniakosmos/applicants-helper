const ObjectId = require('mongoose').Types.ObjectId;
const Q = require('q');


exports.renderOrNext = function (view, respond, next) {
    return function (result) {
        if (result.error) {
            next()  // eventual 404
        }
        else {
            respond.render(view, result);
        }
    }
};


exports.propagateError = function (next) {
    return function (err) {
        console.error(err);
        next(err)
    }
};


/**
 * @param id
 * @returns {Q.Promise}
 */
exports.validateId = function(id) {
    return Q.fcall(function () {
        if (typeof id === 'string' && ObjectId.isValid(id))
            id = ObjectId(id);
        else
            throw new Error('Bad identifier.');
        return id
    })
};

exports.isAuth = function (req, res, next) {
    if (req.session.authorized) {
        next()
    }
    else {
        console.log('attempt to access restricted route');
        next('route')
    }
};
