const User     = require('../models/User');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const auditLog = require('../services/auditService');

const BCRYPT_ROUNDS = 12; // Part 4: upgraded from 10 → 12

function signAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password:   hashedPassword,
      department: department || '',
      role:       'employee',
    });

    await auditLog.log({
      userId: user._id, userEmail: user.email, userRole: 'employee',
      action: 'REGISTER', resource: '/api/auth/register', method: 'POST',
      success: true, message: 'New account registered',
      ipAddress: req.ip, userAgent: req.get('user-agent'),
    });

    res.status(201).json({ message: 'Account created successfully!', userId: user._id });
  } catch (err) {
    console.error('[REGISTER ERROR]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await auditLog.log({ action: 'LOGIN_FAILED', success: false, message: `No user: ${email}`, ipAddress: req.ip });
      return res.status(400).json({ message: 'No account found with that email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await auditLog.log({ userId: user._id, userEmail: user.email, action: 'LOGIN_FAILED', success: false, message: 'Wrong password', ipAddress: req.ip });
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Set refresh token as httpOnly cookie (Part 4)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
    });

    await auditLog.log({
      userId: user._id, userEmail: user.email, userRole: user.role,
      action: 'LOGIN', resource: '/api/auth/login', method: 'POST',
      success: true, message: 'Successful login',
      ipAddress: req.ip, userAgent: req.get('user-agent'),
    });

    res.json({
      token: accessToken,
      user: { id: user._id, name: user.name, role: user.role, department: user.department, email: user.email },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── LOGOUT ────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};
