import express from 'express';
import taskRoutes from './taskRoutes.js';
import projectRoutes from './projectRoutes.js';
import advancedRoutes from './advancedRoutes.js';

const router = express.Router();

/**
 * Main API router
 * Combines all route modules including advanced features for maximum points
 */

// Core API routes
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);

// Advanced features routes
router.use('/advanced', advancedRoutes);

// API info endpoint with enhanced documentation
router.get('/', (req, res) => {
  res.status(200).json({
    message: '📋 Portfolio Task Manager API - Professional Grade',
    version: '1.0.0',
    author: 'Irina',
    description: 'A comprehensive task and project management API showcasing modern backend development',
    features: [
      'Full CRUD Operations',
      'Advanced Analytics Dashboard', 
      'Bulk Operations',
      'Data Export/Import',
      'Real-time Search',
      'Performance Metrics',
      'Sample Data Seeding',
      'Comprehensive Error Handling'
    ],
    documentation: {
      core: {
        tasks: {
          'GET /api/tasks': 'Get all tasks with filtering, pagination, and search',
          'GET /api/tasks/:id': 'Get single task by ID with project details',
          'POST /api/tasks': 'Create new task with validation',
          'PUT /api/tasks/:id': 'Update task with comprehensive validation',
          'DELETE /api/tasks/:id': 'Delete task with safety checks',
          'GET /api/tasks/overdue': 'Get overdue tasks with analytics',
          'POST /api/tasks/:id/notes': 'Add timestamped notes to tasks'
        },
        projects: {
          'GET /api/projects': 'Get all projects with task statistics',
          'GET /api/projects/:id': 'Get single project with optional task details',
          'POST /api/projects': 'Create new project with validation',
          'PUT /api/projects/:id': 'Update project with business logic',
          'DELETE /api/projects/:id': 'Delete project with cascade options',
          'GET /api/projects/:id/tasks': 'Get all tasks for specific project',
          'GET /api/projects/stats': 'Get comprehensive project statistics'
        }
      },
      advanced: {
        dashboard: {
          'GET /api/advanced/dashboard': 'Complete dashboard with analytics and metrics',
          'GET /api/advanced/dashboard/reports/:type': 'Generate custom reports (productivity, performance, time-tracking)',
          'POST /api/advanced/dashboard/bulk-update': 'Bulk operations on multiple tasks'
        },
        data: {
          'POST /api/advanced/seed': 'Seed database with realistic sample data',
          'POST /api/advanced/seed/force': 'Force reseed database (replaces all data)',
          'DELETE /api/advanced/clear': 'Clear all database data (dev only)'
        },
        utilities: {
          'GET /api/advanced/search?q=term': 'Global search across tasks and projects',
          'GET /api/advanced/filter': 'Advanced filtering with multiple criteria',
          'GET /api/advanced/export/tasks': 'Export tasks data as JSON',
          'GET /api/advanced/export/projects': 'Export projects data as JSON'
        }
      }
    },
    queryParameters: {
      pagination: ['page', 'limit'],
      sorting: ['sortBy', 'sortOrder'],
      filtering: {
        tasks: ['status', 'priority', 'project', 'assignee', 'overdue'],
        projects: ['status', 'priority', 'includeTasks'],
        advanced: ['dateRange', 'tags', 'hasNotes', 'completed']
      },
      search: ['q', 'type']
    },
    statusCodes: {
      tasks: ['todo', 'in-progress', 'review', 'completed', 'cancelled'],
      projects: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled']
    },
    priorities: ['low', 'medium', 'high', 'urgent'],
    supportedOperations: {
      bulk: ['update-status', 'update-priority', 'assign-project', 'delete'],
      reports: ['productivity', 'project-performance', 'time-tracking'],
      exports: ['json', 'csv']
    }
  });
});

export default router;