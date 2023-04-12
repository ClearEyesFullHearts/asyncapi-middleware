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
          format: undefined,
          enum: undefined,
          pattern: undefined,
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
  test('validateParam accepts enum formatting', (done) => {
    const schema = {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          format: undefined,
          enum: ['more', 'less'],
          pattern: undefined,
        },
      },
      required: [
        'action',
      ],
    };

    const req = {
      params: { action: 'action' },
    };

    const middleware = validate(schema);

    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.PARAMS_VALIDATION_FAILURE);
      const req2 = {
        params: { action: 'more' },
      };
      const next2 = (err2) => {
        expect(req2.api.params.action).toBe('more');
        done(err2);
      };

      middleware(req2, null, next2);
    };
    middleware(req, null, next);
  });
  test('validateParam accepts string formatting', (done) => {
    const schema = {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          format: 'email',
          enum: undefined,
          pattern: undefined,
        },
      },
      required: [
        'address',
      ],
    };

    const req = {
      params: { address: 'action' },
    };

    const middleware = validate(schema);

    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.PARAMS_VALIDATION_FAILURE);
      const req2 = {
        params: { address: 'test@example.com' },
      };
      const next2 = (err2) => {
        expect(req2.api.params.address).toBe('test@example.com');
        done(err2);
      };

      middleware(req2, null, next2);
    };
    middleware(req, null, next);
  });

  test('validateParam accepts string formatting', (done) => {
    const schema = {
      type: 'object',
      properties: {
        year: {
          type: 'string',
          format: undefined,
          enum: undefined,
          pattern: '^(19|20)\\d{2}$',
        },
      },
      required: [
        'year',
      ],
    };

    const req = {
      params: { year: 'aughts' },
    };

    const middleware = validate(schema);

    const next = (err) => {
      expect(err).toBeInstanceOf(MyErrorType);
      expect(err.type).toBe(MyErrorType.PARAMS_VALIDATION_FAILURE);
      const req2 = {
        params: { year: '2005' },
      };
      const next2 = (err2) => {
        expect(req2.api.params.year).toBe('2005');
        done(err2);
      };

      middleware(req2, null, next2);
    };
    middleware(req, null, next);
  });
});
