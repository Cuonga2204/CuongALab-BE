const express = require("express");
const router = express.Router();
const commentController = require("../controllers/CommentController");

router.post("/add", commentController.addComment);
router.get("/:lectureId", commentController.getComments);
router.post("/like", commentController.likeComment);
router.post("/unlike", commentController.unlikeComment);

module.exports = router;
