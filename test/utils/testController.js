module.exports = {
  onLightMeasured: (req, res, next) => {
    req.api.touched = true;
    next();
  },
};
