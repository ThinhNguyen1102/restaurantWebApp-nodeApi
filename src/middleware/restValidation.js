const { body } = require("express-validator/check");

const restValidation = [
  body("name").trim().notEmpty(),
  body("address").trim().notEmpty(),
  body("introduction").trim().notEmpty(),
];

module.exports = restValidation;
