const {
  describe, expect, test,
} = require('@jest/globals');

const validate = require('../src/middleware/validateHeaders');
const MyErrorType = require('../src/validationError');

describe('validateHeaders tests', () => {
  test('validateHeaders accepts correct parameters', (done) => {
    const schema = {
      type: 'object',
      properties: {
        'my-app-header': {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
      },
      required: [
        'my-app-header',
      ],
    };

    const req = {
      headers: { 'my-app-header': 50 },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.headers['my-app-header']).toBe(50);
      done(err);
    };
    middleware(req, null, next);
  });
  test('validateHeaders clean schema and accepts correct parameters', (done) => {
    const schema = {
      type: 'object',
      properties: {
        'my-app-header': {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        'x-parser-schema-id': '<anonymous-schema-2>',
      },
      required: [
        'my-app-header',
      ],
      'x-parser-schema-id': '<anonymous-schema-2>',
    };

    const req = {
      headers: { 'my-app-header': 50 },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.headers['my-app-header']).toBe(50);
      done(err);
    };
    middleware(req, null, next);
  });
  test('validateHeaders coerces correct parameter type', (done) => {
    const schema = {
      type: 'object',
      properties: {
        'my-app-header': {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
      },
      required: [
        'my-app-header',
      ],
    };

    const req = {
      headers: { 'my-app-header': '38' },
    };
    const next = (err) => {
      expect(req.api.headers['my-app-header']).toBe(38);
      done(err);
    };

    const middleware = validate(schema);
    middleware(req, null, next);
  });
  test('validateHeaders should create an error on invalidate data', (done) => {
    const schema = {
      type: 'object',
      properties: {
        'my-app-header': {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
      },
      required: [
        'my-app-header',
      ],
    };

    const req = {
      headers: { 'my-app-header': 'tip top' },
    };
    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.HEADER_VALIDATION_FAILURE);
      done();
    };

    const middleware = validate(schema);
    middleware(req, null, next);
  });
  test('validateHeaders accepts empty schema', (done) => {
    const schema = {
      type: 'object',
    };

    const req = {
      headers: {},
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.headers).toStrictEqual({});
      done(err);
    };
    middleware(req, null, next);
  });

  test('validateHeaders accept headers with empty schema', (done) => {
    const schema = {
      type: 'object',
    };

    const req = {
      headers: { userId: '6' },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.headers.userId).toBe('6');
      done(err);
    };
    middleware(req, null, next);
  });
});
