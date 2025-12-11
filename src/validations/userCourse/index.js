const { z } = require("zod");

const { USER_COURSE_STATUS } = require("../../constants/userCourse.constants");
const UserCourseSchema = z.object({
  user_id: z.string().max(255).optional(),
  course_id: z.string().max(255).optional(),
  status: z.enum(Object.values(USER_COURSE_STATUS)).optional(),
});

module.exports = { UserCourseSchema };
