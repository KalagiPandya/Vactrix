const express = require('express');
const router = express.Router();
const {
  getImpactReport,
  simulatePromotion,
  approvePromotion,
  rejectPromotion
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET vacancy chain impact report — HR only
router.get('/impact/:appId', protect, authorize('hr', 'admin'), getImpactReport);

// GET DFS promotion cascade simulation — HR only (Promotion Cascade Engine)
router.get('/simulate/:appId', protect, authorize('hr', 'admin'), simulatePromotion);

// APPROVE promotion — HR only
router.post('/approve/:appId', protect, authorize('hr', 'admin'), approvePromotion);

// REJECT promotion — HR only
router.post('/reject/:appId', protect, authorize('hr', 'admin'), rejectPromotion);

module.exports = router;