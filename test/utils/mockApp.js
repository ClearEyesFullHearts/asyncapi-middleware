class MockApp {
  constructor() {
    this.stack = [];
  }

  use(key, middlewares) {
    this.stack.push(...middlewares);
  }
}
module.exports = MockApp;
