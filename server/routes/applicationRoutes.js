const express = require('express');
const router  = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicants,
  updateStatus,
  recalculateScores,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:jobId/apply',        protect, authorize('employee'), applyForJob);
router.get('/mine',                 protect, getMyApplications);
router.get('/:jobId/applicants',    protect, authorize('hr','admin'), getApplicants);
router.patch('/:id/status',         protect, authorize('hr','admin'), updateStatus);
router.post('/recalculate',         protect, authorize('admin'), recalculateScores);  // Part 5

module.exports = router;
