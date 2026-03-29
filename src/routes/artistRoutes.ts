import express from 'express';
import { getArtists } from '../controllers/artistController';

const router = express.Router();

// GET /api/artists - all artists including about column for artist detail cards.
router.get('/', getArtists);

export default router;
