import express from 'express';
import * as playlistController from '../controllers/playlistController';

const router = express.Router();

// GET /api/playlists - recommended playlists from database.
router.get('/', playlistController.getPlaylists);

// GET /api/playlists/:id/songs - songs for a specific playlist ordered by song_order.
router.get('/:id/songs', playlistController.getPlaylistSongs);

export default router;
