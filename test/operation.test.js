const {
  describe, expect, test,
} = require('@jest/globals');

const operations = require('../src/middleware/operations');

describe('operations tests', () => {
  test('operations returns a selected middleware', (done) => {
    const req = {
      api: {
        touched: false,
      },
    };
    const ope = {
      id: 'onLightMeasured',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    const middleware = operations(ope, dir);
    const next = (err) => {
      expect(req.api.touched).toBeTruthy();
      done(err);
    };
    middleware(req, null, next);
  });
  test('operations returns a selected array of middleware', (done) => {
    const req = {
      api: {},
    };
    const ope = {
      id: 'onMultipleMiddlewares',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    const [first, second] = operations(ope, dir);
    const next2 = (err) => {
      expect(req.api.results).toEqual(['first', 'second']);
      done(err);
    };
    const next1 = () => {
      expect(req.api.results).toEqual(['first']);
      second(req, null, next2);
    };
    first(req, null, next1);
  });
  test('operations throws on missing operationid', () => {
    const ope = {
      id: '',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    expect(() => {
      operations(ope, dir);
    }).toThrow();
  });

  test('operations create stub on missing operationid', (done) => {
    const req = {
      path: 'routingKey',
    };
    const ope = {
      id: '',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    const middleware = operations(ope, dir, true);
    const next = (err) => {
      done(err);
    };
    middleware(req, null, next);
  });
  test('operations throws on missing controller', () => {
    const ope = {
      id: 'onLightMeasured',
      controller: '',
    };
    const dir = 'test/utils/';

    expect(() => {
      operations(ope, dir);
    }).toThrow();
  });
  test('operations throws on missing controller', (done) => {
    const ope = {
      id: 'onLightMeasured',
      controller: '',
    };
    const dir = 'test/utils/';

    const req = {
      path: 'routingKey',
    };

    const middleware = operations(ope, dir, true);
    const next = (err) => {
      done(err);
    };
    middleware(req, null, next);
  });
  test('operations throws on missing dir path', () => {
    const ope = {
      id: 'onLightMeasured',
      controller: 'testController',
    };
    const dir = 'test/';

    expect(() => {
      operations(ope, dir);
    }).toThrow();
  });
  test('operations throws on missing dir path', (done) => {
    const ope = {
      id: 'onLightMeasured',
      controller: 'testController',
    };
    const dir = 'test/';

    const req = {
      path: 'routingKey',
    };

    const middleware = operations(ope, dir, true);
    const next = (err) => {
      done(err);
    };
    middleware(req, null, next);
  });
  test('operations throws on operationid not being a function ', () => {
    const ope = {
      id: 'notAfunction',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    expect(() => {
      operations(ope, dir);
    }).toThrow();
  });
  test('operations throws on operationid not being a function ', (done) => {
    const ope = {
      id: 'notAfunction',
      controller: 'testController',
    };
    const dir = 'test/utils/';

    const req = {
      path: 'routingKey',
    };

    const middleware = operations(ope, dir, true);
    const next = (err) => {
      done(err);
    };
    middleware(req, null, next);
  });
});
