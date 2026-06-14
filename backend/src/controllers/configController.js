// src/controllers/configController.js
// Handles Currency and MajorMinor configuration management
import { db } from '../server.js';

// ===== CURRENCY MANAGEMENT =====

export const getCurrencies = async (req, res, next) => {
  try {
    const currencies = await db('Currencies')
      .orderBy('code', 'asc');

    res.status(200).json({
      success: true,
      data: currencies,
      count: currencies.length
    });
  } catch (error) {
    next(error);
  }
};

export const createCurrency = async (req, res, next) => {
  try {
    const { code, name, conversionRate } = req.body;

    if (!code || !code.trim() || !name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Currency code and name are required'
      });
    }

    if (conversionRate === undefined || conversionRate < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid conversion rate is required'
      });
    }

    const existingCurrency = await db('Currencies')
      .where('code', code.trim().toUpperCase())
      .first();

    if (existingCurrency) {
      return res.status(409).json({
        success: false,
        error: 'Currency code already exists'
      });
    }

    const baseCurrency = await db('Currencies')
      .select('baseCurrency')
      .first();

    await db('Currencies').insert({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      conversionRate: parseFloat(conversionRate),
      baseCurrency: baseCurrency?.baseCurrency || 'CAD'
    });

    const newCurrency = await db('Currencies')
      .where('code', code.trim().toUpperCase())
      .first();

    res.status(201).json({
      success: true,
      data: newCurrency,
      message: 'Currency created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrency = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { conversionRate } = req.body;

    if (conversionRate === undefined || conversionRate < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid conversion rate is required'
      });
    }

    const currency = await db('Currencies')
      .where('code', code)
      .first();

    if (!currency) {
      return res.status(404).json({
        success: false,
        error: 'Currency not found'
      });
    }

    await db('Currencies')
      .where('code', code)
      .update({
        conversionRate: parseFloat(conversionRate),
        updatedAt: db.fn.now()
      });

    const updatedCurrency = await db('Currencies')
      .where('code', code)
      .first();

    res.status(200).json({
      success: true,
      data: updatedCurrency,
      message: 'Currency updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ===== MAJOR.MINOR MANAGEMENT =====

export const getMajorMinors = async (req, res, next) => {
  try {
    const majorMinors = await db('MajorMinor')
      .where('isActive', true)
      .orderBy('code', 'asc');

    res.status(200).json({
      success: true,
      data: majorMinors,
      count: majorMinors.length
    });
  } catch (error) {
    next(error);
  }
};

export const createMajorMinor = async (req, res, next) => {
  try {
    const { code, description } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Major.Minor code is required'
      });
    }

    const existingCode = await db('MajorMinor')
      .where('code', code.trim())
      .first();

    if (existingCode) {
      return res.status(409).json({
        success: false,
        error: 'Major.Minor code already exists'
      });
    }

    const [id] = await db('MajorMinor').insert({
      code: code.trim(),
      description: description || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: id,
        code: code.trim(),
        description: description || null,
        isActive: true
      },
      message: 'Major.Minor code created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateMajorMinor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, description, isActive } = req.body;

    const majorMinors = await db('MajorMinor').select('*');
    const majorMinor = majorMinors.find(m => m.id == id);

    if (!majorMinor) {
      return res.status(404).json({
        success: false,
        error: 'Major.Minor code not found'
      });
    }

    if (code && code.trim() !== majorMinor.code) {
      const existingCode = majorMinors.find(m => m.code === code.trim());

      if (existingCode) {
        return res.status(409).json({
          success: false,
          error: 'Major.Minor code already exists'
        });
      }
    }

    await db('MajorMinor')
      .where('id', id)
      .update({
        code: code ? code.trim() : majorMinor.code,
        description: description !== undefined ? description : majorMinor.description,
        isActive: isActive !== undefined ? isActive : majorMinor.isActive,
        updatedAt: db.fn.now()
      });

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        code: code ? code.trim() : majorMinor.code,
        description: description !== undefined ? description : majorMinor.description,
        isActive: isActive !== undefined ? isActive : majorMinor.isActive
      },
      message: 'Major.Minor code updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMajorMinor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const majorMinors = await db('MajorMinor').select('*');
    const majorMinor = majorMinors.find(m => m.id == id);

    if (!majorMinor) {
      return res.status(404).json({
        success: false,
        error: 'Major.Minor code not found'
      });
    }

    await db('MajorMinor')
      .where('id', id)
      .delete();

    res.status(200).json({
      success: true,
      message: 'Major.Minor code deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
