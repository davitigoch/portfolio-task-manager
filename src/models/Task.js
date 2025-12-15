import mongoose from 'mongoose';

/**
 * Task Schema
 * Represents individual tasks that can belong to projects
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [2, 'Task title must be at least 2 characters long'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'review', 'completed', 'cancelled'],
      message: 'Status must be one of: todo, in-progress, review, completed, cancelled'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false // Tasks can exist without projects
  },
  assignee: {
    type: String,
    trim: true,
    maxlength: [100, 'Assignee name cannot exceed 100 characters']
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Due date should be in the future for new tasks
        return !value || value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Due date cannot be in the past'
    }
  },
  completedDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate < new Date();
});

// Virtual for time tracking
taskSchema.virtual('timeVariance').get(function() {
  if (!this.estimatedHours || !this.actualHours) {
    return null;
  }
  return this.actualHours - this.estimatedHours;
});

// Indexes for better performance
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' }); // Text search

// Middleware to set completedDate when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date();
    } else if (this.status !== 'completed') {
      this.completedDate = undefined;
    }
  }
  next();
});

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

// Static method to find tasks by priority
taskSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).sort({ dueDate: 1 });
};

const Task = mongoose.model('Task', taskSchema);

export default Task;