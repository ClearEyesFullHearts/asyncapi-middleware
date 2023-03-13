/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

function operations(operationId) {
  // return stub
  return (req, res, next) => {
    console.log(`Here should be the handler for operation ${operationId} called by ${req.path}`);
    next();
  };
}

module.exports = operations;
