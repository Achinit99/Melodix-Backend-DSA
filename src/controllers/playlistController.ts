import pool from '../../db';

export async function getPlaylists(
  _req: import('express').Request,
  res: import('express').Response,
): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT * FROM playlists ORDER BY id ASC');

    res.status(200).json({
      success: true,
      playlists: rows,
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playlists',
      error: (error as Error).message,
    });
  }
}

export async function getPlaylistSongs(
  req: import('express').Request,
  res: import('express').Response,
): Promise<void> {
  try {
    const playlistId = Number(req.params.id);

    if (!Number.isFinite(playlistId)) {
      res.status(400).json({
        success: false,
        message: 'Valid playlist id is required',
      });
      return;
    }

    const [rows] = await pool.query(
      `SELECT
        s.id,
        s.title,
        s.artist_name,
        s.duration,
        s.image_url,
        s.audio_url,
        ps.song_order
      FROM playlist_songs ps
      INNER JOIN songs s ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.song_order ASC`,
      [playlistId],
    );

    res.status(200).json({
      success: true,
      songs: rows,
    });
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playlist songs',
      error: (error as Error).message,
    });
  }
}
