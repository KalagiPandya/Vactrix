const express = require('express');
const router  = express.Router();
const {
  getHiringFunnel,
  getDepartmentAnalytics,
  getSkillAnalytics,
  getPromotionAnalytics,
  getAnalyticsSummary,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All analytics — HR + Admin only
router.get('/hiring-funnel',  protect, authorize('hr','admin'), getHiringFunnel);
router.get('/department',     protect, authorize('hr','admin'), getDepartmentAnalytics);
router.get('/skills',         protect, authorize('hr','admin'), getSkillAnalytics);
router.get('/promotions',     protect, authorize('hr','admin'), getPromotionAnalytics);
router.get('/summary',        protect, authorize('hr','admin'), getAnalyticsSummary);

module.exports = router;
