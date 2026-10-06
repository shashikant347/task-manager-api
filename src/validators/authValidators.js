const { body } = require('express-validator');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name must be at most 50 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
