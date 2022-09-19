const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");

const db = require("../models/index");

const authController = {
  putSignup: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed, entered data is incorrect.");
      err.statusCode = 422;
      err.data = errors.array();
      return next(err);
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
      const user = await db.User.findOne({ where: { email: email } });
      if (user) {
        const err = new Error("E-Mail address already exists!");
        err.statusCode = 401;
        throw err;
      }

      const hashedPw = await bcryptjs.hash(password, 12);
      const newUser = {
        name: name,
        email: email,
        password: hashedPw,
      };
      const result = await db.User.create(newUser);
      res
        .status(201)
        .json({ success: true, message: "User created.", result: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  postLogin: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed, entered data is incorrect.");
      err.statusCode = 422;
      err.data = errors.array();
      return next(err);
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
      const user = await db.User.findOne({ where: { email: email } });
      if (!user) {
        const err = new Error("A user with email could not be found!");
        err.statusCode = 401;
        throw err;
      }

      const isEqual = await bcryptjs.compare(password, user.password);
      if (!isEqual) {
        const err = new Error("Wrong password!");
        err.statusCode = 401;
        throw err;
      }

      const token = jwt.sign(
        {
          email: user.email,
          userId: user.id.toString(),
          userName: user.name.toString(),
        },
        "suika-secret",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        userId: user.id.toString(),
        userName: user.name.toString(),
        success: true,
        message: "Login successfully.",
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};

module.exports = authController;
