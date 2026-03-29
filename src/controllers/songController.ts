import pool from '../../db'
import { PlaylistDoublyLinkedList, SongData, SongNode } from '../logic/SongPlaylistDLL.js'

const playlistDll = new PlaylistDoublyLinkedList()
const DEFAULT_PLAYLIST_ID = 1
let currentPlayingId: number | null = null

async function loadPlaylistFromDatabase(playlistId: number = DEFAULT_PLAYLIST_ID): Promise<SongData[]> {
  // Step 1: Remember current pointer before rebuilding the list.
  const previousCurrentPlayingId = currentPlayingId

  // Step 2: Get songs that belong to this playlist in saved order.
  const [rows] = await pool.query(
    `SELECT
      s.id,
      s.title,
      s.artist_name,
      s.duration,
      s.image_url,
      s.audio_url
    FROM playlist_songs ps
    INNER JOIN songs s ON s.id = ps.song_id
    WHERE ps.playlist_id = ?
    ORDER BY ps.song_order ASC`,
    [playlistId],
  )

  const songs = rows as SongData[]

  // Step 3: Rebuild DLL from DB data.
  playlistDll.rebuildFromSongs(songs)

  // Step 4: Try to restore the current pointer to the previous song id.
  if (previousCurrentPlayingId !== null) {
    let cursor: SongNode | null = playlistDll.head
    let foundPreviousCurrent = false

    while (cursor !== null) {
      if (cursor.data.id === previousCurrentPlayingId) {
        playlistDll.currentPlaying = cursor
        foundPreviousCurrent = true
        break
      }
      cursor = cursor.next
    }

    // Step 5: If previous song no longer exists, point to the first song.
    if (!foundPreviousCurrent) {
      playlistDll.currentPlaying = playlistDll.head
    }
  }

  currentPlayingId = playlistDll.currentPlaying?.data.id ?? null
  return songs
}

export async function addSong(req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Get request values.
    const playlistId = Number(req.body.playlist_id ?? DEFAULT_PLAYLIST_ID)
    const songId = Number(req.body.song_id)

    // Step 2: Validate request values.
    if (!Number.isFinite(songId)) {
      res.status(400).json({ message: 'song_id is required' })
      return
    }

    if (!Number.isFinite(playlistId)) {
      res.status(400).json({ message: 'playlist_id must be a valid number' })
      return
    }

    // Step 3: Load current playlist into DLL.
    await loadPlaylistFromDatabase(playlistId)

    // Step 4: Get song details from songs table.
    const [songRows] = await pool.query(
      `SELECT
        s.id,
        s.title,
        s.artist_name,
        s.duration,
        s.image_url,
        s.audio_url
      FROM songs s
      WHERE s.id = ?
      LIMIT 1`,
      [songId],
    )

    const selectedSong = (songRows as SongData[])[0] ?? null

    if (selectedSong === null) {
      res.status(404).json({ message: `Song not found with id: ${songId}` })
      return
    }

    // Step 5: Prevent duplicates in the same playlist.
    const [existingRows] = await pool.query(
      'SELECT song_id FROM playlist_songs WHERE playlist_id = ? AND song_id = ? LIMIT 1',
      [playlistId, songId],
    )

    if ((existingRows as { song_id: number }[]).length > 0) {
      res.status(409).json({ message: 'Song is already in the playlist' })
      return
    }

    // Step 6: Find the next song_order value.
    const [orderRows] = await pool.query(
      'SELECT COALESCE(MAX(song_order), 0) AS maxSongOrder FROM playlist_songs WHERE playlist_id = ?',
      [playlistId],
    )

    const maxSongOrder = Number((orderRows as { maxSongOrder: number }[])[0]?.maxSongOrder ?? 0)
    const nextSongOrder = maxSongOrder + 1

    // Step 7: Save new relation in playlist_songs table.
    await pool.query(
      'INSERT INTO playlist_songs (playlist_id, song_id, song_order) VALUES (?, ?, ?)',
      [playlistId, songId, nextSongOrder],
    )

    // Step 8: Add a new node to DLL tail.
    // If list is empty, this becomes head and tail automatically.
    const appendedNode = playlistDll.append(selectedSong)

    if (playlistDll.currentPlaying === null) {
      playlistDll.currentPlaying = appendedNode
    }

    currentPlayingId = playlistDll.currentPlaying?.data.id ?? null

    // Step 9: Get new total song count for this playlist.
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS totalSongs FROM playlist_songs WHERE playlist_id = ?',
      [playlistId],
    )

    const totalSongs = Number((countRows as { totalSongs: number }[])[0]?.totalSongs ?? 0)

    // Step 10: Return success response.
    res.status(201).json({
      message: 'Display confirmation when a new song is added',
      song: selectedSong,
      totalSongs,
      currentPlaying: playlistDll.currentPlaying?.data ?? null,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add song',
      error: (error as Error).message,
    })
  }
}

export async function getPlaylist(_req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Load songs from DB and rebuild DLL.
    await loadPlaylistFromDatabase(DEFAULT_PLAYLIST_ID)

    // Step 2: Convert DLL to array for API response.
    const songs = playlistDll.toArray()

    // Step 3: Handle empty playlist state.
    if (songs.length === 0) {
      res.status(200).json({
        message: 'Playlist is empty',
        isEmpty: true,
        totalSongs: 0,
        songs: [],
        currentPlaying: null,
      })
      return
    }

    // Step 4: Return playlist details.
    res.status(200).json({
      message: 'Playlist fetched successfully',
      isEmpty: false,
      totalSongs: songs.length,
      songs,
      currentPlaying: playlistDll.currentPlaying?.data ?? null,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch playlist',
      error: (error as Error).message,
    })
  }
}

