const router = require("express").Router();

const restController = require("../controllers/restaurant.controller");
const restValidation = require("../middleware/restValidation");
const isAuth = require("../middleware/isAuth");

router.get("/", restController.getAllRest);

router.post("/", isAuth, restValidation, restController.postRest);

router.get("/:restId", isAuth, restController.getRest);

router.put("/:restId", isAuth, restController.putEditRest);

router.delete("/:restId", isAuth, restController.deleteRest);

module.exports = router;
