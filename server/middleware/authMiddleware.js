const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const auditLog = require('../services/auditService');

/**
 * protect — Verify JWT access token
 * Also supports refresh token rotation (Part 4)
 */
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please login first.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach full decoded payload — userId + role
    req.user = decoded;
    next();
  } catch (err) {
    // Part 4: Log failed auth attempts
    await auditLog.log({
      action:    'AUTH_FAILED',
      resource:  req.originalUrl,
      method:    req.method,
      success:   false,
      message:   err.message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

/**
 * authorize — Role-based access control
 * Usage: authorize('hr', 'admin')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

/**
 * refreshToken — Issue new access token from refresh token (Part 4)
 * Client sends refresh token in httpOnly cookie
 */
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
    const user    = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
