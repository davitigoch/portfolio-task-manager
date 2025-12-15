import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import apiRoutes from './routes/index.js';
import { 
  globalErrorHandler, 
  notFoundHandler,
  securityHeaders,
  requestTimeout,
  corsOptions
} from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(securityHeaders);
app.use(requestTimeout(30000)); // 30 second timeout

// CORS middleware
app.use(cors(process.env.NODE_ENV === 'production' ? corsOptions : {}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Portfolio Task Manager API is running!',
    version: '1.0.0',
    endpoints: {
      api: '/api',
      tasks: '/api/tasks',
      projects: '/api/projects',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage()
  });
});

// Error handling middleware (must be last)
app.use('*', notFoundHandler);
app.use(globalErrorHandler);

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/`);
      console.log(`💚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Start the application
startServer();

export default app;