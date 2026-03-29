import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// DATABASE CONNECTION POOL SETUP
// ============================================================================
//
// Environment variables - credentials :
// - DB_HOST: MySQL server  location
// - DB_USER: Authentication  username
// - DB_PASSWORD: Password
// - DB_NAME: Target database
// ============================================================================

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || '',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

export async function testConnection() {
	try {
		const connection = await pool.getConnection();
		console.log('✓ Database connection successful!');
		connection.release();
	} catch (error) {
		console.error('✗ Database connection failed:', error);
		process.exit(1);
	}
}

export default pool;

