/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */
const { parse, AsyncAPIDocument } = require('@asyncapi/parser');

const validateParams = require('./middleware/validateParam');
const validateBody = require('./middleware/validateBody');
const callOperation = require('./middleware/operations');

const CONTROLLER_EXT = 'x-operation-controller';

async function decorateApplication(app, asyncApiDoc, options = {}) {
  let api = asyncApiDoc;
  if (!(api instanceof AsyncAPIDocument)) {
    api = await parse(asyncApiDoc);
  }

  const {
    tag = '', controllers = '', stubMiddleware = false, requireController = true,
  } = options;

  const chans = api.channelNames();
  const listeners = chans.reduce((prev, channelName) => {
    const chan = api.channel(channelName);
    if (chan.hasPublish()) {
      const ope = chan.publish();
      if (tag && !ope.hasTag(tag)) return prev;
      // Replace AsyncAPI syntax for path parameters with Express' version
      const routeName = channelName.replace(/{/g, ':').replace(/}/g, '');
      const msgParams = Object.keys(chan.parameters()).reduce((prevP, pName) => {
        const { properties, required } = prevP;
        const { type } = chan.parameter(pName).schema().json();
        return {
          type: 'object',
          additionalProperties: false,
          properties: {
            ...properties,
            [pName]: { type },
          },
          required: [...required, pName],
        };
      }, {
        type: 'object',
        additionalProperties: false,
        properties: {},
        required: [],
      });

      prev.push({
        route: routeName,
        operation: {
          id: ope.id(),
          controller: ope.hasExtension(CONTROLLER_EXT) ? ope.ext(CONTROLLER_EXT) : '',
        },
        payloadSchema: ope.message().originalPayload(),
        parametersSchema: msgParams,
      });
      return prev;
    }
    return prev;
  }, []);

  const l = listeners.length;
  for (let i = 0; i < l; i += 1) {
    const {
      route, parametersSchema, payloadSchema, operation,
    } = listeners[i];

    const middlewares = [
      validateParams(parametersSchema),
      validateBody(payloadSchema),
    ];
    if (requireController) {
      middlewares.push(callOperation(operation, controllers, stubMiddleware));
    }
    app.use(route, middlewares);
  }

  return app;
}

module.exports = decorateApplication;
