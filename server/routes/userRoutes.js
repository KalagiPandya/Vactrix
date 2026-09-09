const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateProfile, validate } = require('../middleware/validateMiddleware');

router.get('/profile',       protect, getProfile);
router.put('/profile',       protect, validateProfile, validate, updateProfile);
router.get('/',              protect, authorize('admin'), getAllUsers);
router.put('/:id/role',      protect, authorize('admin'), updateUserRole);

module.exports = router;
