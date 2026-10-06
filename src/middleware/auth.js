const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication required. Provide a Bearer token.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // errors handled globally
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User no longer exists.');

  req.user = user;
  next();
});
