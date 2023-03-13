const {
  describe, expect, test,
} = require('@jest/globals');
const fs = require('fs');

const decorator = require('../src/decorator');

const MockApp = require('./utils/mockApp');

describe('decorator tests', () => {
  test('decorator should decorate the application from a json object', async () => {
    const app = new MockApp();
    await decorator(app, {
      asyncapi: '2.5.0',
      info: {
        title: 'Streetlights API Simplified',
        version: '1.0.0',
        description: 'The Smartylighting Streetlights API allows you to remotely manage the city lights.\n'
          + '\n'
          + 'This is a simplified version of the Streetlights API from other examples. This version is used in AsyncAPI documentation.\n',
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0',
        },
      },
      servers: {
        rabbit: {
          url: 'amqp://myuser:mypassword@localhost:5672',
          protocol: 'amqp',
        },
      },
      channels: {
        'light.measured': {
          publish: {
            summary: 'Inform about environmental lighting conditions for a particular streetlight.',
            operationId: 'onLightMeasured',
            message: {
              name: 'LightMeasured',
              payload: {
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                },
                required: [
                  'id',
                ],
              },
            },
          },
        },
      },
    });

    expect(app.stack.length).toBe(3);
  });

  test('decorator should decorate the application from text', async () => {
    const text = `
    asyncapi: '2.1.0'
    info:
      title: Example
      version: '0.1.0'
    channels:
      example-channel:
        publish:
          message:
            payload:
              type: object
              properties:
                exampleField:
                  type: string
                exampleNumber:
                  type: number
                exampleDate:
                  type: string
                  format: date-time
  `;
    const app = new MockApp();
    await decorator(app, text);

    expect(app.stack.length).toBe(3);
  });

  test('decorator should decorate the application from file', async () => {
    const text = fs.readFileSync(`${__dirname}/utils/api.yaml`, 'utf8');
    const app = new MockApp();
    await decorator(app, text);

    expect(app.stack.length).toBe(12);
  });

  test('decorator should not decorate the application without publish', async () => {
    const app = new MockApp();
    await decorator(app, {
      asyncapi: '2.5.0',
      info: {
        title: 'Streetlights API Simplified',
        version: '1.0.0',
        description: 'The Smartylighting Streetlights API allows you to remotely manage the city lights.\n'
          + '\n'
          + 'This is a simplified version of the Streetlights API from other examples. This version is used in AsyncAPI documentation.\n',
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0',
        },
      },
      servers: {
        rabbit: {
          url: 'amqp://myuser:mypassword@localhost:5672',
          protocol: 'amqp',
        },
      },
      channels: {
        'light.measured': {
          subscribe: {
            summary: 'Inform about environmental lighting conditions for a particular streetlight.',
            operationId: 'onLightMeasured',
            message: {
              name: 'LightMeasured',
              payload: {
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                },
                required: [
                  'id',
                ],
              },
            },
          },
        },
      },
    });

    expect(app.stack.length).toBe(0);
  });

  test('decorator should throw on invalid schema', async () => {
    const app = new MockApp();
    try {
      await decorator(app, {
        asyncapi: '2.5.0',
        info: {
          title: 'Streetlights API Simplified',
          version: '1.0.0',
          description: 'The Smartylighting Streetlights API allows you to remotely manage the city lights.\n'
            + '\n'
            + 'This is a simplified version of the Streetlights API from other examples. This version is used in AsyncAPI documentation.\n',
          license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0',
          },
        },
        message: {
          component: 'not correct',
        },
      });
    } catch (err) {
      expect(err.message).toBe('There were errors validating the AsyncAPI document.');
      return;
    }
    expect(true).toBeFalsy();
  });
});
