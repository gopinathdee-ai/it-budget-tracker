import express from 'express';
import * as controller from '../controllers/gacostsController.js';
import { validateInput } from '../middleware/validation.js';

const router = express.Router();

// GET all G&A costs with pagination and filters
router.get('/', controller.getAll);

// GET single G&A cost by ID
router.get('/:id', controller.getById);

// POST create new G&A cost
router.post('/', validateInput('createGACost'), controller.create);

// PUT update G&A cost
router.put('/:id', validateInput('updateGACost'), controller.update);

// DELETE G&A cost
router.delete('/:id', controller.delete_);

export default router;
