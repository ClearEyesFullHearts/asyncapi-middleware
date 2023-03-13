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
      next(new Error(`Body validation error on ${err.schemaPath}: ${err.message}`));
    }
  };
}

module.exports = validateBody;
