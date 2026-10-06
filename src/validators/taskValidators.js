const { body, param, query } = require('express-validator');
const { STATUSES, PRIORITIES } = require('../models/Task');

const idRule = param('id').isMongoId().withMessage('Invalid task id');

exports.createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
  body('description').optional().isString().trim()
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
];

// Same fields as create, but all optional (partial update); at least one required.
exports.updateTaskRules = [
  idRule,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
  body('description').optional().isString().trim()
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body().custom((value) => {
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
    if (!allowed.some((k) => k in value)) throw new Error('Provide at least one field to update');
    return true;
  }),
];

exports.taskIdRule = [idRule];

exports.listTaskRules = [
  query('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  query('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ max: 100 }),
];
