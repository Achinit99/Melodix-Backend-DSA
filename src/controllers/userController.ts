import pool from '../../db';

// User Controller
// This file contains the business logic for user endpoints.

export async function getAllUsers(
	req: import('express').Request,
	res: import('express').Response,
): Promise<void> {
	try {
		// Step 1: Get a database connection from the pool.
		const connection = await pool.getConnection();

		// Step 2: Run query to fetch all users.
		const [rows] = await connection.query('SELECT * FROM users');

		// Step 3: Release connection so it can be reused.
		connection.release();

		// Step 4: Send response back to frontend.
		res.status(200).json({
			message: 'Users retrieved successfully',
			data: rows,
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({
			message: 'Failed to fetch users',
			error: (error as Error).message,
		});
	}
}

export async function getUserById(
	req: import('express').Request,
	res: import('express').Response,
): Promise<void> {
	try {
		const { id } = req.params;

		// Input validation
		if (!id || isNaN(Number(id))) {
			res.status(400).json({ message: 'Valid user ID is required' });
			return;
		}

		const connection = await pool.getConnection();

		// Step 2: Fetch one user using id in WHERE clause.
		const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

		connection.release();

		if ((rows as any[]).length === 0) {
			res.status(404).json({ message: 'User not found' });
			return;
		}

		res.status(200).json({
			message: 'User retrieved successfully',
			data: (rows as any[])[0],
		});
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).json({
			message: 'Failed to fetch user',
			error: (error as Error).message,
		});
	}
}
