const express = require('express');
const router  = express.Router();
const {
  getOrganizationalGraph,
  getVacancyChain,
  simulatePromotion,
  getOrgNodes,
  createOrgNode,
} = require('../controllers/orgController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET  /api/org/graph             — full org graph (HR + Admin)
router.get('/graph', protect, authorize('hr', 'admin'), getOrganizationalGraph);

// GET  /api/org/vacancy-chain/:id — DFS chain from a node (HR + Admin)
router.get('/vacancy-chain/:nodeId', protect, authorize('hr', 'admin'), getVacancyChain);

// POST /api/org/simulate          — simulate promotion (HR + Admin)
router.post('/simulate', protect, authorize('hr', 'admin'), simulatePromotion);

// GET  /api/org/nodes             — list all org nodes (HR + Admin)
router.get('/nodes', protect, authorize('hr', 'admin'), getOrgNodes);

// POST /api/org/nodes             — create org node (Admin only)
router.post('/nodes', protect, authorize('admin'), createOrgNode);

module.exports = router;
