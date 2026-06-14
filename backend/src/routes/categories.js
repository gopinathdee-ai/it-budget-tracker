// src/routes/categories.js
import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} from '../controllers/categoriesController.js';

const router = express.Router();

// ===== CATEGORY ROUTES =====
// GET all categories
router.get('/', getCategories);

// GET single category
router.get('/:id', getCategoryById);

// CREATE category
router.post('/', createCategory);

// UPDATE category
router.put('/:id', updateCategory);

// DELETE category
router.delete('/:id', deleteCategory);

// ===== SUBCATEGORY ROUTES =====
// GET all subcategories for a category
router.get('/:categoryId/subcategories', getSubCategories);

// CREATE subcategory
router.post('/:categoryId/subcategories', createSubCategory);

// UPDATE subcategory (use parent route for subcategories)
router.put('/subcategories/:id', updateSubCategory);

// DELETE subcategory (use parent route for subcategories)
router.delete('/subcategories/:id', deleteSubCategory);

// Also support direct subcategory routes without category prefix
router.route('/subcategories/:id')
  .put(updateSubCategory)
  .delete(deleteSubCategory);

export default router;
