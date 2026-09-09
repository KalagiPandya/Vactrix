const Job          = require('../models/Job');
const notifService = require('../services/notificationService');
const auditLog     = require('../services/auditService');

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.userId });

    // Notify all employees: new job available
    const User = require('../models/User');
    const employees = await User.find({ role: 'employee' }).select('_id').limit(50);
    await Promise.all(employees.map(emp =>
      notifService.createAndEmit({
        recipientId:   emp._id,
        recipientRole: 'employee',
        type:          'new_job_posted',
        title:         `New Job: ${job.title}`,
        message:       `A new position in ${job.department} is now open. Check it out!`,
        link:          `/jobs/${job._id}`,
        relatedJob:    job._id,
        meta:          { jobTitle: job.title, department: job.department },
      })
    ));

    await auditLog.log({
      userId: req.user.userId, userRole: req.user.role,
      action: 'CREATE_JOB', resource: '/api/jobs', method: 'POST',
      success: true, message: `Posted job: ${job.title}`, ipAddress: req.ip,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL OPEN JOBS
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true })
      .populate('postedBy', 'name department')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE JOB
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name department');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE JOB
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
