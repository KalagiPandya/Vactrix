/**
 * auditService.js — Part 4: Audit Logging
 * Write-only log. Never fails the main request.
 */
const AuditLog = require('../models/AuditLog');

exports.log = async (opts) => {
  try {
    await AuditLog.create({
      userId:    opts.userId    || null,
      userEmail: opts.userEmail || 'anonymous',
      userRole:  opts.userRole  || 'unknown',
      action:    opts.action,
      resource:  opts.resource  || null,
      method:    opts.method    || null,
      success:   opts.success !== undefined ? opts.success : true,
      message:   opts.message   || '',
      ipAddress: opts.ipAddress || null,
      userAgent: opts.userAgent || null,
      meta:      opts.meta      || {},
    });
  } catch (err) {
    // Audit log must never crash the app
    console.error('[AuditLog] Failed to write:', err.message);
  }
};
