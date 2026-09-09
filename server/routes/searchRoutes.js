const express = require('express');
const router  = express.Router();
const {
  searchCandidates,
  searchJobs,
  searchApplications,
  getSuggestions,
} = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Candidate search — HR + Admin
router.get('/candidates',    protect, authorize('hr','admin'), searchCandidates);
// Job search — any authenticated user
router.get('/jobs',          protect, searchJobs);
// Application search — HR + Admin
router.get('/applications',  protect, authorize('hr','admin'), searchApplications);
// Autocomplete suggestions — any
router.get('/suggestions',   protect, getSuggestions);

module.exports = router;
