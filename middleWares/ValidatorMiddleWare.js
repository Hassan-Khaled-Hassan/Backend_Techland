const { validationResult } = require("express-validator");

const Validators = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next(); // Proceed only if there are no validation errors
};

module.exports = Validators;
