const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  skillScore: { type: Number, default: 0 },
  expScore:   { type: Number, default: 0 },
  perfScore:  { type: Number, default: 0 },
  certScore:  { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  status:     { type: String, enum: ['pending','shortlisted','rejected','approved'], default: 'pending' },
}, { timestamps: true });


// Part 6: Indexes for application queries
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ jobId: 1, finalScore: -1 });
applicationSchema.index({ status: 1, finalScore: -1 });
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);