const ForumTopic = require("../models/ForumTopicModel");
const ForumReply = require("../models/ForumReplyModel");
const mongoose = require("mongoose");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

/**
 * Build nested reply tree
 * Input: flat replies
 * Output: nested replies[]
 */
function buildReplyTree(replies) {
  const map = new Map();

  // Prepare all reply nodes
  replies.forEach((reply) => {
    map.set(String(reply.id), { ...reply.toJSON(), replies: [] });
  });

  const root = [];

  replies.forEach((reply) => {
    if (reply.parent_id) {
      // Child reply
      const parent = map.get(String(reply.parent_id));
      if (parent) parent.replies.push(map.get(String(reply.id)));
    } else {
      // Top-level reply
      root.push(map.get(String(reply.id)));
    }
  });

  return root;
}

/* =====================================================
   TOPIC CONTROLLERS
===================================================== */

/**
 * Create new topic
 */
const createTopic = async (req, res) => {
  try {
    const { title, content, userId, course_id } = req.body;

    const topic = await ForumTopic.create({
      title,
      content,
      user_id: userId,
      course_id: course_id || null,
    });

    return successHandler(res, topic);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
/**
 * Get all topics (global forum)
 */
const getTopics = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", courseId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const query = {};

    // SAFE COURSE ID FILTER
    if (courseId && mongoose.isValidObjectId(courseId)) {
      query.course_id = new mongoose.Types.ObjectId(courseId);
    }

    // SEARCH TITLE ONLY (extra search is done later)
    if (search.trim()) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // POPULATE TO READ COURSE INFO (BUT NOT RETURN TO FE)
    const topics = await ForumTopic.find(query)
      .populate("user_id", "name avatar")
      .populate("course_id", "title category name_teacher") // chỉ để search
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // SEARCH ON COURSE
    const lower = search.toLowerCase();
    const filtered = topics.filter((t) => {
      const c = t.course_id;
      return (
        t.title.toLowerCase().includes(lower) ||
        (c &&
          (c.title.toLowerCase().includes(lower) ||
            c.category.toLowerCase().includes(lower) ||
            c.name_teacher.toLowerCase().includes(lower)))
      );
    });

    // REPLY COUNT
    const ids = filtered.map((t) => t._id);

    const replyCounts = await ForumReply.aggregate([
      { $match: { topic_id: { $in: ids } } },
      { $group: { _id: "$topic_id", count: { $sum: 1 } } },
    ]);

    const replyMap = {};
    replyCounts.forEach((r) => (replyMap[r._id] = r.count));

    // MODIFY FINAL OUTPUT → RETURN ONLY ID
    const topicsWithCount = filtered.map((t) => {
      const json = t.toJSON();

      // convert course_id object → string id
      json.course_id = json.course_id ? json.course_id.id : null;

      return {
        ...json,
        reply_count: replyMap[t._id] || 0,
      };
    });

    return successHandler(res, {
      topics: topicsWithCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: topicsWithCount.length,
        totalPages: Math.ceil(topicsWithCount.length / limit),
      },
    });
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
/**
 * Filter topics
 * Example: GET /topics/filter?type=question&tags=node,react
 */
const filterTopics = async (req, res) => {
  try {
    const { type, tags } = req.query;

    const query = {};

    if (type) query.post_type = type;
    if (tags) query.tags = { $in: tags.split(",") };

    const topics = await ForumTopic.find(query)
      .populate("user_id", "name avatar")
      .sort({ createdAt: -1 });

    return successHandler(res, topics);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/**
 * Get topic detail + reply tree
 */
const getTopicDetail = async (req, res) => {
  try {
    const topicId = req.params.id;

    const topic = await ForumTopic.findById(topicId).populate(
      "user_id",
      "name avatar"
    );

    if (!topic) return errorHandler(res, ERRORS.NOT_FOUND, "Topic not found");

    // Fetch replies
    const replyDocs = await ForumReply.find({ topic_id: topicId })
      .populate("user_id", "name avatar")
      .sort({ createdAt: 1 });

    const replies = buildReplyTree(replyDocs);

    return successHandler(res, { topic, replies });
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* =====================================================
   REPLY CONTROLLERS
===================================================== */

/**
 * Create reply (supports nested reply via parentId)
 */
const createReply = async (req, res) => {
  try {
    const { topicId, content, parentId, userId } = req.body;

    if (!content) {
      return errorHandler(res, ERRORS.BAD_REQUEST, "Content is required");
    }

    const reply = await ForumReply.create({
      topic_id: topicId,
      user_id: userId,
      content,
      parent_id: parentId || null,
    });

    return successHandler(res, reply);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* =====================================================
   UPVOTE CONTROLLERS
===================================================== */

/**
 * Toggle upvote topic
 */
const toggleUpvoteTopic = async (req, res) => {
  try {
    const { topicId, userId } = req.body;

    const topic = await ForumTopic.findById(topicId);
    if (!topic) return errorHandler(res, ERRORS.NOT_FOUND, "Topic not found");

    const index = topic.upvotes.indexOf(userId);

    // Toggle
    if (index >= 0) {
      topic.upvotes.splice(index, 1); // remove
    } else {
      topic.upvotes.push(userId); // add
    }

    await topic.save();

    return successHandler(res, topic);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/**
 * Toggle upvote reply
 */
const toggleUpvoteReply = async (req, res) => {
  try {
    const { replyId, userId } = req.body;

    const reply = await ForumReply.findById(replyId);
    if (!reply) return errorHandler(res, ERRORS.NOT_FOUND, "Reply not found");

    const index = reply.upvotes.indexOf(userId);

    if (index >= 0) {
      reply.upvotes.splice(index, 1);
    } else {
      reply.upvotes.push(userId);
    }

    await reply.save();

    return successHandler(res, reply);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  createTopic,
  getTopics,
  filterTopics,
  getTopicDetail,
  createReply,
  toggleUpvoteTopic,
  toggleUpvoteReply,
};
