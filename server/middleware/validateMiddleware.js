/**
 * validateMiddleware.js — Part 4: Input Validation
 * Uses express-validator to validate + sanitize all inputs
 */
const { body, param, validationResult } = require('express-validator');

// ── Run validation result ─────────────────────────────────────────────
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ───────────────────────────────────────────────────
exports.validateRegister = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters')
    .escape(),
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department')
    .optional().trim().escape(),
];

exports.validateLogin = [
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Job validators ────────────────────────────────────────────────────
exports.validateJob = [
  body('title')
    .trim().notEmpty().withMessage('Job title is required')
    .isLength({ max: 100 }).withMessage('Title too long')
    .escape(),
  body('department')
    .trim().notEmpty().withMessage('Department is required').escape(),
  body('description')
    .trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description too long'),
  body('minExperience')
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be 0–50 years'),
  body('requiredSkills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
];

// ── Profile validators ────────────────────────────────────────────────
exports.validateProfile = [
  body('experience')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Experience must be 0–60'),
  body('performanceRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  body('certifications')
    .optional()
    .isArray().withMessage('Certifications must be an array'),
];
