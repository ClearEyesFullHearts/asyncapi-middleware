/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */
const decorator = require('./src/decorator');
const ValidationError = require('./src/validationError');

module.exports = decorator;
module.exports.ValidationError = ValidationError;
