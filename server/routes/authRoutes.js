const express  = require('express');
const router   = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { refreshToken }            = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validate } = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');

router.post('/register', authLimiter, validateRegister, validate, register);
router.post('/login',    authLimiter, validateLogin,    validate, login);
router.post('/logout',   logout);
router.post('/refresh',  refreshToken);

module.exports = router;
