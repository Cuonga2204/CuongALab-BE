const UserRouter = require("./UserRouter");
const CourseRouter = require("./CourseRouter");
const UserCourseRouter = require("./UserCourseRouter");
const SectionRouter = require("./SectionRouter");
const LectureRouter = require("./LectureRouter");
const CartRouter = require("./CartRouter");
const PaymentCartRouter = require("./PaymentCartRouter");
const PaymentRouter = require("./PaymentRouter");
const PaymentCourseRouter = require("./PaymentCourseRouter");
const VideoQuizRouter = require("./VideoQuizRouter");
const FavoriteCourseRouter = require("./FavoriteCourseRouter");
const SectionQuizRouter = require("./SectionQuizRouter");
const LectureProgressRouter = require("./LectureProgressRouter");
const RevenueStatsRouter = require("./RevenueStatsRouter");
const CommentRouter = require("./CommentRouter");
const ForumRouter = require("./ForumRouter");
const CoursePricingRouter = require("./CoursePricingRouter");
const QuestionBankRouter = require("./QuestionBankRouter");
const AdminUserCourseProgressRouter = require("./AdminUserCourseProgressRouter");
const express = require("express");
const path = require("path");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/course", CourseRouter);
  app.use("/api/user-course", UserCourseRouter);
  app.use("/api/section", SectionRouter);
  app.use("/api/lecture", LectureRouter);
  app.use("/api/cart", CartRouter);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use(
    "/uploads/videos",
    express.static(path.join(__dirname, "../uploads/videos"))
  );
  app.use("/api/payment", PaymentRouter);
  app.use("/api/payment-cart", PaymentCartRouter);
  app.use("/api/payment-course", PaymentCourseRouter);
  app.use("/api/video-quiz", VideoQuizRouter);
  app.use("/api/favorites", FavoriteCourseRouter);
  app.use("/api/section-quiz", SectionQuizRouter);
  app.use("/api/lecture-progress", LectureProgressRouter);

  app.use("/api/stats", RevenueStatsRouter);
  app.use("/api/comments", CommentRouter);
  app.use("/api/forum", ForumRouter);
  app.use("/api/course-pricing", CoursePricingRouter);
  app.use("/api/question-bank", QuestionBankRouter);
  app.use("/api/user-progress", AdminUserCourseProgressRouter);
};

module.exports = routes;
