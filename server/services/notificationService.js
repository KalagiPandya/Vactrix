/**
 * notificationService.js
 * Central place that creates DB records AND fires Socket.IO events.
 * All controllers call this — never emit socket events directly.
 */
const Notification = require('../models/Notification');
const socketService = require('./socketService');

/**
 * createAndEmit — Save notification to DB + push in real-time
 * @param {Object} opts
 *   recipientId   — ObjectId of the user who receives it
 *   recipientRole — 'employee' | 'hr' | 'admin'
 *   type          — notification type string
 *   title         — short title
 *   message       — full message text
 *   link          — optional URL for click-through
 *   relatedApplication — optional Application ObjectId
 *   relatedJob         — optional Job ObjectId
 *   meta               — optional extra data
 */
exports.createAndEmit = async (opts) => {
  try {
    const notif = await Notification.create({
      recipientId:        opts.recipientId,
      recipientRole:      opts.recipientRole,
      type:               opts.type,
      title:              opts.title,
      message:            opts.message,
      link:               opts.link               || null,
      relatedApplication: opts.relatedApplication || null,
      relatedJob:         opts.relatedJob         || null,
      meta:               opts.meta               || {},
    });

    // Push in real-time if user is online
    socketService.emitToUser(opts.recipientId, 'notification', {
      _id:       notif._id,
      type:      notif.type,
      title:     notif.title,
      message:   notif.message,
      link:      notif.link,
      isRead:    false,
      createdAt: notif.createdAt,
    });

    return notif;
  } catch (err) {
    // Never crash the main request if notification fails
    console.error('[notificationService] createAndEmit error:', err.message);
    return null;
  }
};

/**
 * notifyHRTeam — Notify all HR + admin users
 */
exports.notifyHRTeam = async (opts) => {
  try {
    const User = require('../models/User');
    const hrUsers = await User.find({ role: { $in: ['hr', 'admin'] } }).select('_id role');
    await Promise.all(
      hrUsers.map(u =>
        exports.createAndEmit({ ...opts, recipientId: u._id, recipientRole: u.role })
      )
    );
  } catch (err) {
    console.error('[notificationService] notifyHRTeam error:', err.message);
  }
};

/**
 * notifyAdmins — Notify all admin users only
 */
exports.notifyAdmins = async (opts) => {
  try {
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map(u =>
        exports.createAndEmit({ ...opts, recipientId: u._id, recipientRole: 'admin' })
      )
    );
  } catch (err) {
    console.error('[notificationService] notifyAdmins error:', err.message);
  }
};
