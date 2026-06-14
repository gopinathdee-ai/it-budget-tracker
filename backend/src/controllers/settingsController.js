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
