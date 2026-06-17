import { db } from '../server.js';

export const getAppTheme = async (req, res, next) => {
  try {
    const setting = await db('AppSettings').where({ setting: 'theme' }).first();

    const theme = setting?.value || 'dark-blue';

    res.json({
      data: { theme }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_THEME',
          message: 'Theme is required'
        }
      });
    }

    const updated = await db('AppSettings')
      .where({ setting: 'theme' })
      .update({ value: theme, updatedAt: db.fn.now() });

    if (updated === 0) {
      // Insert if doesn't exist
      await db('AppSettings').insert({ setting: 'theme', value: theme });
    }

    res.json({
      success: true,
      data: { theme }
    });
  } catch (error) {
    next(error);
  }
};

export const getGeneralSettings = async (req, res, next) => {
  try {
    const showAdditionalCostSetting = await db('AppSettings').where({ setting: 'showAdditionalCost' }).first();
    const fieldNameSetting = await db('AppSettings').where({ setting: 'additionalCostFieldName' }).first();

    res.json({
      success: true,
      data: {
        showAdditionalCost: showAdditionalCostSetting?.value === 'true' || false,
        additionalCostFieldName: fieldNameSetting?.value || 'Additional Cost'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

export const updateGeneralSettings = async (req, res, next) => {
  try {
    const { showAdditionalCost, additionalCostFieldName } = req.body;

    if (showAdditionalCost !== undefined) {
      const updated = await db('AppSettings')
        .where({ setting: 'showAdditionalCost' })
        .update({ value: String(showAdditionalCost), updatedAt: db.fn.now() });

      if (updated === 0) {
        await db('AppSettings').insert({ setting: 'showAdditionalCost', value: String(showAdditionalCost) });
      }
    }

    if (additionalCostFieldName !== undefined) {
      const updated = await db('AppSettings')
        .where({ setting: 'additionalCostFieldName' })
        .update({ value: additionalCostFieldName, updatedAt: db.fn.now() });

      if (updated === 0) {
        await db('AppSettings').insert({ setting: 'additionalCostFieldName', value: additionalCostFieldName });
      }
    }

    res.json({
      success: true,
      data: {
        showAdditionalCost: showAdditionalCost !== undefined ? showAdditionalCost : undefined,
        additionalCostFieldName: additionalCostFieldName || 'Additional Cost'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};
