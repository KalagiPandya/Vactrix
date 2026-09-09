const Application   = require('../models/Application');
const Job           = require('../models/Job');
const User          = require('../models/User');
const { calculateSkillMatch, calculateExpScore, calculateFinalScore } = require('../services/scoringService');
const notifService  = require('../services/notificationService');
const auditLog      = require('../services/auditService');

// ── APPLY FOR JOB ─────────────────────────────────────────────────────
exports.applyForJob = async (req, res) => {
  try {
    const job  = await Job.findById(req.params.jobId);
    const user = await User.findById(req.user.userId);

    if (!job)        return res.status(404).json({ message: 'Job not found' });
    if (!job.isOpen) return res.status(400).json({ message: 'Job is closed' });

    const existing = await Application.findOne({ userId: user._id, jobId: job._id });
    if (existing)    return res.status(400).json({ message: 'Already applied for this job' });

    // ── Part 5: Scoring now uses DB-driven weights (async) ────────
    const skillScore = calculateSkillMatch(user.skills, job.requiredSkills);
    const expScore   = calculateExpScore(user.experience, job.minExperience);
    const { finalScore, perfScore, certScore, weightsUsed } = await calculateFinalScore(
      skillScore, expScore, user.performanceRating, user.certifications.length
    );

    const application = await Application.create({
      userId: user._id, jobId: job._id,
      skillScore, expScore, perfScore, certScore, finalScore,
    });

    await notifService.notifyHRTeam({
      type: 'application_submitted',
      title: `New Application — ${job.title}`,
      message: `${user.name} applied for ${job.title} (${job.department}). Match score: ${finalScore}%`,
      link: `/hr/applicants/${job._id}`,
      relatedApplication: application._id, relatedJob: job._id,
      meta: { applicantName: user.name, jobTitle: job.title, score: finalScore },
    });

    await notifService.createAndEmit({
      recipientId: user._id, recipientRole: 'employee',
      type: 'application_submitted',
      title: `Application Submitted — ${job.title}`,
      message: `Your application for ${job.title} has been submitted. Your match score is ${finalScore}%.`,
      link: '/my-applications',
      relatedApplication: application._id, relatedJob: job._id,
      meta: { jobTitle: job.title, score: finalScore },
    });

    await auditLog.log({
      userId: user._id, userEmail: user.email, userRole: user.role,
      action: 'APPLY_JOB', resource: `/api/applications/${job._id}/apply`,
      method: 'POST', success: true, message: `Applied for ${job.title}`,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
      scoreBreakdown: { skillScore, expScore, perfScore: Math.round(perfScore), certScore: Math.round(certScore), finalScore, weightsUsed },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET MY APPLICATIONS ───────────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.userId })
      .populate('jobId', 'title department requiredSkills minExperience')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET APPLICANTS FOR A JOB ──────────────────────────────────────────
exports.getApplicants = async (req, res) => {
  try {
    const applicants = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email department skills experience performanceRating certifications')
      .sort({ finalScore: -1 });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE APPLICATION STATUS ─────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('userId', 'name email role').populate('jobId', 'title department');

    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (app.userId) {
      const msgs = {
        shortlisted: { title: `You've been Shortlisted!`, msg: `Congratulations! Your application for ${app.jobId?.title} has been shortlisted.` },
        rejected:    { title: `Application Update`,          msg: `Your application for ${app.jobId?.title} was not selected this time.` },
        approved:    { title: `Application Approved!`,    msg: `Your application for ${app.jobId?.title} has been approved!` },
      };
      const sm = msgs[status];
      if (sm) {
        await notifService.createAndEmit({
          recipientId: app.userId._id, recipientRole: 'employee',
          type: `application_${status}`, title: sm.title, message: sm.msg,
          link: '/my-applications', relatedApplication: app._id, relatedJob: app.jobId?._id,
        });
      }
    }

    await auditLog.log({
      userId: req.user.userId, userRole: req.user.role,
      action: `UPDATE_STATUS_${status.toUpperCase()}`,
      resource: `/api/applications/${req.params.id}/status`,
      method: 'PATCH', success: true, message: `Changed status to ${status}`, ipAddress: req.ip,
    });

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── RECALCULATE SCORES — Part 5: Live recalculation with new weights ──
exports.recalculateScores = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('userId', 'skills experience performanceRating certifications')
      .populate('jobId', 'requiredSkills minExperience');

    let updated = 0;
    for (const app of applications) {
      if (!app.userId || !app.jobId) continue;
      const skillScore = calculateSkillMatch(app.userId.skills, app.jobId.requiredSkills);
      const expScore   = calculateExpScore(app.userId.experience, app.jobId.minExperience);
      const { finalScore, perfScore, certScore } = await calculateFinalScore(
        skillScore, expScore, app.userId.performanceRating, app.userId.certifications.length
      );
      await Application.findByIdAndUpdate(app._id, { skillScore, expScore, perfScore, certScore, finalScore });
      updated++;
    }

    res.json({ message: `Recalculated scores for ${updated} applications`, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
