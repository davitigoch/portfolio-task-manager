import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getOverdueTasks,
  addTaskNote
} from '../controllers/taskController.js';
import {
  validateCreateTask,
  validateUpdateTask,
  validateObjectId,
  validateTaskQuery
} from '../middleware/validation.js';

const router = express.Router();

/**
 * Task Routes
 * RESTful API endpoints for task management
 */

// GET /api/tasks - Get all tasks with filtering, sorting, and pagination
router.get('/', validateTaskQuery, getAllTasks);

// GET /api/tasks/overdue - Get overdue tasks (must come before /:id route)
router.get('/overdue', getOverdueTasks);

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', validateObjectId, getTaskById);

// POST /api/tasks - Create new task
router.post('/', validateCreateTask, createTask);

// PUT /api/tasks/:id - Update task by ID
router.put('/:id', validateObjectId, validateUpdateTask, updateTask);

// DELETE /api/tasks/:id - Delete task by ID
router.delete('/:id', validateObjectId, deleteTask);

// POST /api/tasks/:id/notes - Add note to task
router.post('/:id/notes', validateObjectId, addTaskNote);

export default router;