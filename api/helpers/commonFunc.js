const errorCodes = require('./errorCodes.json');

const commonFunction = (function() {
  const generateErrorObject = errorCode => {
    return {
      success: false,
      message: errorCodes[errorCode],
      data: {},
      error_code: errorCode
    };
  };

  const generateSuccessObject = (data, message) => {
    return {
      success: true,
      message,
      data
    };
  };

  return {
    generateErrorObject,
    generateSuccessObject
  };
})();

module.exports = commonFunction;
