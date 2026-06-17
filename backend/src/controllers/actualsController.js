import { db } from '../server.js';

export async function getActualDetails(req, res, next) {
  try {
    const { gaCostId } = req.params;

    const details = await db('GACostsActualDetails')
      .where('gaCostId', gaCostId)
      .orderBy('entryDate', 'asc');

    const total = details.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    res.json({
      success: true,
      data: {
        details,
        total: parseFloat(total.toFixed(2))
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function createActualDetail(req, res, next) {
  const trx = await db.transaction();

  try {
    const { gaCostId } = req.params;
    const { amount, entryDate, description, currency } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount is required and must be a valid number'
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    if (!entryDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Entry date is required'
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const gaCost = await trx('GACosts').where('id', gaCostId).first();
    if (!gaCost) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `G&A Cost with ID ${gaCostId} not found`
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const insertResult = await trx('GACostsActualDetails').insert({
      gaCostId: parseInt(gaCostId),
      amount: parseFloat(amount),
      entryDate,
      description: description || null,
      currency: currency || 'CAD'
    }).returning('id');

    const newDetailId = insertResult[0].id || insertResult[0];

    await updateActualTotal(trx, gaCostId);

    const newDetail = await trx('GACostsActualDetails').where('id', newDetailId).first();

    await trx.commit();

    res.status(201).json({
      success: true,
      data: newDetail,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
}

export async function updateActualDetail(req, res, next) {
  const trx = await db.transaction();

  try {
    const { gaCostId, actualId } = req.params;
    const { amount, entryDate, description, currency } = req.body;

    if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be a valid positive number'
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const detail = await trx('GACostsActualDetails')
      .where({ id: actualId, gaCostId })
      .first();

    if (!detail) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Actual detail with ID ${actualId} not found`
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (entryDate !== undefined) updateData.entryDate = entryDate;
    if (description !== undefined) updateData.description = description || null;
    if (currency !== undefined) updateData.currency = currency || 'CAD';
    updateData.updatedAt = new Date();

    await trx('GACostsActualDetails').where('id', actualId).update(updateData);

    await updateActualTotal(trx, gaCostId);

    const updated = await trx('GACostsActualDetails').where('id', actualId).first();

    await trx.commit();

    res.json({
      success: true,
      data: updated,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
}

export async function deleteActualDetail(req, res, next) {
  const trx = await db.transaction();

  try {
    const { gaCostId, actualId } = req.params;

    const detail = await trx('GACostsActualDetails')
      .where({ id: actualId, gaCostId })
      .first();

    if (!detail) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Actual detail with ID ${actualId} not found`
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    await trx('GACostsActualDetails').where('id', actualId).delete();

    await updateActualTotal(trx, gaCostId);

    await trx.commit();

    res.json({
      success: true,
      data: { id: actualId },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    await trx.rollback();
    next(error);
  }
}

async function updateActualTotal(trx, gaCostId) {
  const details = await trx('GACostsActualDetails')
    .where('gaCostId', gaCostId);

  // Get the G&A Cost to fetch its currency for reference
  const gaCost = await trx('GACosts').where('id', gaCostId).first();

  // Fetch exchange rates
  const currencies = await trx('Currencies');
  const currencyMap = {};
  currencies.forEach(c => {
    currencyMap[c.code] = c.conversionRate || 1;
  });

  // Calculate total in CAD, converting each entry to CAD
  const totalAmount = details.reduce((sum, item) => {
    const rate = item.currency === 'CAD' ? 1 : (currencyMap[item.currency] || 1);
    return sum + (parseFloat(item.amount) || 0) * rate;
  }, 0);

  const existing = await trx('GACostsActual').where('gaCostId', gaCostId).first();

  if (existing) {
    await trx('GACostsActual')
      .where('gaCostId', gaCostId)
      .update({
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        updatedAt: new Date()
      });
  } else {
    await trx('GACostsActual').insert({
      gaCostId: parseInt(gaCostId),
      maintenanceAmount: 0,
      newAmount: 0,
      totalAmount: parseFloat(totalAmount.toFixed(2))
    });
  }
}
