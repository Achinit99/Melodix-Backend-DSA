import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController';

const router = express.Router();

// Route layer maps HTTP paths to controller functions.

// GET /api/users - Get all users.
router.get('/', getAllUsers);

// GET /api/users/:id - Get one user by id.
router.get('/:id', getUserById);

export default router;
