import { Task, Project } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Task Controller
 * Handles all CRUD operations for tasks
 */

/**
 * GET /api/tasks - Get all tasks with optional filtering
 */
export const getAllTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      project, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const tasks = await Task.find(filter)
      .populate('project', 'name status color')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTasks: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
};

/**
 * GET /api/tasks/:id - Get single task by ID
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('project', 'name status color priority')
      .lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
};

/**
 * POST /api/tasks - Create new task
 */
export const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // If project is specified, verify it exists
    if (req.body.project) {
      const projectExists = await Project.findById(req.body.project);
      if (!projectExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project',
          message: 'The specified project does not exist'
        });
      }
    }

    const task = new Task(req.body);
    const savedTask = await task.save();

    // Populate project information
    await savedTask.populate('project', 'name status color');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        details: Object.values(error.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
};

/**
 * PUT /api/tasks/:id - Update task by ID
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // If project is being updated, verify it exists
    if (req.body.project) {
      const projectExists = await Project.findById(req.body.project);
      if (!projectExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project',
          message: 'The specified project does not exist'
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...req.body },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate('project', 'name status color');

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        details: Object.values(error.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
};

/**
 * DELETE /api/tasks/:id - Delete task by ID
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: deletedTask._id, title: deletedTask.title }
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
};

/**
 * GET /api/tasks/overdue - Get overdue tasks
 */
export const getOverdueTasks = async (req, res) => {
  try {
    const overdueTasks = await Task.findOverdue()
      .populate('project', 'name status color')
      .sort({ dueDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: overdueTasks,
      count: overdueTasks.length
    });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue tasks',
      message: error.message
    });
  }
};

/**
 * POST /api/tasks/:id/notes - Add note to task
 */
export const addTaskNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required'
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { notes: { content: content.trim() } } },
      { new: true, runValidators: true }
    ).populate('project', 'name status color');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: task
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add note',
      message: error.message
    });
  }
};