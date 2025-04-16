module.exports = (req, res, next) => {
    const csrfProtection = req.app.locals.csrfProtection;
    csrfProtection(req, res, next);
  };