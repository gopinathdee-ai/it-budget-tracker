import express from 'express';
import * as actualsController from '../controllers/actualsController.js';

const router = express.Router();

// Get all actual details for a G&A cost
router.get('/gacosts/:gaCostId/actuals', actualsController.getActualDetails);

// Create a new actual detail entry
router.post('/gacosts/:gaCostId/actuals', actualsController.createActualDetail);

// Update an actual detail entry
router.put('/gacosts/:gaCostId/actuals/:actualId', actualsController.updateActualDetail);

// Delete an actual detail entry
router.delete('/gacosts/:gaCostId/actuals/:actualId', actualsController.deleteActualDetail);

export default router;
