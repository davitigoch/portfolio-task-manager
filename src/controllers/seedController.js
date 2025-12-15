import { Project, Task } from '../models/index.js';
import { connectDB } from '../config/database.js';

/**
 * Database Seeding Utility
 * Demonstrates advanced MongoDB operations and provides sample data
 * This showcases database expertise and provides immediate value for testing
 */

/**
 * Sample projects data
 */
const sampleProjects = [
  {
    name: "Portfolio Website Redesign",
    description: "Complete overhaul of personal portfolio with modern design and interactive features",
    status: "in-progress",
    priority: "high",
    startDate: new Date('2024-11-01'),
    dueDate: new Date('2025-01-31'),
    tags: ["web", "design", "portfolio", "react"],
    color: "#3b82f6"
  },
  {
    name: "E-commerce Mobile App",
    description: "React Native app for online shopping with payment integration",
    status: "planning",
    priority: "urgent",
    startDate: new Date('2024-12-01'),
    dueDate: new Date('2025-03-15'),
    tags: ["mobile", "react-native", "ecommerce", "payments"],
    color: "#10b981"
  },
  {
    name: "Task Management System",
    description: "CRUD application for team task management with real-time collaboration",
    status: "completed",
    priority: "medium",
    startDate: new Date('2024-09-01'),
    dueDate: new Date('2024-11-30'),
    completedDate: new Date('2024-11-28'),
    tags: ["backend", "api", "mongodb", "express"],
    color: "#f59e0b"
  },
  {
    name: "AI ChatBot Integration",
    description: "Integrate advanced AI chatbot for customer service automation",
    status: "on-hold",
    priority: "low",
    startDate: new Date('2024-10-01'),
    dueDate: new Date('2025-02-01'),
    tags: ["ai", "chatbot", "automation", "api"],
    color: "#8b5cf6"
  },
  {
    name: "Database Migration Project",
    description: "Migrate legacy MySQL database to modern MongoDB with optimization",
    status: "planning",
    priority: "high",
    startDate: new Date('2025-01-01'),
    dueDate: new Date('2025-04-01'),
    tags: ["database", "migration", "mongodb", "optimization"],
    color: "#ef4444"
  }
];

/**
 * Generate sample tasks for projects
 */
