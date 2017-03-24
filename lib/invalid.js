var util = require('util');

module.exports = function invalid(message) {
  if (typeof message === 'string') {
    message = util.format.apply(this, arguments);
  }

  var err = message instanceof Error ? message : new Error(message);
  err.code = 'EINVALID';
  return err;
};