export async function deleteSong(req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Validate song id.
    const songId = Number(req.params.id)

    if (!Number.isFinite(songId)) {
      res.status(400).json({ message: 'Valid song id is required' })
      return
    }

    // Step 2: Load playlist into DLL.
    await loadPlaylistFromDatabase(DEFAULT_PLAYLIST_ID)

    // Step 3: Remove song from playlist_songs table.
    const [deleteResult] = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [DEFAULT_PLAYLIST_ID, songId],
    )

    const affectedRows = Number((deleteResult as { affectedRows?: number }).affectedRows ?? 0)

    if (affectedRows === 0) {
      res.status(404).json({ message: `Song not found in playlist with id: ${songId}` })
      return
    }

    // Step 4: Remove node from DLL and relink pointers.
    const deletedSong = playlistDll.deleteById(songId)
    currentPlayingId = playlistDll.currentPlaying?.data.id ?? null

    // Step 5: Return confirmation message.
    res.status(200).json({
      message: 'Display confirmation when a song is deleted',
      song: deletedSong,
      currentPlaying: playlistDll.currentPlaying?.data ?? null,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete song',
      error: (error as Error).message,
    })
  }
}

export async function getNext(_req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Load latest playlist.
    await loadPlaylistFromDatabase(DEFAULT_PLAYLIST_ID)

    // Step 2: Handle empty playlist.
    if (playlistDll.head === null) {
      res.status(200).json({
        message: 'Playlist is empty',
        song: null,
      })
      return
    }

    // Step 3: Move pointer to next node.
    const nextSong = playlistDll.moveNext()

    if (nextSong === null) {
      res.status(200).json({
        message: 'Already at the last song',
        song: playlistDll.currentPlaying?.data ?? null,
      })
      return
    }

    currentPlayingId = playlistDll.currentPlaying?.data.id ?? null

    // Step 4: Return current song.
    res.status(200).json({
      message: 'Moved to next song',
      song: nextSong,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get next song',
      error: (error as Error).message,
    })
  }
}

export async function getPrevious(_req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Load latest playlist.
    await loadPlaylistFromDatabase(DEFAULT_PLAYLIST_ID)

    // Step 2: Handle empty playlist.
    if (playlistDll.tail === null) {
      res.status(200).json({
        message: 'Playlist is empty',
        song: null,
      })
      return
    }

    // Step 3: Move pointer to previous node.
    const previousSong = playlistDll.movePrevious()

    if (previousSong === null) {
      res.status(200).json({
        message: 'Already at the first song',
        song: playlistDll.currentPlaying?.data ?? null,
      })
      return
    }

    currentPlayingId = playlistDll.currentPlaying?.data.id ?? null

    // Step 4: Return current song.
    res.status(200).json({
      message: 'Moved to previous song',
      song: previousSong,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get previous song',
      error: (error as Error).message,
    })
  }
}

export async function searchSong(req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    // Step 1: Get search query from URL.
    const queryParam = req.query.q

    if (typeof queryParam !== 'string' || queryParam.trim().length === 0) {
      res.status(400).json({ message: 'Query parameter "q" is required' })
      return
    }

    const q = queryParam.trim()

    // Step 2: Load playlist into DLL.
    await loadPlaylistFromDatabase(DEFAULT_PLAYLIST_ID)

    // Step 3: If no songs, return empty state.
    if (playlistDll.head === null) {
      res.status(200).json({
        message: 'Playlist is empty',
        song: null,
      })
      return
    }

    // Step 4: Search in DB by id when q is numeric, otherwise by title.
    let foundSong: SongData | null = null

    if (!Number.isNaN(Number(q))) {
      const songId = Number(q)
      const [rows] = await pool.query(
        `SELECT
          s.id,
          s.title,
          s.artist_name,
          s.duration,
          s.image_url,
          s.audio_url
        FROM playlist_songs ps
        INNER JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id = ? AND ps.song_id = ?
        LIMIT 1`,
        [DEFAULT_PLAYLIST_ID, songId],
      )

      const songs = rows as SongData[]
      foundSong = songs[0] ?? null
    } else {
      const [rows] = await pool.query(
        `SELECT
          s.id,
          s.title,
          s.artist_name,
          s.duration,
          s.image_url,
          s.audio_url
        FROM playlist_songs ps
        INNER JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id = ?
          AND (LOWER(s.title) = LOWER(?) OR LOWER(s.title) LIKE LOWER(?))
        ORDER BY CASE WHEN LOWER(s.title) = LOWER(?) THEN 0 ELSE 1 END, s.id ASC
        LIMIT 1`,
        [DEFAULT_PLAYLIST_ID, q, `%${q}%`, q],
      )

      const songs = rows as SongData[]
      foundSong = songs[0] ?? null
    }

    // Step 5: If not found, return required message.
    if (foundSong === null) {
      res.status(404).json({
        success: false,
        message: 'Display a message when a song is not found',
        song: null,
      })
      return
    }

    // Step 6: Find same song node in DLL and move current pointer there.
    let cursor: SongNode | null = playlistDll.head

    while (cursor !== null) {
      if (cursor.data.id === foundSong.id) {
        playlistDll.currentPlaying = cursor
        currentPlayingId = cursor.data.id
        break
      }

      cursor = cursor.next
    }

    // Step 7: If DB result is not in DLL, return not found.
    if (playlistDll.currentPlaying?.data.id !== foundSong.id) {
      res.status(404).json({
        success: false,
        message: 'Display a message when a song is not found',
        song: null,
      })
      return
    }

    // Step 8: Return required success response.
    res.status(200).json({
      success: true,
      message: 'Display search results when a song is found',
      song: playlistDll.currentPlaying.data,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to search song',
      error: (error as Error).message,
    })
  }
}
