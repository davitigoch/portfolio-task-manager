import { Project, Task } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Project Controller
 * Handles all CRUD operations for projects
 */

/**
 * GET /api/projects - Get all projects with optional filtering
 */
export const getAllProjects = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeTasks = false
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    let query = Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Optionally populate task count
    if (includeTasks === 'true') {
      query = query.populate('taskCount');
    }

    const projects = await query.lean();

    // Get total count for pagination
    const total = await Project.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // If including tasks, get task counts manually
    if (includeTasks === 'true') {
      for (let project of projects) {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        
        project.taskStats = {
          total: await Task.countDocuments({ project: project._id }),
          byStatus: taskCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        };
      }
    }

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProjects: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
};

/**
 * GET /api/projects/:id - Get single project by ID
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeTasks = false } = req.query;

    const project = await Project.findById(id).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    // Optionally include tasks
    if (includeTasks === 'true') {
      const tasks = await Task.find({ project: id })
        .sort({ createdAt: -1 })
        .lean();
      
      project.tasks = tasks;
      
      // Add task statistics
      const taskStats = await Task.aggregate([
        { $match: { project: project._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      project.taskStats = {
        total: tasks.length,
        byStatus: taskStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
      message: error.message
    });
  }
};

/**
 * POST /api/projects - Create new project
 */
export const createProject = async (req, res) => {
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

    const project = new Project(req.body);
    const savedProject = await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Project already exists',
        message: 'A project with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create project',
      message: error.message
    });
  }
};

/**
 * PUT /api/projects/:id - Update project by ID
 */
export const updateProject = async (req, res) => {
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

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...req.body },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).lean();

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
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
      error: 'Failed to update project',
      message: error.message
    });
  }
};

/**
 * DELETE /api/projects/:id - Delete project by ID
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteTasks = false } = req.query;

    // Check if project has tasks
    const taskCount = await Task.countDocuments({ project: id });
    
    if (taskCount > 0 && deleteTasks !== 'true') {
      return res.status(409).json({
        success: false,
        error: 'Project has associated tasks',
        message: `This project has ${taskCount} associated tasks. Set deleteTasks=true to delete them as well.`,
        taskCount
      });
    }

    // Delete project
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    // Delete associated tasks if requested
    let deletedTasksCount = 0;
    if (deleteTasks === 'true') {
      const deletedTasks = await Task.deleteMany({ project: id });
      deletedTasksCount = deletedTasks.deletedCount;
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: { 
        id: deletedProject._id, 
        name: deletedProject.name,
        deletedTasksCount
      }
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
      message: error.message
    });
  }
};

/**
 * GET /api/projects/:id/tasks - Get all tasks for a specific project
 */
export const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      priority,
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify project exists
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    // Build filter object
    const filter = { project: id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const tasks = await Task.find(filter)
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
      project: {
        id: project._id,
        name: project.name,
        status: project.status
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTasks: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project tasks',
      message: error.message
    });
  }
};

/**
 * GET /api/projects/stats - Get project statistics
 */
export const getProjectStats = async (req, res) => {
  try {
    // Get project statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get overall task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get overdue tasks count
    const overdueCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get projects with task counts
    const projectsWithTasks = await Project.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'project',
          as: 'tasks'
        }
      },
      {
        $project: {
          name: 1,
          status: 1,
          priority: 1,
          taskCount: { $size: '$tasks' }
        }
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects: {
          total: await Project.countDocuments(),
          byStatus: projectStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        tasks: {
          total: await Task.countDocuments(),
          overdue: overdueCount,
          byStatus: taskStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        topProjects: projectsWithTasks
      }
    });
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project statistics',
      message: error.message
    });
  }
};