module.exports = function invalid(message) {
    var err = message instanceof Error ? message : new Error(message);
    err.code = 'EINVALID';
    return err;
};
