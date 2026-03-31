import express from 'express'
import type { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool, { testConnection } from '../db'
import { initializeDefaultPlaylistDll } from './controllers/songController'
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

type StartupSongSeed = {
	id: number
	title: string
	artist_name: string
	audio_url: string
}

const startupPlaylistSongs: StartupSongSeed[] = [
	{ id: 1, title: 'CHANEL', artist_name: 'Frank Ocean', audio_url: '/assets/songs/CHANEL.mp3' },
	{ id: 2, title: 'I Like It', artist_name: 'Cardi B', audio_url: '/assets/songs/I Like It.mp3' },
	{ id: 3, title: 'Lose Yourself', artist_name: 'Eminem', audio_url: '/assets/songs/Lose Yourself.mp3' },
	{ id: 4, title: 'Not Like Us', artist_name: 'Kendrick Lamar', audio_url: '/assets/songs/Not Like Us.mp3' },
	{ id: 5, title: 'Water', artist_name: 'Tyla', audio_url: '/assets/songs/Water.mp3' },
]

async function ensurePlaylistTables(): Promise<void> {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS playlists (
			id INT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)
	`)

	await pool.query(`
		CREATE TABLE IF NOT EXISTS songs (
			id INT PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			artist_name VARCHAR(255) NOT NULL,
			duration VARCHAR(20) DEFAULT '0:00',
			image_url VARCHAR(1024) NULL,
			audio_url VARCHAR(1024) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)
	`)

	await pool.query(`
		CREATE TABLE IF NOT EXISTS playlist_songs (
			playlist_id INT NOT NULL,
			song_id INT NOT NULL,
			song_order INT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (playlist_id, song_id),
			INDEX idx_playlist_song_order (playlist_id, song_order),
			CONSTRAINT fk_playlist_songs_playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
			CONSTRAINT fk_playlist_songs_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
		)
	`)
}

async function seedStartupPlaylist(): Promise<void> {
	const [playlistColumnsRows] = await pool.query(
		`SELECT column_name
		 FROM information_schema.columns
		 WHERE table_schema = DATABASE()
		   AND table_name = 'playlists'`,
	)

	const playlistColumns = new Set(
		(playlistColumnsRows as { column_name: string }[]).map((row) => row.column_name),
	)

	const playlistLabelColumn = playlistColumns.has('name')
		? 'name'
		: playlistColumns.has('title')
			? 'title'
			: playlistColumns.has('playlist_name')
				? 'playlist_name'
				: null

	if (playlistLabelColumn !== null) {
		await pool.query(
			`INSERT INTO playlists (id, ${playlistLabelColumn})
			 VALUES (1, 'Main Playlist')
			 ON DUPLICATE KEY UPDATE ${playlistLabelColumn} = VALUES(${playlistLabelColumn})`,
		)
	} else {
		await pool.query('INSERT IGNORE INTO playlists (id) VALUES (1)')
	}

	for (const song of startupPlaylistSongs) {
		await pool.query(
			`INSERT INTO songs (id, title, artist_name, duration, image_url, audio_url)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON DUPLICATE KEY UPDATE
			 title = VALUES(title),
			 artist_name = VALUES(artist_name),
			 audio_url = VALUES(audio_url)`,
			[song.id, song.title, song.artist_name, '0:00', null, song.audio_url],
		)
	}

	for (const [index, song] of startupPlaylistSongs.entries()) {
		await pool.query(
			`INSERT INTO playlist_songs (playlist_id, song_id, song_order)
			 VALUES (?, ?, ?)
			 ON DUPLICATE KEY UPDATE song_order = VALUES(song_order)`,
			[1, song.id, index + 1],
		)
	}
}

async function verifySeededPlaylistCount(): Promise<number> {
	const [rows] = await pool.query(
		`SELECT COUNT(*) AS total
		 FROM playlist_songs
		 WHERE playlist_id = ?`,
		[1],
	)

	return Number((rows as { total: number }[])[0]?.total ?? 0)
}

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

	try {
		// Test DB connectivity, then ensure tables and seed startup songs.
		await testConnection()
		await ensurePlaylistTables()
		await seedStartupPlaylist()
		await initializeDefaultPlaylistDll()

		const seededCount = await verifySeededPlaylistCount()
		console.log(`Seeded startup playlist songs: ${seededCount}`)
	} catch (error) {
		console.error('Startup initialization failed:', error)
		process.exit(1)
	}
})
