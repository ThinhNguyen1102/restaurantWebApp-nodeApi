const { body } = require("express-validator/check");

const authValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
];

module.exports = authValidation;
