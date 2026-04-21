import express from 'express';
import { getNearbyColleges, searchLocation } from '../controllers/LocationController.js';

const router = express.Router();

router.get('/nearby', getNearbyColleges);
router.get('/search', searchLocation);

export default router;
