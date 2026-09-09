const express = require('express');
const router  = express.Router();
const { createJob, getAllJobs, getJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateJob, validate } = require('../middleware/validateMiddleware');

router.post('/',    protect, authorize('hr','admin'), validateJob, validate, createJob);
router.get('/',     protect, getAllJobs);
router.get('/:id',  protect, getJob);
router.put('/:id',  protect, authorize('hr','admin'), validateJob, validate, updateJob);
router.delete('/:id', protect, authorize('hr','admin'), deleteJob);

module.exports = router;
