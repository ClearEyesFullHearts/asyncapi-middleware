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

function cleanHeaders(headers) {
  const {
    'x-parser-schema-id': ignore,
    ...restHeaders
  } = headers;

  Object.keys(restHeaders).forEach((k) => {
    if (Object.prototype.toString.call(restHeaders[k]) === '[object Object]') {
      restHeaders[k] = cleanHeaders(restHeaders[k]);
    }
  });

  return restHeaders;
}

function validateHeaders(headersSchema) {
  const validate = ajv.compile(cleanHeaders(headersSchema));

  return (req, res, next) => {
    const { headers } = req;
    const valid = validate(headers);
    if (valid) {
      req.api = {
        ...req.api,
        headers,
      };
      next();
    } else {
      const [err] = validate.errors;
      const invalid = new ValidationError(
        ValidationError.HEADER_VALIDATION_FAILURE,
        `Header validation error on ${err.schemaPath}: ${err.message}`,
        err,
      );
      next(invalid);
    }
  };
}

module.exports = validateHeaders;
