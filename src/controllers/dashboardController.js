import { Task, Project } from '../models/index.js';

/**
 * Dashboard Controller
 * Advanced analytics and dashboard functionality for maximum creativity points
 */

/**
 * GET /api/dashboard - Get comprehensive dashboard data
 * This showcases advanced MongoDB aggregation and provides valuable business insights
 */
export const getDashboardData = async (req, res) => {
  try {
    // Get date range (default: last 30 days)
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 1. Overall Statistics
    const [projectStats, taskStats] = await Promise.all([
      // Project statistics with aggregation
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDuration: {
              $avg: {
                $cond: [
                  { $and: ['$startDate', '$completedDate'] },
                  { $subtract: ['$completedDate', '$startDate'] },
                  null
                ]
              }
            }
          }
        }
      ]),

      // Task statistics with time tracking
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalEstimated: { $sum: '$estimatedHours' },
            totalActual: { $sum: '$actualHours' },
            avgVariance: {
              $avg: {
                $cond: [
                  { $and: ['$estimatedHours', '$actualHours'] },
                  { $subtract: ['$actualHours', '$estimatedHours'] },
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    // 2. Productivity Metrics
    const productivityMetrics = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          completedDate: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedDate'
            }
          },
          tasksCompleted: { $sum: 1 },
          hoursTracked: { $sum: '$actualHours' },
          avgCompletionTime: {
            $avg: {
              $subtract: ['$completedDate', '$createdAt']
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Priority Distribution
    const priorityDistribution = await Task.aggregate([
      {
        $group: {
          _id: {
            priority: '$priority',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.priority',
          statusBreakdown: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    // 4. Overdue Analysis
    const overdueAnalysis = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: new Date() },
          status: { $nin: ['completed', 'cancelled'] }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgOverdueDays: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    // 5. Project Progress Overview
    const projectProgress = await Project.aggregate([
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
          dueDate: 1,
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          progressPercentage: {
            $cond: [
              { $gt: [{ $size: '$tasks' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$tasks',
                            cond: { $eq: ['$$this.status', 'completed'] }
                          }
                        }
                      },
                      { $size: '$tasks' }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { dueDate: 1 } }
    ]);

    // 6. Recent Activity (for activity feed)
    const recentActivity = await Task.aggregate([
      { $match: { updatedAt: { $gte: startDate } } },
      { $sort: { updatedAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $project: {
          title: 1,
          status: 1,
          priority: 1,
          updatedAt: 1,
          projectName: { $arrayElemAt: ['$projectInfo.name', 0] }
        }
      }
    ]);

    // 7. Performance Insights
    const performanceInsights = {
      timeAccuracy: taskStats.find(s => s.totalEstimated && s.totalActual) ? 
        ((taskStats.find(s => s.totalActual).totalActual / 
          taskStats.find(s => s.totalEstimated).totalEstimated) * 100).toFixed(1) : 0,
      completionRate: (
        ((taskStats.find(s => s._id === 'completed')?.count || 0) / 
         (taskStats.reduce((acc, s) => acc + s.count, 0))) * 100
      ).toFixed(1),
      avgTasksPerDay: (productivityMetrics.length > 0 ? 
        (productivityMetrics.reduce((acc, day) => acc + day.tasksCompleted, 0) / productivityMetrics.length).toFixed(1) : 0)
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProjects: await Project.countDocuments(),
          totalTasks: await Task.countDocuments(),
          overdueCount: await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $nin: ['completed', 'cancelled'] }
          }),
          completionRate: performanceInsights.completionRate
        },
        projectStats,
        taskStats,
        productivityMetrics,
        priorityDistribution,
        overdueAnalysis,
        projectProgress,
        recentActivity,
        performanceInsights,
        timeRange: {
          startDate,
          endDate: new Date(),
          days: parseInt(days)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
};

/**
 * GET /api/dashboard/reports/:type - Generate specific reports
 */
export const generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let reportData;

    switch (type) {
      case 'productivity':
        reportData = await Task.aggregate([
          ...(Object.keys(dateFilter).length ? [{ $match: { completedDate: dateFilter } }] : []),
          {
            $group: {
              _id: {
                week: { $week: '$completedDate' },
                year: { $year: '$completedDate' }
              },
              tasksCompleted: { $sum: 1 },
              totalHours: { $sum: '$actualHours' },
              avgHoursPerTask: { $avg: '$actualHours' }
            }
          },
          { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);
        break;

      case 'project-performance':
        reportData = await Project.aggregate([
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
              startDate: 1,
              dueDate: 1,
              completedDate: 1,
              totalTasks: { $size: '$tasks' },
              completedTasks: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              },
              totalEstimatedHours: { $sum: '$tasks.estimatedHours' },
              totalActualHours: { $sum: '$tasks.actualHours' },
              onTimeCompletion: {
                $cond: [
                  { $and: ['$completedDate', '$dueDate'] },
                  { $lte: ['$completedDate', '$dueDate'] },
                  null
                ]
              }
            }
          }
        ]);
        break;

      case 'time-tracking':
        reportData = await Task.aggregate([
          {
            $match: {
              estimatedHours: { $exists: true },
              actualHours: { $exists: true },
              ...(Object.keys(dateFilter).length ? { completedDate: dateFilter } : {})
            }
          },
          {
            $project: {
              title: 1,
              estimatedHours: 1,
              actualHours: 1,
              variance: { $subtract: ['$actualHours', '$estimatedHours'] },
              variancePercent: {
                $multiply: [
                  { $divide: [{ $subtract: ['$actualHours', '$estimatedHours'] }, '$estimatedHours'] },
                  100
                ]
              }
            }
          }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type',
          message: 'Available types: productivity, project-performance, time-tracking'
        });
    }

    // Export functionality for different formats
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      
      // Simple CSV conversion (in a real app, use a proper CSV library)
      const csvData = convertToCSV(reportData);
      return res.send(csvData);
    }

    res.status(200).json({
      success: true,
      reportType: type,
      data: reportData,
      generatedAt: new Date().toISOString(),
      recordCount: reportData.length
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message
    });
  }
};

/**
 * POST /api/dashboard/bulk-update - Bulk operations for efficiency
 */
export const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates, operation } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'taskIds array is required'
      });
    }

    let result;

    switch (operation) {
      case 'update-status':
        if (!updates.status) {
          return res.status(400).json({
            success: false,
            error: 'Status is required for status update'
          });
        }
        result = await Task.updateMany(
          { _id: { $in: taskIds } },
          { status: updates.status, updatedAt: new Date() }
        );
        break;

      case 'update-priority':
        if (!updates.priority) {
          return res.status(400).json({
            success: false,
            error: 'Priority is required for priority update'
          });
        }
        result = await Task.updateMany(
          { _id: { $in: taskIds } },
          { priority: updates.priority, updatedAt: new Date() }
        );
        break;

      case 'assign-project':
        if (!updates.project) {
          return res.status(400).json({
            success: false,
            error: 'Project is required for project assignment'
          });
        }
        result = await Task.updateMany(
          { _id: { $in: taskIds } },
          { project: updates.project, updatedAt: new Date() }
        );
        break;

      case 'delete':
        result = await Task.deleteMany({ _id: { $in: taskIds } });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation',
          message: 'Supported operations: update-status, update-priority, assign-project, delete'
        });
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      data: {
        operation,
        affectedCount: result.modifiedCount || result.deletedCount,
        taskIds: taskIds
      }
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update',
      message: error.message
    });
  }
};

// Helper function for CSV conversion
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      return typeof value === 'string' ? `"${value}"` : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\\n');
};