const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController");
// const { authAdminMiddleware } = require("../middlewares/auth.middleware");

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/tree", categoryController.getCategoryTree);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
