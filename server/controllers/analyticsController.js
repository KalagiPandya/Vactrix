/**
 * analyticsController.js — Part 2: Enterprise Analytics
 *
 * All queries use MongoDB aggregation pipelines for performance.
 * No data is loaded into memory and looped — everything is computed DB-side.
 *
 * Endpoints:
 *   GET /api/analytics/hiring-funnel        — applied/shortlisted/approved/rejected counts
 *   GET /api/analytics/department           — per-dept breakdown + trends
 *   GET /api/analytics/skills               — top missing + top available skills
 *   GET /api/analytics/promotions           — promotion success rate + avg chain depth
 *   GET /api/analytics/summary              — all 4 in one call (dashboard use)
 */

const Application = require('../models/Application');
const Job         = require('../models/Job');
const User        = require('../models/User');
const OrgNode     = require('../models/OrgNode');

// ── HELPER: last N months labels ──────────────────────────────────────
function lastNMonths(n = 6) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
    });
  }
  return months;
}

// ══════════════════════════════════════════════════════════════════════
// 1. HIRING FUNNEL
// ══════════════════════════════════════════════════════════════════════
exports.getHiringFunnel = async (req, res) => {
  try {
    // Aggregate application counts by status
    const statusAgg = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const map = {};
    statusAgg.forEach(s => { map[s._id] = s.count; });

    const total     = Object.values(map).reduce((a, b) => a + b, 0);
    const applied   = total;
    const shortlisted = (map.shortlisted || 0) + (map.approved || 0);
    const hired     = map.approved   || 0;
    const rejected  = map.rejected   || 0;
    const pending   = map.pending    || 0;

    // Funnel stages — each builds on previous
    const funnel = [
      { stage: 'Applied',     count: applied,     color: '#3b82f6', pct: 100 },
      { stage: 'Shortlisted', count: shortlisted, color: '#8b5cf6', pct: applied ? Math.round((shortlisted / applied) * 100) : 0 },
      { stage: 'Hired',       count: hired,       color: '#22c55e', pct: applied ? Math.round((hired / applied) * 100) : 0 },
      { stage: 'Rejected',    count: rejected,    color: '#ef4444', pct: applied ? Math.round((rejected / applied) * 100) : 0 },
      { stage: 'Pending',     count: pending,     color: '#f59e0b', pct: applied ? Math.round((pending / applied) * 100) : 0 },
    ];

    // Score distribution buckets for histogram
    const scoreBuckets = await Application.aggregate([
      {
        $bucket: {
          groupBy: '$finalScore',
          boundaries: [0, 20, 40, 60, 80, 101],
          default: 'Other',
          output: { count: { $sum: 1 }, avgScore: { $avg: '$finalScore' } },
        },
      },
    ]);

    const scoreDistribution = scoreBuckets
      .filter(b => b._id !== 'Other')
      .map(b => ({
        range: `${b._id}–${b._id + 19}%`,
        count: b.count,
        avgScore: Math.round(b.avgScore || 0),
      }));

    // Monthly application trend (last 6 months)
    const months = lastNMonths(6);
    const monthlyRaw = await Application.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        },
      },
    ]);

    const monthlyMap = {};
    monthlyRaw.forEach(m => {
      monthlyMap[`${m._id.year}-${m._id.month}`] = m;
    });

    const monthlyTrend = months.map(m => ({
      month:    m.label,
      applied:  monthlyMap[`${m.year}-${m.month}`]?.count  || 0,
      hired:    monthlyMap[`${m.year}-${m.month}`]?.hired   || 0,
    }));

    res.json({
      funnel,
      scoreDistribution,
      monthlyTrend,
      totals: { total, hired, rejected, pending, shortlisted },
      conversionRate: applied ? `${Math.round((hired / applied) * 100)}%` : '0%',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════
// 2. DEPARTMENT ANALYTICS
// ══════════════════════════════════════════════════════════════════════
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    // Per-department job + application counts
    const deptJobs = await Job.aggregate([
      { $group: { _id: '$department', jobCount: { $sum: 1 }, openJobs: { $sum: { $cond: ['$isOpen', 1, 0] } } } },
      { $sort: { jobCount: -1 } },
    ]);

    // Applications per department (join via job)
    const deptApps = await Application.aggregate([
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$job.department',
          totalApps:    { $sum: 1 },
          hired:        { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected:     { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          shortlisted:  { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          avgScore:     { $avg: '$finalScore' },
        },
      },
      { $sort: { totalApps: -1 } },
    ]);

    // Merge
    const appMap = {};
    deptApps.forEach(d => { appMap[d._id] = d; });

    const departments = deptJobs.map(d => ({
      department:  d._id,
      jobCount:    d.jobCount,
      openJobs:    d.openJobs,
      totalApps:   appMap[d._id]?.totalApps   || 0,
      hired:       appMap[d._id]?.hired        || 0,
      rejected:    appMap[d._id]?.rejected     || 0,
      shortlisted: appMap[d._id]?.shortlisted  || 0,
      avgScore:    Math.round(appMap[d._id]?.avgScore || 0),
      hiringRate:  appMap[d._id]?.totalApps
        ? Math.round((appMap[d._id].hired / appMap[d._id].totalApps) * 100)
        : 0,
    }));

    // Headcount per department (users)
    const headcount = await User.aggregate([
      { $match: { department: { $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgExp: { $avg: '$experience' }, avgRating: { $avg: '$performanceRating' } } },
      { $sort: { count: -1 } },
    ]);

    // Org node vacancy per dept
    const vacancies = await OrgNode.aggregate([
      { $match: { isVacant: true } },
      { $group: { _id: '$department', vacantCount: { $sum: 1 } } },
    ]);
    const vacMap = {};
    vacancies.forEach(v => { vacMap[v._id] = v.vacantCount; });

    // Monthly hiring per dept (last 6 months) — for trend chart
    const months = lastNMonths(6);
    const deptTrendRaw = await Application.aggregate([
      { $match: { status: 'approved' } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      {
        $group: {
          _id: {
            dept:  '$job.department',
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          hired: { $sum: 1 },
        },
      },
    ]);

    // Build monthly trend data per dept
    const topDepts = departments.slice(0, 5).map(d => d.department);
    const deptTrend = months.map(m => {
      const point = { month: m.label };
      topDepts.forEach(dept => {
        const found = deptTrendRaw.find(r =>
          r._id.dept === dept && r._id.year === m.year && r._id.month === m.month
        );
        point[dept] = found?.hired || 0;
      });
      return point;
    });

    res.json({
      departments,
      headcount,
      vacancies: vacMap,
      deptTrend,
      topDepts,
      summary: {
        totalDepts:    departments.length,
        mostActive:    departments[0]?.department || '—',
        highestHiring: [...departments].sort((a,b) => b.hiringRate - a.hiringRate)[0]?.department || '—',
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════
// 3. SKILL HEATMAP
// ══════════════════════════════════════════════════════════════════════
exports.getSkillAnalytics = async (req, res) => {
  try {
    // Top skills employees HAVE (available skills)
    const availableRaw = await User.aggregate([
      { $match: { role: 'employee' } },
      { $unwind: '$skills' },
      { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Top skills REQUIRED by jobs (demanded skills)
    const requiredRaw = await Job.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const availableSkills = availableRaw.map(s => ({ skill: s._id, count: s.count }));
    const requiredSkills  = requiredRaw.map(s => ({ skill: s._id, count: s.count }));

    // Skill GAP — required but not available (or low availability)
    const availMap = {};
    availableSkills.forEach(s => { availMap[s.skill] = s.count; });

    const skillGap = requiredSkills.map(req => ({
      skill:     req.skill,
      required:  req.count,
      available: availMap[req.skill] || 0,
      gap:       req.count - (availMap[req.skill] || 0),
    })).sort((a, b) => b.gap - a.gap).slice(0, 15);

    // Skills by department
    const deptSkills = await User.aggregate([
      { $match: { role: 'employee', department: { $ne: '' } } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: { dept: '$department', skill: { $toLower: '$skills' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Group by dept, top 5 skills each
    const deptSkillMap = {};
    deptSkills.forEach(d => {
      if (!deptSkillMap[d._id.dept]) deptSkillMap[d._id.dept] = [];
      if (deptSkillMap[d._id.dept].length < 5) {
        deptSkillMap[d._id.dept].push({ skill: d._id.skill, count: d.count });
      }
    });

    // Certification analytics — coerce cert to string (handles legacy object-type certs)
    const certStats = await User.aggregate([
      { $match: { role: 'employee' } },
      { $unwind: { path: '$certifications', preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          certStr: {
            $cond: {
              if:   { $eq: [{ $type: '$certifications' }, 'string'] },
              then: '$certifications',
              else: {
                $ifNull: [
                  '$certifications.name',
                  { $toString: '$certifications' }
                ]
              }
            }
          }
        }
      },
      { $match: { certStr: { $ne: '', $exists: true } } },
      { $group: { _id: '$certStr', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      availableSkills,
      requiredSkills,
      skillGap,
      deptSkillMap,
      certifications: certStats.map(c => ({ cert: c._id, count: c.count })),
      summary: {
        totalUniqueSkills: availableSkills.length,
        topSkill:          availableSkills[0]?.skill || '—',
        biggestGap:        skillGap[0]?.skill || '—',
        totalCertHolders:  certStats.reduce((a, b) => a + b.count, 0),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════
// 4. PROMOTION ANALYTICS
// ══════════════════════════════════════════════════════════════════════
exports.getPromotionAnalytics = async (req, res) => {
  try {
    // All promotion-related applications
    const promotionApps = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
          avgSkillScore: { $avg: '$skillScore' },
          avgExpScore:   { $avg: '$expScore' },
          avgPerfScore:  { $avg: '$perfScore' },
        },
      },
    ]);

    const statusMap = {};
    promotionApps.forEach(p => { statusMap[p._id] = p; });

    const totalApps  = promotionApps.reduce((s, p) => s + p.count, 0);
    const approved   = statusMap.approved?.count   || 0;
    const rejected   = statusMap.rejected?.count   || 0;
    const pending    = statusMap.pending?.count     || 0;
    const shortlisted = statusMap.shortlisted?.count || 0;
    const successRate = totalApps ? Math.round((approved / totalApps) * 100) : 0;

    // Score breakdown by status (for grouped bar chart)
    const scoreByStatus = promotionApps.map(p => ({
      status:     p._id,
      avgScore:   Math.round(p.avgScore   || 0),
      skillScore: Math.round(p.avgSkillScore || 0),
      expScore:   Math.round(p.avgExpScore   || 0),
      perfScore:  Math.round(p.avgPerfScore  || 0),
    }));

    // Monthly promotion approvals (last 6 months)
    const months = lastNMonths(6);
    const monthlyPromo = await Application.aggregate([
      { $match: { status: { $in: ['approved', 'rejected'] } } },
      {
        $group: {
          _id: {
            status: '$status',
            year:   { $year: '$updatedAt' },
            month:  { $month: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const promoTrend = months.map(m => {
      const approvedM = monthlyPromo.find(r =>
        r._id.status === 'approved' && r._id.year === m.year && r._id.month === m.month
      );
      const rejectedM = monthlyPromo.find(r =>
        r._id.status === 'rejected' && r._id.year === m.year && r._id.month === m.month
      );
      return {
        month:    m.label,
        approved: approvedM?.count || 0,
        rejected: rejectedM?.count || 0,
      };
    });

    // Top performers (highest final score among approved)
    const topPerformers = await Application.find({ status: 'approved' })
      .populate('userId', 'name department experience')
      .populate('jobId', 'title department')
      .sort({ finalScore: -1 })
      .limit(5);

    // Org chain depth stats from OrgNode levels
    const chainDepthStats = await OrgNode.aggregate([
      { $group: { _id: '$department', avgLevel: { $avg: '$level' }, maxLevel: { $max: '$level' }, nodeCount: { $sum: 1 } } },
      { $sort: { maxLevel: -1 } },
    ]);

    const avgChainDepth = chainDepthStats.length
      ? (chainDepthStats.reduce((s, d) => s + d.maxLevel, 0) / chainDepthStats.length).toFixed(1)
      : 0;

    res.json({
      summary: {
        totalApplications: totalApps,
        approved,
        rejected,
        pending,
        shortlisted,
        successRate: `${successRate}%`,
        avgChainDepth: Number(avgChainDepth),
      },
      scoreByStatus,
      promoTrend,
      chainDepthStats,
      topPerformers: topPerformers.map(a => ({
        name:       a.userId?.name,
        department: a.userId?.department,
        experience: a.userId?.experience,
        jobTitle:   a.jobId?.title,
        finalScore: a.finalScore,
        skillScore: a.skillScore,
        expScore:   a.expScore,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════
// 5. SUMMARY — All 4 in one request
// ══════════════════════════════════════════════════════════════════════
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const [funnel, dept, skills, promos] = await Promise.all([
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: '$department', jobs: { $sum: 1 } } }, { $sort: { jobs: -1 } }]),
      User.aggregate([
        { $match: { role: 'employee' } },
        { $unwind: '$skills' },
        { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const funnelMap = {};
    funnel.forEach(f => { funnelMap[f._id] = f.count; });
    const total = Object.values(funnelMap).reduce((a, b) => a + b, 0);

    res.json({
      kpis: {
        totalApplications: total,
        hired:         funnelMap.approved    || 0,
        rejected:      funnelMap.rejected    || 0,
        pending:       funnelMap.pending     || 0,
        conversionRate: total ? `${Math.round(((funnelMap.approved || 0) / total) * 100)}%` : '0%',
      },
      topDepartments: dept.slice(0, 5).map(d => ({ department: d._id, jobs: d.jobs })),
      topSkills:      skills.slice(0, 8).map(s => ({ skill: s._id, count: s.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
