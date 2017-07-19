exports.errorHandler = function (err) {
    return {
        status: 400,
        error: err.message,
    }
};
