const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  department:     { type: String, required: true },
  description:    { type: String, required: true },
  requiredSkills: [{ type: String }],
  minExperience:  { type: Number, default: 0 },
  postedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isOpen:         { type: Boolean, default: true },
  deadline:       { type: Date },
}, { timestamps: true });


// Part 6: Indexes for job search
jobSchema.index({ isOpen: 1, department: 1 });
jobSchema.index({ isOpen: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);