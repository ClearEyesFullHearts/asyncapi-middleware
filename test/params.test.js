const {
  describe, expect, test,
} = require('@jest/globals');

const validate = require('../src/middleware/validateParam');
const MyErrorType = require('../src/validationError');

describe('validateParam tests', () => {
  test('validateParam accepts correct parameters', (done) => {
    const schema = {
      type: 'object',
      properties: {
        streetlightId: {
          type: 'string',
        },
      },
      required: [
        'streetlightId',
      ],
    };

    const req = {
      params: { streetlightId: 'top' },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.params.streetlightId).toBe('top');
      done(err);
    };
    middleware(req, null, next);
  });
  test('validateParam coerces correct parameter type', (done) => {
    const schema = {
      type: 'object',
      properties: {
        streetlightId: {
          type: 'integer',
        },
      },
      required: [
        'streetlightId',
      ],
    };

    const req = {
      params: { 0: 'myroutingkey', streetlightId: '38' },
    };
    const next = (err) => {
      expect(req.api.params.streetlightId).toBe(38);
      done(err);
    };

    const middleware = validate(schema);
    middleware(req, null, next);
  });
  test('validateParam should create an error on invalidate data', (done) => {
    const schema = {
      type: 'object',
      properties: {
        streetlightId: {
          type: 'integer',
        },
      },
      additionalProperties: false,
      required: [
        'streetlightId',
      ],
    };

    const req = {
      params: { 0: 'myroutingkey', streetlightId: 38, shouldnotbehere: 'stop' },
    };
    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.PARAMS_VALIDATION_FAILURE);
      done();
    };

    const middleware = validate(schema);
    middleware(req, null, next);
  });
  test('validateParam accepts empty schema', (done) => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: [],
    };

    const req = {
      params: { 0: 'myroutingkey' },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(req.api.params).toStrictEqual({});
      done(err);
    };
    middleware(req, null, next);
  });

  test('validateParam reject params with empty schema', (done) => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: [],
    };

    const req = {
      params: { 0: 'myroutingkey', userId: '6' },
    };

    const middleware = validate(schema);
    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.PARAMS_VALIDATION_FAILURE);
      done();
    };
    middleware(req, null, next);
  });
});
