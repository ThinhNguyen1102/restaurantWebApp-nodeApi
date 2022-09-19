const fs = require("fs");
const path = require("path");

const db = require("../models/index");
const { validationResult } = require("express-validator/check");

const restController = {
  getRest: async (req, res, next) => {
    const restId = req.params.restId;

    try {
      const restaurant = await db.Restaurant.findByPk(restId);
      if (!restaurant) {
        const err = new Error("Could not find restaurant.");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        success: true,
        message: "get restaurant successfully",
        result: restaurant,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  postRest: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed, entered data is incorrect.");
      err.statusCode = 422;
      err.data = errors.array();
      return next(err);
    }

    if (!req.file) {
      const err = new Error("No image providd.");
      err.statusCode = 422;
      throw err;
    }

    const imageUrl = req.file.path.replace("\\", "/");

    const restaurant = {
      userId: req.userId,
      userName: req.userName,
      imageUrl: imageUrl,
      ...req.body,
    };
    console.log(restaurant);

    try {
      const result = await db.Restaurant.create(restaurant);
      res.status(200).json({
        success: true,
        message: "create restaurant successfully",
        reault: result,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  getAllRest: async (req, res, next) => {
    let page = req.query.page;
    if (!page) {
      page = 1;
    }

    const getPagination = (page, size) => {
      const limit = size ? +size : 6;
      const offset = page ? (+page - 1) * limit : 0;
      return { limit, offset };
    };

    try {
      const amount = await db.Restaurant.count();
      const links = [];

      const pages = amount / 6;
      for (let i = 1; i <= pages + 1; i++) {
        links.push({
          url: `http://localhost:8080/api/v1/restaurants?page=${i}`,
          label: `${i}`,
        });
      }

      const restaurants = await db.Restaurant.findAll(getPagination(page, 6));
      res.status(200).json({
        message: "get all restaurant successfully",
        success: true,
        result: restaurants,
        links: links,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  putEditRest: async (req, res, next) => {
    const restId = req.params.restId;
    const updateData = req.body;
    let imageUrl = updateData.image;

    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }

    if (!imageUrl) {
      const err = new Error("No file picked");
      err.statusCode = 422;
      throw err;
    }

    updateData.imageUrl = imageUrl;

    try {
      const restaurant = await db.Restaurant.findByPk(restId);
      if (!restaurant) {
        const err = new Error("Could not find restaurant.");
        err.statusCode = 404;
        throw err;
      }
      if (imageUrl !== restaurant.imageUrl) {
        clearImage(restaurant.imageUrl);
      }

      if (restaurant.userId.toString() !== req.userId.toString()) {
        const err = new Error("no editing permission.");
        err.statusCode = 403;
        throw err;
      }

      const result = await db.Restaurant.update(updateData, {
        where: {
          id: restId,
        },
      });
      res.status(200).json({
        success: true,
        message: "edit restaurant successfully",
        result: result,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  deleteRest: async (req, res, next) => {
    const restId = req.params.restId;
    try {
      const restaurant = await db.Restaurant.findByPk(restId);

      if (!restaurant) {
        const err = new Error("Could not find restaurant.");
        err.statusCode = 404;
        throw err;
      }

      if (restaurant.userId.toString() !== req.userId.toString()) {
        const err = new Error("no editing permission.");
        err.statusCode = 403;
        throw err;
      }

      clearImage(restaurant.imageUrl);

      const result = await db.Restaurant.destroy({
        where: {
          id: restId,
        },
      });
      res
        .status(200)
        .json({
          success: true,
          message: "delete restaurant successfully",
          result: result,
        });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};

const clearImage = (filePath) => {
  console.log(filePath);
  filePath = path.join(__dirname, "..", "..", filePath);
  console.log(filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};

module.exports = restController;
