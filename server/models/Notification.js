const mongoose = require('mongoose');

/**
 * Notification Model
 * Stores persistent notification history in DB.
 * Real-time delivery handled by Socket.IO.
 * DB ensures notifications survive page refreshes and reconnections.
 */
const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientRole: { type: String, enum: ['employee', 'hr', 'admin'], required: true },

  // Notification type — maps to specific event
  type: {
    type: String,
    enum: [
      'application_submitted',   // employee applied → HR notified
      'application_shortlisted', // HR shortlisted → employee notified
      'application_rejected',    // HR rejected    → employee notified
      'application_approved',    // promotion approved → employee + admin notified
      'promotion_approved',      // admin-specific promotion event
      'new_job_posted',          // HR posted job → employees notified
      'system',                  // general system message
    ],
    required: true,
  },

  title:   { type: String, required: true },
  message: { type: String, required: true },

  // Optional link to navigate to on click
  link: { type: String, default: null },

  // Related entity references
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  relatedJob:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',         default: null },

  isRead: { type: Boolean, default: false },

  // Metadata for display
  meta: { type: Object, default: {} },

}, { timestamps: true });

// Indexes for fast queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
