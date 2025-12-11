const express = require("express");
const router = express.Router();
const ForumController = require("../controllers/ForumController");

// TOPICS
router.post("/topic/create", ForumController.createTopic);
router.get("/topics", ForumController.getTopics); // global topics
router.get("/topic/:id", ForumController.getTopicDetail);
router.post("/topic/upvote", ForumController.toggleUpvoteTopic);

// FILTER
router.get("/topics/filter", ForumController.filterTopics);

// REPLIES
router.post("/reply/create", ForumController.createReply);
router.post("/reply/upvote", ForumController.toggleUpvoteReply);

module.exports = router;
