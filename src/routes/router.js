const express = require("express");

const restRoute = require("./restaurant.route");

const authRoute = require("./auth.route");

const appRoute = express();

appRoute.use("/restaurants", restRoute);

appRoute.use("/auth", authRoute);

module.exports = appRoute;
