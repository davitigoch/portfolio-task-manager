import mongoose from 'mongoose';

/**
 * Project Schema
 * Represents a project that can contain multiple tasks
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters long'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
      message: 'Status must be one of: planning, in-progress, completed, on-hold, cancelled'
    },
    default: 'planning'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Due date should be after start date if both are provided
        return !value || !this.startDate || value >= this.startDate;
      },
      message: 'Due date must be after start date'
    }
  },
  completedDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  color: {
    type: String,
    default: '#3b82f6', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task count (will be populated when we create the Task model)
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Index for better performance
projectSchema.index({ name: 1, status: 1 });
projectSchema.index({ dueDate: 1 });

// Middleware to set completedDate when status changes to completed
projectSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date();
    } else if (this.status !== 'completed') {
      this.completedDate = undefined;
    }
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;