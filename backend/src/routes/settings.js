import express from 'express';
import { getAppTheme, updateAppTheme } from '../controllers/settingsController.js';

const router = express.Router();

// Get system theme
router.get('/theme', getAppTheme);

// Update system theme
router.put('/theme', updateAppTheme);

export default router;
