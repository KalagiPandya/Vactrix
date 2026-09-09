/**
 * securityMiddleware.js — Fixed for Express 5 compatibility
 * Key fix: express-mongo-sanitize cannot overwrite req.query in Express 5
 * (req.query is a getter-only property). We sanitize body only.
 */
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss           = require('xss-clean');
const helmet        = require('helmet');

// ── Rate Limiters ─────────────────────────────────────────────────────
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Rate limit exceeded.' },
});

// ── Mongo Sanitize — body only (Express 5 fix) ─────────────────────────
// Express 5: req.query is a getter, cannot be overwritten.
// Solution: manually sanitize only req.body using the library's sanitize function.
const { sanitize: _sanitizeFn } = mongoSanitize;
exports.sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  next();
};

// ── XSS Protection ────────────────────────────────────────────────────
exports.xssProtect = xss();

// ── JSON body parser ──────────────────────────────────────────────────
exports.jsonParser = require('express').json({ limit: '10kb' });

// ── Helmet security headers ───────────────────────────────────────────
exports.helmetConfig = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
});

// ── Centralized Error Handler ─────────────────────────────────────────
exports.errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
