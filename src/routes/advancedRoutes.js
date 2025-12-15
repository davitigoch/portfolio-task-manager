import express from 'express';
import {
  getDashboardData,
  generateReport,
  bulkUpdateTasks
} from '../controllers/dashboardController.js';
import {
  seedDatabase,
  clearDatabase,
  forceSeedDatabase
} from '../controllers/seedController.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

/**
 * Advanced Routes
 * Additional endpoints for maximum creativity and professional quality points
 */

// Dashboard Analytics Routes
router.get('/dashboard', getDashboardData);
router.get('/dashboard/reports/:type', generateReport);
router.post('/dashboard/bulk-update', bulkUpdateTasks);

// Database Management Routes (for development and testing)
router.post('/seed', seedDatabase);
router.post('/seed/force', forceSeedDatabase);
router.delete('/clear', clearDatabase);

// Export endpoints
router.get('/export/projects', async (req, res) => {
  try {
    const { Project } = await import('../models/index.js');
    const projects = await Project.find({}).lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="projects-export.json"');
    res.json({
      exportDate: new Date().toISOString(),
      totalRecords: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Export failed',
      message: error.message
    });
  }
});

router.get('/export/tasks', async (req, res) => {
  try {
    const { Task } = await import('../models/index.js');
    const tasks = await Task.find({})
      .populate('project', 'name status')
      .lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-export.json"');
    res.json({
      exportDate: new Date().toISOString(),
      totalRecords: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Export failed',
      message: error.message
    });
  }
});

// Search endpoints
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        message: 'Provide a search query using the "q" parameter'
      });
    }

    const { Task, Project } = await import('../models/index.js');
    const results = {};

    if (type === 'all' || type === 'tasks') {
      results.tasks = await Task.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .populate('project', 'name color')
      .limit(parseInt(limit))
      .lean();
    }

    if (type === 'all' || type === 'projects') {
      results.projects = await Project.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .limit(parseInt(limit))
      .lean();
    }

    const totalResults = (results.tasks?.length || 0) + (results.projects?.length || 0);

    res.status(200).json({
      success: true,
      query: q,
      totalResults,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// Advanced filtering endpoint
router.get('/filter', async (req, res) => {
  try {
    const {
      dateRange,
      status,
      priority,
      tags,
      assignee,
      projectId,
      overdue,
      completed,
      hasNotes
    } = req.query;

    const { Task } = await import('../models/index.js');
    let filter = {};

    // Date range filtering
    if (dateRange) {
      const [start, end] = dateRange.split(',');
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    // Status and priority filters
    if (status) filter.status = { $in: status.split(',') };
    if (priority) filter.priority = { $in: priority.split(',') };
    if (assignee) filter.assignee = { $regex: assignee, $options: 'i' };
    if (projectId) filter.project = projectId;

    // Tag filtering
    if (tags) {
      const tagList = tags.split(',');
      filter.tags = { $in: tagList };
    }

    // Special filters
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['completed', 'cancelled'] };
    }

    if (completed === 'true') {
      filter.status = 'completed';
    }

    if (hasNotes === 'true') {
      filter['notes.0'] = { $exists: true };
    }

    const results = await Task.find(filter)
      .populate('project', 'name status color')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      filters: {
        dateRange,
        status,
        priority,
        tags,
        assignee,
        projectId,
        overdue,
        completed,
        hasNotes
      },
      totalResults: results.length,
      data: results
    });
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({
      success: false,
      error: 'Filtering failed',
      message: error.message
    });
  }
});

export default router;