const User = require("../models/UserModel");
require("dotenv").config();
const JwtService = require("../services/JwtService");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");
const bcrypt = require("bcrypt");
const {
  generalAccessToken,
  generalRefreshToken,
} = require("../services/JwtService");

const createUser = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    const avatarPath = req.file ? req.file.path : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorHandler(res, ERRORS.USER_ALREADY_EXIST);

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      avatarPath: avatarPath,
    });

    return successHandler(res, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler(res, ERRORS.USER_NOT_FOUND);
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return errorHandler(res, ERRORS.PASSWORD_NOT_MATCH);
    }

    const accessToken = await generalAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = await generalRefreshToken({
      id: user.id,
      role: user.role,
    });

    return successHandler(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const { name, email, role, phone } = req.body;
    const avatar = req.file ? req.file.path : null; // Cloudinary path

    const user = await User.findById(userId);
    if (!user) return errorHandler(res, ERRORS.USER_NOT_FOUND);

    // Update từng field nếu FE gửi lên
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar; // chỉ update nếu có ảnh mới

    await user.save();

    return successHandler(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return errorHandler(res, ERRORS.USER_NOT_FOUND);

    await User.findByIdAndDelete(userId);

    return successHandler(res, user);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getAllUser = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments();
    const data = {
      total,
      page: Number(page),
      limit: Number(limit),
      users,
    };

    return successHandler(res, data);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return errorHandler(res, ERRORS.USER_NOT_FOUND);

    return successHandler(res, user);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "id name email avatar phone role createdAt"
    );

    return successHandler(res, { teachers });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.Authorization.split(" ")[1];
    if (!token) errorHandler(res, ERRORS.TOKEN_REQUIRED);
    const response = await JwtService.refreshTokenService(token);
    return successHandler(res, response);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  getTeachers,
  refreshToken,
};
