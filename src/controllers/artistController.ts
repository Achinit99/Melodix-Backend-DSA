import pool from '../../db';

export async function getArtists(
  _req: import('express').Request,
  res: import('express').Response,
): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT * FROM artists ORDER BY id ASC');

    res.status(200).json({
      success: true,
      artists: rows,
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
      error: (error as Error).message,
    });
  }
}
