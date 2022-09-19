const router = require("express").Router();
const { body } = require("express-validator/check");

const authController = require("../controllers/auth.controller");
const authValidation = require("../middleware/authValidation");

router.put(
  "/signup",
  authValidation,
  body("name").trim().notEmpty(),
  authController.putSignup
);

router.post("/login", authValidation, authController.postLogin);

module.exports = router;
