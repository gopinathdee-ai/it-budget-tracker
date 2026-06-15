import { db } from '../server.js';

const VALID_COST_TYPES = ['Retained', 'Distributed'];

export async function getAll(req, res, next) {
  try {
    const { year, category, costType, page = 1, pageSize = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    let query = db('GACosts').select(
      'GACosts.id',
      'GACosts.year',
      'Categories.name as category',
      'GACosts.costType',
      'GACosts.serviceSoftware',
      'GACosts.vendor',
      'GACosts.version',
      'GACosts.currencyCode as currency',
      'GACosts.createdByUserId',
      'GACosts.createdAt',
      'GACosts.updatedAt',
      db.raw('COALESCE(GACostsBudget.maintenanceAmount, 0) as budgetMaintenance'),
      db.raw('COALESCE(GACostsBudget.newAmount, 0) as budgetNew'),
      db.raw('COALESCE(GACostsBudget.totalAmount, 0) as budgetTotal'),
      db.raw('COALESCE(GACostsActual.maintenanceAmount, 0) as actualMaintenance'),
      db.raw('COALESCE(GACostsActual.newAmount, 0) as actualNew'),
      db.raw('COALESCE(GACostsActual.totalAmount, 0) as actualTotal')
    )
      .leftJoin('Categories', 'GACosts.categoryId', 'Categories.id')
      .leftJoin('GACostsBudget', 'GACosts.id', 'GACostsBudget.gaCostId')
      .leftJoin('GACostsActual', 'GACosts.id', 'GACostsActual.gaCostId');

    if (year) query = query.where('GACosts.year', parseInt(year));
    if (category) query = query.where('Categories.name', category);
    if (costType) query = query.where('GACosts.costType', costType);

    const total = await db('GACosts')
      .count('* as count')
      .leftJoin('Categories', 'GACosts.categoryId', 'Categories.id')
      .modify(q => {
        if (year) q.where('GACosts.year', parseInt(year));
        if (category) q.where('Categories.name', category);
        if (costType) q.where('GACosts.costType', costType);
      });

    const data = await query
      .orderBy('GACosts.createdAt', 'desc')
      .limit(size)
      .offset((pageNum - 1) * size);

    const totalRecords = total[0].count;

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        pageSize: size,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / size)
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const gaCost = await db('GACosts')
      .where('GACosts.id', id)
      .select(
        'GACosts.id',
        'GACosts.year',
        'Categories.name as category',
        'GACosts.costType',
        'GACosts.serviceSoftware',
        'GACosts.vendor',
        'GACosts.version',
        'GACosts.currencyCode as currency',
        'GACosts.createdByUserId',
        'GACosts.createdAt',
        'GACosts.updatedAt',
        db.raw('COALESCE(GACostsBudget.maintenanceAmount, 0) as budgetMaintenance'),
        db.raw('COALESCE(GACostsBudget.newAmount, 0) as budgetNew'),
        db.raw('COALESCE(GACostsBudget.totalAmount, 0) as budgetTotal'),
        db.raw('COALESCE(GACostsActual.maintenanceAmount, 0) as actualMaintenance'),
        db.raw('COALESCE(GACostsActual.newAmount, 0) as actualNew'),
        db.raw('COALESCE(GACostsActual.totalAmount, 0) as actualTotal')
      )
      .leftJoin('Categories', 'GACosts.categoryId', 'Categories.id')
      .leftJoin('GACostsBudget', 'GACosts.id', 'GACostsBudget.gaCostId')
      .leftJoin('GACostsActual', 'GACosts.id', 'GACostsActual.gaCostId')
      .first();

    if (!gaCost) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `G&A Cost with ID ${id} not found`
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    res.json({
      success: true,
      data: gaCost,
      meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { year, category, costType, serviceSoftware, vendor, version, currency, subCategory, budgetMaintenance, budgetNew } = req.body;

    const errors = validateGACost({ year, categoryId: category, costType, serviceSoftware, vendor, version, currency });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.map(e => e.message).join('; '),
          details: errors
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    let gaCostId;
    const trx = await db.transaction();
    try {
      const insertResult = await trx('GACosts').insert({
        year,
        categoryId: category,
        costType,
        serviceSoftware,
        vendor,
        version,
        subCategoryId: subCategory || null,
        currencyCode: currency || 'CAD',
        createdByUserId: req.user?.id || null,
        createdAt: trx.fn.now(),
        updatedAt: trx.fn.now()
      });

      gaCostId = insertResult[0];

      const budgetTotal = (budgetMaintenance || 0) + (budgetNew || 0);
      await trx('GACostsBudget').insert({
        gaCostId,
        maintenanceAmount: budgetMaintenance || 0,
        newAmount: budgetNew || 0,
        totalAmount: budgetTotal,
        createdAt: trx.fn.now(),
        updatedAt: trx.fn.now()
      });

      await trx('GACostsActual').insert({
        gaCostId,
        maintenanceAmount: 0,
        newAmount: 0,
        totalAmount: 0,
        createdAt: trx.fn.now(),
        updatedAt: trx.fn.now()
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    const newCost = await db('GACosts')
      .where('GACosts.id', gaCostId)
      .select(
        'GACosts.id',
        'GACosts.year',
        'Categories.name as category',
        'GACosts.costType',
        'GACosts.serviceSoftware',
        'GACosts.vendor',
        'GACosts.version',
        'GACosts.currencyCode as currency',
        'GACosts.createdByUserId',
        'GACosts.createdAt',
        'GACosts.updatedAt',
        db.raw('COALESCE(GACostsBudget.maintenanceAmount, 0) as budgetMaintenance'),
        db.raw('COALESCE(GACostsBudget.newAmount, 0) as budgetNew'),
        db.raw('COALESCE(GACostsBudget.totalAmount, 0) as budgetTotal'),
        db.raw('COALESCE(GACostsActual.maintenanceAmount, 0) as actualMaintenance'),
        db.raw('COALESCE(GACostsActual.newAmount, 0) as actualNew'),
        db.raw('COALESCE(GACostsActual.totalAmount, 0) as actualTotal')
      )
      .leftJoin('Categories', 'GACosts.categoryId', 'Categories.id')
      .leftJoin('GACostsBudget', 'GACosts.id', 'GACostsBudget.gaCostId')
      .leftJoin('GACostsActual', 'GACosts.id', 'GACostsActual.gaCostId')
      .first();

    res.status(201).json({
      success: true,
      data: newCost,
      meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { category, costType, serviceSoftware, vendor, version, currency, subCategory, budgetMaintenance, budgetNew } = req.body;

    const existingCost = await db('GACosts').where('id', id).first();
    if (!existingCost) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `G&A Cost with ID ${id} not found` },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const updateData = {};
    if (category !== undefined) {
      updateData.categoryId = category;
    }
    if (costType !== undefined) {
      if (!VALID_COST_TYPES.includes(costType)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid cost type',
            details: [{ field: 'costType', message: `Must be one of: ${VALID_COST_TYPES.join(', ')}` }]
          },
          meta: { timestamp: new Date().toISOString() }
        });
      }
      updateData.costType = costType;
    }
    if (serviceSoftware !== undefined) updateData.serviceSoftware = serviceSoftware;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (version !== undefined) updateData.version = version;
    if (currency !== undefined) updateData.currencyCode = currency;
    if (subCategory !== undefined) updateData.subCategoryId = subCategory || null;
    updateData.updatedAt = db.fn.now();

    await db('GACosts').where('id', id).update(updateData);

    if (budgetMaintenance !== undefined || budgetNew !== undefined) {
      const mainAmount = budgetMaintenance ?? existingCost.budgetMaintenance ?? 0;
      const newAmount = budgetNew ?? existingCost.budgetNew ?? 0;
      const budgetTotal = mainAmount + newAmount;
      await db('GACostsBudget').where('gaCostId', id).update({
        maintenanceAmount: budgetMaintenance ?? db.raw('maintenanceAmount'),
        newAmount: budgetNew ?? db.raw('newAmount'),
        totalAmount: budgetTotal,
        updatedAt: db.fn.now()
      });
    }

    const updatedCost = await db('GACosts')
      .where('GACosts.id', id)
      .select(
        'GACosts.id',
        'GACosts.year',
        'Categories.name as category',
        'GACosts.costType',
        'GACosts.serviceSoftware',
        'GACosts.vendor',
        'GACosts.version',
        'GACosts.currencyCode as currency',
        'GACosts.createdByUserId',
        'GACosts.createdAt',
        'GACosts.updatedAt',
        db.raw('COALESCE(GACostsBudget.maintenanceAmount, 0) as budgetMaintenance'),
        db.raw('COALESCE(GACostsBudget.newAmount, 0) as budgetNew'),
        db.raw('COALESCE(GACostsBudget.totalAmount, 0) as budgetTotal'),
        db.raw('COALESCE(GACostsActual.maintenanceAmount, 0) as actualMaintenance'),
        db.raw('COALESCE(GACostsActual.newAmount, 0) as actualNew'),
        db.raw('COALESCE(GACostsActual.totalAmount, 0) as actualTotal')
      )
      .leftJoin('Categories', 'GACosts.categoryId', 'Categories.id')
      .leftJoin('GACostsBudget', 'GACosts.id', 'GACostsBudget.gaCostId')
      .leftJoin('GACostsActual', 'GACosts.id', 'GACostsActual.gaCostId')
      .first();

    res.json({
      success: true,
      data: updatedCost,
      meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
  } catch (error) {
    next(error);
  }
}

export async function delete_(req, res, next) {
  try {
    const { id } = req.params;

    const existingCost = await db('GACosts').where('id', id).first();
    if (!existingCost) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `G&A Cost with ID ${id} not found` },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    await db('GACosts').where('id', id).del();

    res.json({
      success: true,
      data: { id },
      meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
  } catch (error) {
    next(error);
  }
}

function validateGACost(data) {
  const errors = [];

  if (!data.year || data.year < 2020 || data.year > 2030) {
    errors.push({ field: 'year', message: 'Year must be between 2020-2030' });
  }

  if (!data.categoryId) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!data.costType || !VALID_COST_TYPES.includes(data.costType)) {
    errors.push({ field: 'costType', message: `Must be one of: ${VALID_COST_TYPES.join(', ')}` });
  }

  if (!data.serviceSoftware || data.serviceSoftware.trim().length === 0) {
    errors.push({ field: 'serviceSoftware', message: 'Service/Software is required' });
  }

  if (!data.vendor || data.vendor.trim().length === 0) {
    errors.push({ field: 'vendor', message: 'Vendor is required' });
  }

  if (!data.version) {
    errors.push({ field: 'version', message: 'Major.Minor is required' });
  }

  if (!data.currency) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  }

  return errors;
}
