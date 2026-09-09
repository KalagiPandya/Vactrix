const Application  = require('../models/Application');
const User         = require('../models/User');
const { analyzeVacancyChain } = require('../services/vacancyChainService');
const notifService = require('../services/notificationService');
const auditLog     = require('../services/auditService');

// ── GET VACANCY IMPACT REPORT ─────────────────────────────────────────
exports.getImpactReport = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const report = await analyzeVacancyChain(application.userId, application.jobId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SIMULATE PROMOTION CASCADE (DFS) ──────────────────────────────────
// Powers the "Promotion Cascade Engine" — used by both Promotions.jsx
// and VacancyReport.jsx. Reshapes the raw DFS chain from
// analyzeVacancyChain() into the exact fields those pages render.
exports.simulatePromotion = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const report = await analyzeVacancyChain(application.userId, application.jobId);
    const rawChain = report.chain || [];

    // Each DFS step vacates a role; the candidate filling it vacates
    // their own current role, which becomes the *next* step's vacancy.
    const chain = rawChain.map((step, i) => {
      const next = rawChain[i + 1];
      return {
        promotedPerson:  step.bestCandidate?.name || 'No suitable candidate found',
        fromLevel:       next ? next.level : step.level + 1,
        toLevel:         step.level,
        toPosition:      step.nodeTitle,
        positionVacated: next ? next.nodeTitle : 'None — chain terminates here',
        department:      step.department,
      };
    });

    res.json({
      cascadeRisk:         (report.riskLevel || 'LOW').toLowerCase(),
      chainLength:         report.chainDepth,
      netVacanciesCreated: report.chainDepth,
      explanation:         report.recommendation,
      chain,
      departmentsImpacted: [...new Set(rawChain.map(s => s.department).filter(Boolean))],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── APPROVE PROMOTION ─────────────────────────────────────────────────
exports.approvePromotion = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('userId', 'name email department role')
      .populate('jobId', 'title department');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'approved';
    await application.save();

    if (req.body.newRole) {
      await User.findByIdAndUpdate(application.userId._id, { role: req.body.newRole });
    }

    const empName  = application.userId?.name     || 'Employee';
    const jobTitle = application.jobId?.title      || 'position';
    const dept     = application.jobId?.department || '';

    // ── PART 3: Notify employee ───────────────────────────────────
    await notifService.createAndEmit({
      recipientId:        application.userId._id,
      recipientRole:      'employee',
      type:               'application_approved',
      title:              'Promotion Approved!',
      message:            `Congratulations ${empName}! Your promotion to ${jobTitle} has been officially approved.`,
      link:               '/my-applications',
      relatedApplication: application._id,
      relatedJob:         application.jobId?._id,
      meta:               { jobTitle, department: dept },
    });

    // ── PART 3: Notify all admins ─────────────────────────────────
    await notifService.notifyAdmins({
      type:               'promotion_approved',
      title:              `Promotion Approved — ${empName}`,
      message:            `HR approved ${empName}'s promotion to ${jobTitle} (${dept}). Org chart updated.`,
      link:               `/hr/impact/${application._id}`,
      relatedApplication: application._id,
      relatedJob:         application.jobId?._id,
      meta:               { empName, jobTitle, department: dept },
    });

    // ── PART 4: Audit log ─────────────────────────────────────────
    await auditLog.log({
      userId: req.user.userId, userRole: req.user.role,
      action: 'APPROVE_PROMOTION',
      resource: `/api/promotions/approve/${req.params.appId}`,
      method: 'POST', success: true,
      message: `Approved promotion for ${empName} → ${jobTitle}`,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Promotion approved successfully!', applicationId: application._id, status: 'approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── REJECT PROMOTION ──────────────────────────────────────────────────
exports.rejectPromotion = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('userId', 'name email')
      .populate('jobId', 'title');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'rejected';
    await application.save();

    // Notify employee of rejection
    await notifService.createAndEmit({
      recipientId:        application.userId._id,
      recipientRole:      'employee',
      type:               'application_rejected',
      title:              'Application Update',
      message:            `Your application for ${application.jobId?.title || 'the position'} was not approved at this time.`,
      link:               '/my-applications',
      relatedApplication: application._id,
    });

    await auditLog.log({
      userId: req.user.userId, userRole: req.user.role,
      action: 'REJECT_PROMOTION',
      resource: `/api/promotions/reject/${req.params.appId}`,
      method: 'POST', success: true,
      message: `Rejected promotion for ${application.userId?.name}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Application rejected.', applicationId: application._id, status: 'rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
