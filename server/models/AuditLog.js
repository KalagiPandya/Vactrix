const mongoose = require('mongoose');

/**
 * AuditLog Model — Part 4: Security Hardening
 * Every sensitive action is logged here for compliance + debugging.
 * Write-only from application — never update, never delete.
 */
const auditLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userEmail: { type: String, default: 'anonymous' },
  userRole:  { type: String, default: 'unknown' },

  action:   { type: String, required: true }, // e.g. 'LOGIN', 'APPLY_JOB', 'APPROVE_PROMOTION'
  resource: { type: String, default: null },  // e.g. '/api/applications/123/apply'
  method:   { type: String, default: null },  // GET, POST, PATCH, etc.

  success:   { type: Boolean, default: true },
  message:   { type: String, default: '' },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },

  meta: { type: Object, default: {} },        // extra context
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
