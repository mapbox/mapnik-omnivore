var util = require('util');

module.exports = function invalid(message) {
  if (typeof message === 'string') {
    message = (util.format.apply(this, arguments)).slice(0, 255);
  }

  var err = message instanceof Error ? message : new Error(message);
  err.code = 'EINVALID';
  return err;
};
