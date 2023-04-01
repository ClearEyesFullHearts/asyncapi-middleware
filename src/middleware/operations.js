/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

const path = require('path');

function returnStub(id, reason) {
  console.warn(`A stub middleware is created for operation ${id} because: ${reason}`);
  return (req, res, next) => {
    console.log(`Here should be the handler for operation ${id} called by ${req.path} with these infos ${req.api}`);
    next();
  };
}

function operations(operation, controllerDir, useStub = false) {
  const { id, controller } = operation;
  const controllerPath = path.resolve(path.join(controllerDir, controller));
  if (!id) {
    if (useStub) {
      return returnStub(id, 'Missing information [operationId]');
    }
    throw new Error('Missing information [operationId]: operation middleware cannot be created');
  }

  let operationController;
  try {
    // eslint-disable-next-line
    operationController = require(controllerPath);
  } catch (err) {
    if (useStub) {
      return returnStub(id, `Impossible to load the controller at ${controllerPath}`);
    }
    throw new Error(`Impossible to load the controller at ${controllerPath} for operation ${id}`);
  }
  const fn = operationController[id];
  if (!fn || typeof fn !== 'function') {
    if (useStub) {
      return returnStub(id, 'The operation is not a function');
    }
    throw new Error(`The operation ${id} called on the controller ${controllerPath} is not a function`);
  }
  // function to create middleware(s) i.e () => return middleware
  if (fn.length === 0) return fn();

  // directly a middleware i.e (req, res, next) => do something
  return fn;
}

module.exports = operations;
