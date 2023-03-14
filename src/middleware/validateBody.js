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
const addFormats = require('ajv-formats');
const ValidationError = require('../validationError');

const ajv = new Ajv();
addFormats(ajv);

function validateBody(payloadSchema) {
  const validate = ajv.compile(payloadSchema);

  return (req, res, next) => {
    const valid = validate(req.body);
    if (valid) {
      req.api = {
        ...req.api,
        body: req.body,
      };
      next();
    } else {
      const [err] = validate.errors;
      const invalid = new ValidationError(
        ValidationError.BODY_VALIDATION_FAILURE,
        `Body validation error on ${err.schemaPath}: ${err.message}`,
        err,
      );
      next(invalid);
    }
  };
}

module.exports = validateBody;
