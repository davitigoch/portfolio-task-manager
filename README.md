# Portfolio Task Manager API

 A professional CRUD application for managing tasks and projects built with Node.js, Express, and MongoDB. This project showcases modern backend development practices with ES2015+ modules, async/await, RESTful API design, and comprehensive error handling.

## 🎯 Project Overview

This is a portfolio-ready application that demonstrates:
- Full CRUD operations (Create, Read, Update, Delete)
- RESTful API design with proper HTTP status codes
- MongoDB integration with Mongoose schemas
- Input validation and error handling
- Modern JavaScript (ES2015+ modules)
- Professional code organization
- Comprehensive API documentation

## ✨ Features

### Task Management
- Create, update, delete, and retrieve tasks
- Filter tasks by status, priority, project
- Search tasks by title and description
- Pagination and sorting
- Add notes to tasks
- Track estimated vs actual hours
- Due date tracking with overdue task detection

### Project Management
- Create and manage projects
- Assign tasks to projects
- Project statistics and analytics
- Color coding for visual organization
- Status tracking (planning, in-progress, completed, etc.)

### Advanced Features
- Comprehensive input validation
- Error handling with detailed messages
- Request rate limiting
- Security headers
- CORS configuration
- Health check endpoints
- Database connection monitoring

##  Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: express-validator
- **Security**: CORS, rate limiting, security headers
- **Development**: ES2015+ modules, async/await

## 📁 Project Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── projectController.js # Project CRUD operations
│   └── taskController.js    # Task CRUD operations
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Input validation rules
├── models/
│   ├── Project.js           # Project MongoDB schema
│   ├── Task.js              # Task MongoDB schema
│   └── index.js             # Model exports
├── routes/
│   ├── projectRoutes.js     # Project API routes
│   ├── taskRoutes.js        # Task API routes
│   └── index.js             # Route aggregation
└── server.js                # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or Docker)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/portfolio-task-manager
   
   # For MongoDB Atlas (optional)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio-task-manager
   ```

4. **Start MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```
   
   **Option B: Docker**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
   
   **Option C: MongoDB Atlas**
   - Update `MONGODB_URI` in `.env` with your Atlas connection string

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   Open http://localhost:3000 in your browser. You should see:
   ```json
   {
     "message": "🚀 Portfolio Task Manager API is running!",
     "version": "1.0.0",
     "endpoints": {
       "api": "/api",
       "tasks": "/api/tasks",
       "projects": "/api/projects",
       "health": "/health"
     }
   }
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format
All responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // For list endpoints
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "details": [ ... ]  // Validation errors
}
```

### Projects API

#### Get All Projects
```http
GET /api/projects
```

**Query Parameters:**
- `status` - Filter by status (planning, in-progress, completed, on-hold, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `search` - Search in name and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (createdAt, name, status, priority, dueDate)
- `sortOrder` - Sort direction (asc, desc)
- `includeTasks` - Include task statistics (true/false)

**Example:**
```bash
curl "http://localhost:3000/api/projects?status=in-progress&priority=high&page=1&limit=5"
```

#### Get Project by ID
```http
GET /api/projects/:id
```

**Query Parameters:**
- `includeTasks` - Include project tasks (true/false)

#### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "Portfolio Website",
  "description": "Build a professional portfolio website",
  "status": "planning",
  "priority": "high",
  "startDate": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "tags": ["web", "portfolio"],
  "color": "#3b82f6"
}
```

#### Update Project
```http
PUT /api/projects/:id
```

#### Delete Project
```http
DELETE /api/projects/:id
```

**Query Parameters:**
- `deleteTasks` - Also delete associated tasks (true/false)

#### Get Project Statistics
```http
GET /api/projects/stats
```

#### Get Project Tasks
```http
GET /api/projects/:id/tasks
```

### Tasks API

#### Get All Tasks
```http
GET /api/tasks
```

**Query Parameters:**
- `status` - Filter by status (todo, in-progress, review, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `project` - Filter by project ID
- `search` - Full-text search in title and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (createdAt, title, status, priority, dueDate)
- `sortOrder` - Sort direction (asc, desc)

#### Get Task by ID
```http
GET /api/tasks/:id
```

#### Create Task
```http
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "Design homepage layout",
  "description": "Create wireframes and mockups for the homepage",
  "status": "todo",
  "priority": "high",
  "project": "project_id_here",
  "assignee": "John Doe",
  "dueDate": "2024-12-20T00:00:00.000Z",
  "estimatedHours": 8,
  "tags": ["design", "frontend"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Get Overdue Tasks
```http
GET /api/tasks/overdue
```

#### Add Note to Task
```http
POST /api/tasks/:id/notes
```

**Request Body:**
```json
{
  "content": "Started working on this task. Making good progress."
}
```

### Utility Endpoints

#### Health Check
```http
GET /health
```

#### API Documentation
```http
GET /api
```

## 🧪 Testing the API

### Using PowerShell (Windows)

1. **Create a project:**
```powershell
$projectData = @{
    name = "Test Project"
    description = "A test project"
    status = "planning"
    priority = "medium"
}
$json = $projectData | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/projects" -Method Post -Body $json -ContentType "application/json"
```

2. **Create a task:**
```powershell
$taskData = @{
    title = "Test Task"
    description = "A test task"
    status = "todo"
    priority = "high"
}
$json = $taskData | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Method Post -Body $json -ContentType "application/json"
```

3. **Get all projects:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/projects" -Method Get
```

### Using curl (Linux/Mac/Windows)

See [API_TESTS.md](./API_TESTS.md) for comprehensive curl examples.

### Using Postman or Insomnia

Import the following collection endpoints:
- `GET http://localhost:3000/api/projects`
- `POST http://localhost:3000/api/projects`
- `GET http://localhost:3000/api/tasks`
- `POST http://localhost:3000/api/tasks`

## 🗃 Database Schema

### Project Schema
```javascript
{
  name: String (required, 2-100 chars),
  description: String (optional, max 500 chars),
  status: String (planning|in-progress|completed|on-hold|cancelled),
  priority: String (low|medium|high|urgent),
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  tags: [String],
  color: String (hex color),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String (required, 2-200 chars),
  description: String (optional, max 1000 chars),
  status: String (todo|in-progress|review|completed|cancelled),
  priority: String (low|medium|high|urgent),
  project: ObjectId (reference to Project),
  assignee: String,
  dueDate: Date,
  completedDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  notes: [{ content: String, createdAt: Date }],
  attachments: [{ filename: String, url: String, uploadedAt: Date }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Security Headers**: Adds security-focused HTTP headers
- **Error Handling**: Doesn't expose sensitive information
- **Request Timeout**: Prevents hanging requests

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in your `.env` file

### Deployment Platforms
- **Heroku**: Add MongoDB Atlas add-on
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform
- **AWS**: Use Elastic Beanstalk or EC2

## 📈 Performance Considerations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lean queries for better performance
- Connection pooling with Mongoose
- Request timeout configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Contact

**Irina** - [Your GitHub Profile](https://github.com/yourusername)

Project Link: [https://github.com/yourusername/portfolio-task-manager](https://github.com/yourusername/portfolio-task-manager)

---

## 🎓 Educational Value

This project demonstrates:
- **Backend Development**: Node.js and Express.js best practices
- **Database Design**: MongoDB schema design and relationships
- **API Design**: RESTful principles and HTTP status codes
- **Error Handling**: Comprehensive error management
- **Code Organization**: Professional project structure
- **Documentation**: Clear API documentation and setup instructions
- **Testing**: API endpoint validation
- **Security**: Basic security practices

Perfect for portfolios and job interviews! 🌟