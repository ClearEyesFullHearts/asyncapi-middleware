/*!
 * asyncapi-middleware
 * Copyright(c) 2023 MFT
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */
const parser = require('@asyncapi/parser');

const validateParams = require('./middleware/validateParam');
const validateBody = require('./middleware/validateBody');
const callOperation = require('./middleware/operations');

async function decorateApplication(app, asyncApiDoc) {
  const api = await parser.parse(asyncApiDoc);

  const chans = api.channelNames();
  const listeners = chans.reduce((prev, channelName) => {
    const chan = api.channel(channelName);
    if (chan.hasPublish()) {
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
        operationId: chan.publish().id(),
        payloadSchema: chan.publish().message().originalPayload(),
        parametersSchema: msgParams,
      });
      return prev;
    }
    return prev;
  }, []);

  const l = listeners.length;
  for (let i = 0; i < l; i += 1) {
    const {
      route, parametersSchema, payloadSchema, operationId,
    } = listeners[i];
    const middlewares = [
      validateParams(parametersSchema),
      validateBody(payloadSchema),
      callOperation(operationId),
    ];
    app.use(route, middlewares);
  }

  return app;
}

module.exports = decorateApplication;
