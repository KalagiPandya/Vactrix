/**
 * searchController.js — Part 6: Advanced Search + Filtering
 *
 * All queries use MongoDB aggregation pipelines with:
 *   - Compound indexes for fast field queries
 *   - $regex for text search (case-insensitive)
 *   - Server-side pagination (skip/limit)
 *   - Dynamic sort on any field
 *   - Multi-field filtering in one pipeline
 *
 * QUERY OPTIMIZATION STRATEGY:
 *   1. Filter stage runs first (reduces dataset early)
 *   2. $lookup (join) runs after filter (smaller join)
 *   3. Sort runs on indexed fields
 *   4. Pagination ($skip + $limit) runs last
 *   Total pipeline: O(N log N) with indexes vs O(N²) without
 */

const User        = require('../models/User');
const Job         = require('../models/Job');
const Application = require('../models/Application');

// ── CANDIDATE SEARCH ─────────────────────────────────────────────────
// GET /api/search/candidates
// Query params: q, department, skills, minExp, maxExp, minScore, maxScore,
//               minRating, hasCerts, sortBy, sortDir, page, limit
exports.searchCandidates = async (req, res) => {
  try {
    const {
      q          = '',
      department = '',
      skills     = '',       // comma-separated
      minExp     = 0,
      maxExp     = 50,
      minRating  = 1,
      maxRating  = 5,
      hasCerts   = '',       // 'true' | 'false' | ''
      minScore   = 0,        // finalScore filter (from applications)
      maxScore   = 100,
      sortBy     = 'name',   // name | experience | performanceRating | finalScore
      sortDir    = 'asc',    // asc | desc
      page       = 1,
      limit      = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Build filter ──────────────────────────────────────────────
    const filter = { role: 'employee' };

    // Text search across name + email
    if (q.trim()) {
      filter.$or = [
        { name:  { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (department) filter.department = { $regex: department, $options: 'i' };
    if (minExp || maxExp < 50) filter.experience = { $gte: Number(minExp), $lte: Number(maxExp) };
    if (minRating > 1 || maxRating < 5) filter.performanceRating = { $gte: Number(minRating), $lte: Number(maxRating) };
    if (hasCerts === 'true')  filter['certifications.0'] = { $exists: true };
    if (hasCerts === 'false') filter.certifications = { $size: 0 };

    // Skills filter — must have ALL listed skills
    if (skills.trim()) {
      const skillArr = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      filter.skills = {
        $all: skillArr.map(s => new RegExp(s, 'i')),
      };
    }

    // ── Sort ──────────────────────────────────────────────────────
    const validSortFields = ['name', 'experience', 'performanceRating', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortObj   = { [sortField]: sortDir === 'desc' ? -1 : 1 };

    // ── Execute queries in parallel ───────────────────────────────
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Enrich with application stats
    const userIds    = users.map(u => u._id);
    const appStats   = await Application.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id:           '$userId',
          totalApps:     { $sum: 1 },
          avgScore:      { $avg: '$finalScore' },
          bestScore:     { $max: '$finalScore' },
          approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          latestStatus:  { $last: '$status' },
        },
      },
    ]);

    const statsMap = {};
    appStats.forEach(s => { statsMap[s._id.toString()] = s; });

    const enriched = users.map(u => ({
      ...u,
      appStats: statsMap[u._id.toString()] || { totalApps: 0, avgScore: 0, bestScore: 0, approvedCount: 0 },
    }));

    // Filter by score if requested
    const finalResults = (minScore > 0 || maxScore < 100)
      ? enriched.filter(u => {
          const best = u.appStats.bestScore || 0;
          return best >= Number(minScore) && best <= Number(maxScore);
        })
      : enriched;

    res.json({
      results:     finalResults,
      total,
      page:        pageNum,
      limit:       limitNum,
      pages:       Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
      query:       { q, department, skills, minExp, maxExp, sortBy, sortDir },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── JOB SEARCH ────────────────────────────────────────────────────────
// GET /api/search/jobs
exports.searchJobs = async (req, res) => {
  try {
    const {
      q          = '',
      department = '',
      skills     = '',
      minExp     = 0,
      maxExp     = 50,
      isOpen     = '',
      sortBy     = 'createdAt',
      sortDir    = 'desc',
      page       = 1,
      limit      = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    if (q.trim()) {
      filter.$or = [
        { title:       { $regex: q.trim(), $options: 'i' } },
        { department:  { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (department) filter.department  = { $regex: department, $options: 'i' };
    if (isOpen === 'true')  filter.isOpen = true;
    if (isOpen === 'false') filter.isOpen = false;
    if (minExp || maxExp < 50) filter.minExperience = { $gte: Number(minExp), $lte: Number(maxExp) };

    if (skills.trim()) {
      const skillArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      filter.requiredSkills = { $all: skillArr.map(s => new RegExp(s, 'i')) };
    }

    const validSort = ['createdAt', 'title', 'department', 'minExperience'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'createdAt';

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name department')
        .sort({ [sortField]: sortDir === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Enrich with applicant count
    const jobIds   = jobs.map(j => j._id);
    const appCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 }, avgScore: { $avg: '$finalScore' } } },
    ]);
    const countMap = {};
    appCounts.forEach(a => { countMap[a._id.toString()] = { count: a.count, avgScore: Math.round(a.avgScore || 0) }; });

    const enriched = jobs.map(j => ({
      ...j,
      applicantStats: countMap[j._id.toString()] || { count: 0, avgScore: 0 },
    }));

    res.json({
      results: enriched, total, page: pageNum, limit: limitNum,
      pages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── APPLICATION SEARCH (HR) ───────────────────────────────────────────
// GET /api/search/applications
exports.searchApplications = async (req, res) => {
  try {
    const {
      q         = '',
      status    = '',
      minScore  = 0,
      maxScore  = 100,
      department= '',
      sortBy    = 'finalScore',
      sortDir   = 'desc',
      page      = 1,
      limit     = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const matchStage = {};
    if (status) matchStage.status = status;
    if (minScore || maxScore < 100) {
      matchStage.finalScore = { $gte: Number(minScore), $lte: Number(maxScore) };
    }

    const validSort = ['finalScore', 'skillScore', 'expScore', 'createdAt'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'finalScore';

    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'jobs',  localField: 'jobId',  foreignField: '_id', as: 'job'  } },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      { $unwind: { path: '$job',  preserveNullAndEmpty: true } },
    ];

    // Text + dept filter after join
    const postFilter = {};
    if (q.trim()) {
      postFilter.$or = [
        { 'user.name':  { $regex: q.trim(), $options: 'i' } },
        { 'job.title':  { $regex: q.trim(), $options: 'i' } },
      ];
    }
    if (department) postFilter['job.department'] = { $regex: department, $options: 'i' };
    if (Object.keys(postFilter).length) pipeline.push({ $match: postFilter });

    // Count + paginate in parallel
    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline  = [
      ...pipeline,
      { $sort:  { [sortField]: sortDir === 'asc' ? 1 : -1 } },
      { $skip:  skip },
      { $limit: limitNum },
      { $project: {
          status: 1, finalScore: 1, skillScore: 1, expScore: 1,
          perfScore: 1, certScore: 1, createdAt: 1,
          'user.name': 1, 'user.email': 1, 'user.department': 1,
          'user.experience': 1, 'user.skills': 1,
          'job.title': 1, 'job.department': 1,
      }},
    ];

    const [countResult, results] = await Promise.all([
      Application.aggregate(countPipeline),
      Application.aggregate(dataPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      results, total, page: pageNum, limit: limitNum,
      pages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SUGGESTIONS (autocomplete) ────────────────────────────────────────
// GET /api/search/suggestions?q=react&type=skills|departments|jobs
exports.getSuggestions = async (req, res) => {
  try {
    const { q = '', type = 'all' } = req.query;
    if (!q.trim() || q.length < 1) return res.json({ suggestions: [] });
    const regex = { $regex: q.trim(), $options: 'i' };
    const suggestions = [];

    if (type === 'all' || type === 'skills') {
      const skillDocs = await User.aggregate([
        { $unwind: '$skills' },
        { $match: { skills: regex } },
        { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 },
      ]);
      skillDocs.forEach(s => suggestions.push({ value: s._id, label: s._id, type: 'skill', count: s.count }));
    }

    if (type === 'all' || type === 'departments') {
      const depts = await User.distinct('department', { department: regex });
      depts.slice(0, 4).forEach(d => suggestions.push({ value: d, label: d, type: 'department' }));
    }

    if (type === 'all' || type === 'jobs') {
      const jobs = await Job.find({ title: regex }).select('title department').limit(4).lean();
      jobs.forEach(j => suggestions.push({ value: j._id, label: j.title, sublabel: j.department, type: 'job' }));
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
