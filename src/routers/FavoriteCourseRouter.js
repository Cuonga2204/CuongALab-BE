const express = require("express");
const router = express.Router();
const FavoriteCourseController = require("../controllers/FavoriteCourse.controller");

router.post("/toggle", FavoriteCourseController.toggleFavorite);
router.get("/:userId", FavoriteCourseController.getFavoritesByUser);

module.exports = router;
