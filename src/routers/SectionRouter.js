// src/routers/SectionRouter.js
const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/SectionController");

router.post("/create", sectionController.createSection);
router.get("/course/:courseId", sectionController.getSectionsByCourse);
router.get("/detail/:id", sectionController.getSectionDetail);
router.put("/update/:id", sectionController.updateSection);
router.delete("/delete/:id", sectionController.deleteSection);
router.put("/reorder/all", sectionController.reorderSections);

module.exports = router;
