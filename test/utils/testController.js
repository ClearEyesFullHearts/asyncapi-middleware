module.exports = {
  onLightMeasured: (req, res, next) => {
    req.api.touched = true;
    next();
  },
  onMultipleMiddlewares: () => [
    (req, res, next) => {
      req.api.results = ['first'];
      next();
    },
    (req, res, next) => {
      req.api.results.push('second');
      next();
    },
  ],
  notAfunction: {},
};
