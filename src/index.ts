import express from 'express'
import type { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from '../db'
import userRoutes from './routes/userRoutes'
import songRoutes from './routes/songRoutes'
import playlistRoutes from './routes/playlistRoutes'
import artistRoutes from './routes/artistRoutes'

dotenv.config()

const app: Express = express()
const PORT = Number(process.env.PORT ?? 5000)

app.use(cors())
app.use(express.json())

const {
	buildSongLinkedListFromMockPlaylist,
	mockPlaylistSongsFromFrontend,
} = require('./logic/SongLinkedList')
const { buildSongBSTFromArray } = require('./logic/SongBST')
const {
	genres,
	artists,
	recommendedPlaylists,
	dashboardArtists,
	trendingSongs,
	upcomingSongs,
	trendingArtists,
} = require('./data/mockData')

// Build a Binary Search Tree with ALL songs from ALL playlists.
// This enables fast searching by title (O(log n) average case).
const allSongsArray = Object.values(mockPlaylistSongsFromFrontend).flat()
const songSearchBST = buildSongBSTFromArray(allSongsArray)

// Central data management notes:
// Keeping shared UI data in backend APIs improves scalability because multiple clients
// (web, mobile, admin) can consume one source of truth without duplicating constants.
// It also improves security: private fields and future access-control checks can stay on server.

app.get('/api/onboarding/genres', (_req: import('express').Request, res: import('express').Response) => {
	res.status(200).json({ genres })
})

app.get('/api/onboarding/artists', (_req: import('express').Request, res: import('express').Response) => {
	res.status(200).json({ artists })
})

app.get('/api/dashboard/recommended-playlists', (_req: import('express').Request, res: import('express').Response) => {
	res.status(200).json({
		recommendedPlaylists,
		dashboardArtists,
	})
})

app.get('/api/discover/trending', (_req: import('express').Request, res: import('express').Response) => {
	res.status(200).json({
		trendingSongs,
		upcomingSongs,
		trendingArtists,
	})
})

app.get('/api/playlists/:name', (req: import('express').Request, res: import('express').Response) => {
	const rawPlaylistNameParam = req.params.name

	if (typeof rawPlaylistNameParam !== 'string' || rawPlaylistNameParam.length === 0) {
		res.status(400).json({ message: 'Playlist name parameter is required.' })
		return
	}

	const requestedPlaylistName = decodeURIComponent(rawPlaylistNameParam)

	// Validate playlist name from URL param before touching the data structure.
	if (!(requestedPlaylistName in mockPlaylistSongsFromFrontend)) {
		res.status(404).json({
			message: `Playlist not found: ${requestedPlaylistName}`,
		})
		return
	}

	// API <-> Data Structure bridge:
	// 1) Endpoint receives playlist name.
	// 2) We build a Doubly Linked List from that playlist using your helper function.
	// 3) Then we traverse the linked list and convert nodes to a normal array for JSON output.
	const playlistLinkedList = buildSongLinkedListFromMockPlaylist(requestedPlaylistName)
	const songsAsArray = playlistLinkedList.convertListToArray()

	res.status(200).json({
		playlistName: requestedPlaylistName,
		totalSongs: songsAsArray.length,
		songs: songsAsArray,
	})
})

// Search endpoint using Binary Search Tree.
// Query parameter: ?title=<song-title>
// Returns a single song if found, or 404 if not found.
// Time complexity: O(log n) average (due to BST structure).
app.get('/api/search', (req: import('express').Request, res: import('express').Response) => {
	const rawTitleParam = req.query.title

	if (typeof rawTitleParam !== 'string' || rawTitleParam.length === 0) {
		res.status(400).json({ message: 'Query parameter "title" is required.' })
		return
	}

	// Search the BST for a song with matching title.
	// strcmp logic: localeCompare compares strings alphabetically,
	// which allows the BST to navigate left (smaller) or right (larger) branches.
	const foundSong = songSearchBST.search(rawTitleParam)

	if (foundSong === null) {
		res.status(404).json({
			message: `Song not found with title: ${rawTitleParam}`,
		})
		return
	}

	res.status(200).json({
		message: 'Song found via BST search',
		song: foundSong,
	})
})

// ============================================================================
// DATABASE ROUTES
// ============================================================================
// Routes below use MySQL-backed controllers.

app.use('/api/users', userRoutes)
app.use('/api/playlist', songRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/artists', artistRoutes)

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, async () => {
	console.log(`Music playlist backend running on http://localhost:${PORT}`)

	// Test the database connection on server startup.
	await testConnection()
})
