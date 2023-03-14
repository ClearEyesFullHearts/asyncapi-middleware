/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

const path = require('node:path');

function operations(operation, controllerDir, useStub = true) {
  const { id, controller } = operation;
  const controllerPath = path.join(controllerDir, controller);
  try {
    const operationMiddleware = require(path.resolve(controllerPath));
    return operationMiddleware[id];
  } catch (err) {
    if (useStub) {
      // return stub
      return (req, res, next) => {
        console.log(`Here should be the handler for operation ${id} called by ${req.path}`);
        next();
      };
    }
    throw new Error(`Missing controller at ${path.resolve(controllerPath)} for ${id}`);
  }
}

module.exports = operations;
