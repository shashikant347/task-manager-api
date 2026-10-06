const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token: signToken(user._id) },
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password (prevents user enumeration)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token: signToken(user._id) },
  });
});

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
