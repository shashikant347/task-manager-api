const mongoose = require('mongoose');

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    dueDate: { type: Date },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

taskSchema.index({ user: 1, status: 1, priority: 1, createdAt: -1 });

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
