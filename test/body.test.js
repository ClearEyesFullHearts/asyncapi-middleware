const {
  describe, expect, test,
} = require('@jest/globals');

const validate = require('../src/middleware/validateBody');
const MyErrorType = require('../src/validationError');

const payloadSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0,
      description: 'Id of the streetlight.',
    },
    lumens: {
      type: 'integer',
      minimum: 0,
      description: 'Light intensity measured in lumens.',
    },
    sentAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date and time when the message was sent.',
    },
  },
};

describe('validateBody tests', () => {
  test('validateBody accepts correct parameters', (done) => {
    const req = {
      body: {
        id: 1,
        lumens: 25,
        sentAt: '2023-03-14T11:19:25.4Z',
      },
    };

    const middleware = validate(payloadSchema);
    const next = (err) => {
      expect(req.api.body.id).toBe(1);
      expect(req.api.body.lumens).toBe(25);
      expect(req.api.body.sentAt).toBe('2023-03-14T11:19:25.4Z');
      done(err);
    };
    middleware(req, null, next);
  });
  test('validateBody should create an error on invalidate data', (done) => {
    const req = {
      body: {
        id: 1,
        lumens: 'sport',
        sentAt: '2023-03-14T11:19:25.4Z',
      },
    };

    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.BODY_VALIDATION_FAILURE);
      done();
    };

    const middleware = validate(payloadSchema);
    middleware(req, null, next);
  });
  test('validateBody do not coerce parameters', (done) => {
    const req = {
      body: {
        id: 1,
        lumens: '25',
        sentAt: '2023-03-14T11:19:25.4Z',
      },
    };

    const middleware = validate(payloadSchema);
    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.BODY_VALIDATION_FAILURE);
      done();
    };
    middleware(req, null, next);
  });
});
