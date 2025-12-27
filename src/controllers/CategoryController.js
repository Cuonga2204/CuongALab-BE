const mongoose = require("mongoose");
const Category = require("../models/CategoryModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

/* ================= UTILS ================= */
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* =====================================================
   CREATE CATEGORY
   - Level 1  : parent_id = null → root_id = _id
   - Level >1 : parent_id != null → root_id = parent.root_id
===================================================== */
const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    let level = 1;
    let root_id = null;

    /* ===== VALIDATE PARENT ===== */
    if (parent_id) {
      if (!mongoose.Types.ObjectId.isValid(parent_id)) {
        return errorHandler(res, ERRORS.VALIDATION_ERROR, "Invalid parent_id");
      }

      const parent = await Category.findById(parent_id);
      if (!parent) {
        return errorHandler(res, ERRORS.NOT_FOUND, "Parent category not found");
      }

      if (parent.level >= 4) {
        return errorHandler(
          res,
          ERRORS.VALIDATION_ERROR,
          "Maximum category depth is 4"
        );
      }

      level = parent.level + 1;
      root_id = parent.root_id; // ⭐ KẾ THỪA ROOT
    }

    /* ===== CREATE CATEGORY ===== */
    const category = await Category.create({
      name,
      slug: slugify(name),
      parent_id: parent_id || null,
      level,
      root_id: root_id || undefined, // tạm, sẽ set lại nếu level 1
    });

    /* ===== LEVEL 1 → ROOT = CHÍNH NÓ ===== */
    if (!parent_id) {
      category.root_id = category._id;
      await category.save();
    }

    return successHandler(res, category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   GET ALL CATEGORIES (FLAT)
===================================================== */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ level: 1, name: 1 }).lean();

    const formatted = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      level: c.level,
      parent_id: c.parent_id ? c.parent_id.toString() : null,
      root_id: c.root_id ? c.root_id.toString() : null,
      is_active: c.is_active,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return successHandler(res, formatted);
  } catch (error) {
    console.error("GET ALL CATEGORIES ERROR:", error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   GET CATEGORY TREE (DÙNG CHO UI)
===================================================== */
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).lean();

    const buildTree = (parentId = null, currentLevel = 1) => {
      if (currentLevel > 4) return [];

      return categories
        .filter((c) =>
          parentId === null
            ? c.parent_id === null
            : String(c.parent_id) === String(parentId)
        )
        .map((c) => ({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          level: c.level,
          parent_id: c.parent_id ? c.parent_id.toString() : null,
          root_id: c.root_id ? c.root_id.toString() : null,
          is_active: c.is_active,
          children: buildTree(c._id, currentLevel + 1),
        }));
    };

    const tree = buildTree(null, 1);
    return successHandler(res, tree);
  } catch (error) {
    console.error("GET CATEGORY TREE ERROR:", error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   UPDATE CATEGORY
   ❗ Không cho sửa root_id & level
===================================================== */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return errorHandler(res, ERRORS.NOT_FOUND, "Category not found");

    // ❌ Không cho sửa các field nguy hiểm
    delete req.body.root_id;
    delete req.body.level;

    Object.assign(category, req.body);
    await category.save();

    return successHandler(res, category);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   DELETE CATEGORY
   ❗ Không cho xoá nếu còn con
===================================================== */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return errorHandler(res, ERRORS.NOT_FOUND, "Category not found");

    const hasChildren = await Category.exists({ parent_id: category._id });
    if (hasChildren) {
      return errorHandler(
        res,
        ERRORS.VALIDATION_ERROR,
        "Cannot delete category with sub-categories"
      );
    }

    await Category.findByIdAndDelete(req.params.id);
    return successHandler(res, category);
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryTree,
  updateCategory,
  deleteCategory,
};
