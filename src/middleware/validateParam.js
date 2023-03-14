/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */
const Ajv = require('ajv');
const ValidationError = require('../validationError');

const ajv = new Ajv({ coerceTypes: true });

function validateParams(paramsSchema) {
  const validate = ajv.compile(paramsSchema);

  return (req, res, next) => {
    const { 0: ignoreIfExists, ...myParams } = req.params;
    const valid = validate(myParams);
    if (valid) {
      req.api = {
        ...req.api,
        params: myParams,
      };
      next();
    } else {
      const [err] = validate.errors;
      const invalid = new ValidationError(
        ValidationError.PARAMS_VALIDATION_FAILURE,
        `Parameter validation error on ${err.schemaPath}: ${err.message}`,
        err,
      );
      next(invalid);
    }
  };
}

module.exports = validateParams;
