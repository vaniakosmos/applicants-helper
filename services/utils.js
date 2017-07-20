exports.errorHandler = function (err) {
    console.error(err);
    return {
        status: 400,
        error: err.message,
    }
};
