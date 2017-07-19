const ObjectId = require('mongoose').Types.ObjectId;


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


exports.validateId = function(id) {
    return function () {
        if (typeof id === 'string' && ObjectId.isValid(id))
            id = ObjectId(id);
        else
            throw new Error('Bad identifier.');
        return id
    }
};