const generateSampleTasks = (projects) => {
  const tasks = [];
  const statuses = ['todo', 'in-progress', 'review', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  // Task templates for different project types
  const taskTemplates = {
    web: [
      'Design wireframes and mockups',
      'Set up development environment',
      'Create responsive navigation component',
      'Implement user authentication',
      'Build contact form with validation',
      'Optimize for SEO and performance',
      'Write unit tests',
      'Deploy to production'
    ],
    mobile: [
      'Create app architecture and navigation',
      'Design UI components and screens',
      'Implement user registration/login',
      'Build product catalog functionality',
      'Integrate payment gateway',
      'Add push notifications',
      'Perform testing on multiple devices',
      'Submit to app stores'
    ],
    backend: [
      'Design database schema',
      'Set up Express server and routing',
      'Implement CRUD operations',
      'Add authentication middleware',
      'Create comprehensive error handling',
      'Write API documentation',
      'Set up automated testing',
      'Configure deployment pipeline'
    ],
    ai: [
      'Research AI/ML frameworks and APIs',
      'Design conversation flow',
      'Integrate natural language processing',
      'Build training data pipeline',
      'Implement response generation',
      'Add sentiment analysis',
      'Create admin dashboard',
      'Optimize response accuracy'
    ],
    database: [
      'Analyze current database structure',
      'Design new MongoDB schema',
      'Create data migration scripts',
      'Set up backup procedures',
      'Implement data validation',
      'Optimize query performance',
      'Test migration process',
      'Documentation and training'
    ]
  };

  projects.forEach((project, projectIndex) => {
    const projectType = project.tags.includes('web') ? 'web' :
                       project.tags.includes('mobile') ? 'mobile' :
                       project.tags.includes('backend') ? 'backend' :
                       project.tags.includes('ai') ? 'ai' : 'database';
    
    const projectTasks = taskTemplates[projectType] || taskTemplates.web;
    
    projectTasks.forEach((taskTitle, taskIndex) => {
      const isCompleted = project.status === 'completed' || 
                         (project.status === 'in-progress' && Math.random() > 0.6);
      
      const estimatedHours = Math.floor(Math.random() * 16) + 4; // 4-20 hours
      const actualHours = isCompleted ? 
        Math.floor(estimatedHours * (0.8 + Math.random() * 0.6)) : // 80%-140% of estimate
        (Math.random() > 0.5 ? Math.floor(estimatedHours * Math.random()) : null);

      const dueDate = new Date(project.startDate);
      dueDate.setDate(dueDate.getDate() + (taskIndex + 1) * 7); // Spread tasks weekly
      
      // Ensure due date is in the future
      const now = new Date();
      if (dueDate < now) {
        dueDate.setTime(now.getTime() + (taskIndex + 1) * 7 * 24 * 60 * 60 * 1000);
      }

      const task = {
        title: taskTitle,
        description: `${taskTitle} for the ${project.name} project. This task is crucial for meeting project milestones and delivering quality results.`,
        status: isCompleted ? 'completed' : 
               (project.status === 'in-progress' && Math.random() > 0.7) ? 'in-progress' :
               (project.status === 'planning') ? 'todo' : 'todo',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        project: null, // Will be set after project creation
        assignee: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'][Math.floor(Math.random() * 5)],
        dueDate: dueDate,
        estimatedHours: estimatedHours,
        actualHours: actualHours,
        tags: project.tags.slice(0, 2).concat([
          ['frontend', 'backend', 'testing', 'deployment', 'research'][Math.floor(Math.random() * 5)]
        ]),
        notes: Math.random() > 0.7 ? [
          {
            content: "Initial analysis completed. Moving forward with implementation.",
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          },
          {
            content: "Encountered some challenges with integration. Seeking alternative solutions.",
            createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
          }
        ] : []
      };

      if (isCompleted) {
        task.completedDate = new Date(Math.min(
          dueDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000,
          Date.now()
        ));
      }

      tasks.push(task);
    });
  });

  return tasks;
};

/**
 * Seed the database with sample data
 */
export const seedDatabase = async (req, res) => {
  try {
    // Check if data already exists
    const existingProjects = await Project.countDocuments();
    const existingTasks = await Task.countDocuments();

    if (existingProjects > 0 || existingTasks > 0) {
      return res.status(400).json({
        success: false,
        error: 'Database already contains data',
        message: `Found ${existingProjects} projects and ${existingTasks} tasks. Use force=true to override.`,
        existing: { projects: existingProjects, tasks: existingTasks }
      });
    }

    // Create projects
    console.log('🌱 Seeding projects...');
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // Generate and create tasks
    console.log('🌱 Seeding tasks...');
    const sampleTasks = generateSampleTasks(createdProjects);
    
    // Assign project IDs to tasks
    let taskIndex = 0;
    createdProjects.forEach((project, projectIndex) => {
      const tasksPerProject = 8; // Based on our templates
      for (let i = 0; i < tasksPerProject; i++) {
        if (sampleTasks[taskIndex]) {
          sampleTasks[taskIndex].project = project._id;
          taskIndex++;
        }
      }
    });

    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Generate summary statistics
    const statistics = await generateSeedStatistics();

    res.status(201).json({
      success: true,
      message: 'Database seeded successfully with sample data',
      data: {
        projectsCreated: createdProjects.length,
        tasksCreated: createdTasks.length,
        statistics
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      message: error.message
    });
  }
};

/**
 * Clear all data (for testing)
 */
export const clearDatabase = async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required',
        message: 'Please send { "confirm": "DELETE_ALL_DATA" } to proceed'
      });
    }

    const deletedTasks = await Task.deleteMany({});
    const deletedProjects = await Project.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'Database cleared successfully',
      data: {
        deletedTasks: deletedTasks.deletedCount,
        deletedProjects: deletedProjects.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      message: error.message
    });
  }
};

/**
 * Force seed (replace existing data)
 */
export const forceSeedDatabase = async (req, res) => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Task.deleteMany({});
    await Project.deleteMany({});
    
    // Now seed with fresh data
    req.body = {}; // Reset request body
    return await seedDatabase(req, res);
  } catch (error) {
    console.error('Error force seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force seed database',
      message: error.message
    });
  }
};

/**
 * Generate statistics about seeded data
 */
const generateSeedStatistics = async () => {
  const [projectStats, taskStats] = await Promise.all([
    Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimated: { $sum: '$estimatedHours' },
          totalActual: { $sum: '$actualHours' }
        }
      }
    ])
  ]);

  return {
    projects: {
      total: await Project.countDocuments(),
      byStatus: projectStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    tasks: {
      total: await Task.countDocuments(),
      byStatus: taskStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalEstimatedHours: taskStats.reduce((acc, item) => acc + (item.totalEstimated || 0), 0),
      totalActualHours: taskStats.reduce((acc, item) => acc + (item.totalActual || 0), 0)
    },
    timeTracking: {
      efficiency: taskStats.length > 0 ? 
        ((taskStats.reduce((acc, item) => acc + (item.totalActual || 0), 0) /
          taskStats.reduce((acc, item) => acc + (item.totalEstimated || 0), 0)) * 100).toFixed(1) : 0
    }
  };
};

/**
 * Standalone seeding script (can be run directly)
 */
export const runSeedScript = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Task.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create projects
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} projects`);
    
    // Create tasks
    const sampleTasks = generateSampleTasks(createdProjects);
    let taskIndex = 0;
    createdProjects.forEach(() => {
      const tasksPerProject = 8;
      for (let i = 0; i < tasksPerProject; i++) {
        if (sampleTasks[taskIndex]) {
          sampleTasks[taskIndex].project = createdProjects[Math.floor(taskIndex / tasksPerProject)]._id;
          taskIndex++;
        }
      }
    });
    
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);
    
    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// If this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeedScript();
}