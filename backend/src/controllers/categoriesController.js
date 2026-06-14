// src/controllers/categoriesController.js
import { db } from '../server.js';

// ===== CATEGORIES =====

export const getCategories = async (req, res, next) => {
  try {
    const categories = await db('Categories')
      .where('isActive', true)
      .orderBy('displayOrder', 'asc')
      .orderBy('name', 'asc');

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categories = await db('Categories').select('*');
    const category = categories.find(c => c.id == id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const existingCategory = await db('Categories')
      .where('name', name.trim())
      .first();

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: 'Category name already exists'
      });
    }

    const [id] = await db('Categories').insert({
      name: name.trim(),
      description: description || null,
      displayOrder: displayOrder || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: id,
        name: name.trim(),
        description: description || null,
        displayOrder: displayOrder || 0,
        isActive: true
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;

    const categories = await db('Categories').select('*');
    const category = categories.find(c => c.id == id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (name && name.trim() !== category.name) {
      const existingCategory = categories.find(c => c.name === name.trim());

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          error: 'Category name already exists'
        });
      }
    }

    await db('Categories')
      .where('id', id)
      .update({
        name: name ? name.trim() : category.name,
        description: description !== undefined ? description : category.description,
        displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
        isActive: isActive !== undefined ? isActive : category.isActive,
        updatedAt: db.fn.now()
      });

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        name: name ? name.trim() : category.name,
        description: description !== undefined ? description : category.description,
        displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
        isActive: isActive !== undefined ? isActive : category.isActive
      },
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categories = await db('Categories').select('*');
    const category = categories.find(c => c.id == id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    await db('Categories')
      .where('id', id)
      .delete();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ===== SUBCATEGORIES =====

export const getSubCategories = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await db('Categories')
      .where('id', categoryId)
      .first();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategories = await db('SubCategories')
      .where('categoryId', categoryId)
      .where('isActive', true)
      .orderBy('displayOrder', 'asc')
      .orderBy('name', 'asc');

    res.status(200).json({
      success: true,
      data: subcategories,
      count: subcategories.length
    });
  } catch (error) {
    next(error);
  }
};

export const createSubCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, description, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subcategory name is required'
      });
    }

    const category = await db('Categories')
      .where('id', categoryId)
      .first();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const existingSubCategory = await db('SubCategories')
      .where('categoryId', categoryId)
      .where('name', name.trim())
      .first();

    if (existingSubCategory) {
      return res.status(409).json({
        success: false,
        error: 'Subcategory name already exists for this category'
      });
    }

    const [id] = await db('SubCategories').insert({
      categoryId: parseInt(categoryId),
      name: name.trim(),
      description: description || null,
      displayOrder: displayOrder || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: id,
        categoryId: parseInt(categoryId),
        name: name.trim(),
        description: description || null,
        displayOrder: displayOrder || 0,
        isActive: true
      },
      message: 'Subcategory created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;

    const subCategories = await db('SubCategories').select('*');
    const subCategory = subCategories.find(s => s.id == id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    if (name && name.trim() !== subCategory.name) {
      const existingSubCategory = subCategories.find(s =>
        s.categoryId === subCategory.categoryId && s.name === name.trim()
      );

      if (existingSubCategory) {
        return res.status(409).json({
          success: false,
          error: 'Subcategory name already exists for this category'
        });
      }
    }

    await db('SubCategories')
      .where('id', id)
      .update({
        name: name ? name.trim() : subCategory.name,
        description: description !== undefined ? description : subCategory.description,
        displayOrder: displayOrder !== undefined ? displayOrder : subCategory.displayOrder,
        isActive: isActive !== undefined ? isActive : subCategory.isActive,
        updatedAt: db.fn.now()
      });

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        categoryId: subCategory.categoryId,
        name: name ? name.trim() : subCategory.name,
        description: description !== undefined ? description : subCategory.description,
        displayOrder: displayOrder !== undefined ? displayOrder : subCategory.displayOrder,
        isActive: isActive !== undefined ? isActive : subCategory.isActive
      },
      message: 'Subcategory updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subCategories = await db('SubCategories').select('*');
    const subCategory = subCategories.find(s => s.id == id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    await db('SubCategories')
      .where('id', id)
      .delete();

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
