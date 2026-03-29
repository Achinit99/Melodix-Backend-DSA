import express from 'express'
import {
  addSong,
  deleteSong,
  getNext,
  getPlaylist,
  getPrevious,
  searchSong,
} from '../controllers/songController.js'

const router = express.Router()

// Playlist routes using Doubly Linked List controller logic.
router.post('/add', addSong)
router.get('/', getPlaylist)
router.delete('/songs/:id', deleteSong)
router.delete('/:id', deleteSong)
router.get('/next', getNext)
router.get('/previous', getPrevious)
router.get('/search', searchSong)

export default router
