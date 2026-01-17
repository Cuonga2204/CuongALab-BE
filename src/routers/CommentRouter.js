const express = require("express");
const router = express.Router();
const commentController = require("../controllers/CommentController");

router.post("/add", commentController.addComment);
router.get("/:lectureId", commentController.getComments);
router.post("/like", commentController.likeComment);
router.post("/unlike", commentController.unlikeComment);
router.put("/edit", commentController.editComment);
router.post("/delete", commentController.deleteComment);

module.exports = router;
