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

// TOPIC
router.put("/topic/update/:id", ForumController.updateTopic);

router.delete("/topic/delete/:id", ForumController.deleteTopic);

// REPLY
router.put("/reply/update/:id", ForumController.updateReply);
router.delete("/reply/delete/:id", ForumController.deleteReply);

module.exports = router;
