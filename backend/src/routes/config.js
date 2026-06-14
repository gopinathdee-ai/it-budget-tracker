// src/routes/config.js
import express from 'express';
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  getMajorMinors,
  createMajorMinor,
  updateMajorMinor,
  deleteMajorMinor
} from '../controllers/configController.js';

const router = express.Router();

// ===== CURRENCY ROUTES =====
router.get('/currencies', getCurrencies);
router.post('/currencies', createCurrency);
router.put('/currencies/:code', updateCurrency);

// ===== MAJORMINOR ROUTES =====
router.get('/majorminor', getMajorMinors);
router.post('/majorminor', createMajorMinor);
router.put('/majorminor/:id', updateMajorMinor);
router.delete('/majorminor/:id', deleteMajorMinor);

export default router;
