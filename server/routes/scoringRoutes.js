const express = require('express');
const router  = express.Router();
const { getConfig, updateConfig, previewScore, getFormulas } = require('../controllers/scoringController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/config',   protect, authorize('admin','hr'), getConfig);
router.put('/config',   protect, authorize('admin'), updateConfig);
router.post('/preview', protect, authorize('admin','hr'), previewScore);
router.get('/formulas', protect, authorize('admin','hr'), getFormulas);

module.exports = router;
