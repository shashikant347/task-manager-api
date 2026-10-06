const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const UPDATABLE = ['title', 'description', 'status', 'priority', 'dueDate'];

// POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await Task.create({
    title, description, status, priority, dueDate,
    user: req.user._id, // always taken from the token, never from the body
  });
  res.status(201).json({ success: true, data: { task } });
});

// GET /api/tasks?search=&status=&priority=&page=&limit=&sortBy=&order=
exports.getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const sortable = ['createdAt', 'dueDate', 'priority', 'title'];
  const sortBy = sortable.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { tasks },
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/tasks/:id
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found.');
  res.json({ success: true, data: { task } });
});

// PUT /api/tasks/:id
exports.updateTask = asyncHandler(async (req, res) => {
  const updates = {};
  UPDATABLE.forEach((k) => { if (k in req.body) updates[k] = req.body[k]; });

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, // ownership enforced in the query
    updates,
    { new: true, runValidators: true }
  );
  if (!task) throw new ApiError(404, 'Task not found.');
  res.json({ success: true, data: { task } });
});

// DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found.');
  res.json({ success: true, message: 'Task deleted successfully' });
});
