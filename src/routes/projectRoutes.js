import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  getProjectStats
} from '../controllers/projectController.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateObjectId,
  validateProjectQuery
} from '../middleware/validation.js';

const router = express.Router();

/**
 * Project Routes
 * RESTful API endpoints for project management
 */

// GET /api/projects/stats - Get project statistics (must come before /:id route)
router.get('/stats', getProjectStats);

// GET /api/projects - Get all projects with filtering, sorting, and pagination
router.get('/', validateProjectQuery, getAllProjects);

// GET /api/projects/:id - Get single project by ID
router.get('/:id', validateObjectId, getProjectById);

// POST /api/projects - Create new project
router.post('/', validateCreateProject, createProject);

// PUT /api/projects/:id - Update project by ID
router.put('/:id', validateObjectId, validateUpdateProject, updateProject);

// DELETE /api/projects/:id - Delete project by ID
router.delete('/:id', validateObjectId, deleteProject);

// GET /api/projects/:id/tasks - Get all tasks for a specific project
router.get('/:id/tasks', validateObjectId, getProjectTasks);

export default router;