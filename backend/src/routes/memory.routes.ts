import { Router } from 'express';
import { bulkLearn, learn, infer, getState, reset } from '../controllers/memory.controller.js';

const router = Router();

router.post('/bulk-learn', bulkLearn);
router.post('/learn', learn);
router.post('/infer', infer);
router.get('/state', getState);
router.post('/reset', reset);

export default router;
