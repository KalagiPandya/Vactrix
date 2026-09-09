/**
 * socketService.js — Real-time notification engine
 *
 * HOW IT WORKS:
 *   1. When server starts, Socket.IO attaches to the HTTP server
 *   2. Each connected client sends their userId on connect
 *   3. Server maps userId → socket.id in a Map (online users registry)
 *   4. When an event fires (apply, approve, etc.) we look up the
 *      target user's socket and emit directly to them
 *   5. If user is offline, notification is only saved to DB (persistent)
 *      and delivered next time they load the app via REST
 *
 * EVENTS EMITTED:
 *   server → client:
 *     'notification'          — new notification object
 *     'notification_read'     — { notificationId } marked read
 *     'notifications_cleared' — all marked read
 *     'unread_count'          — { count } current unread count
 */

let io;

// userId (string) → Set of socket ids (user may have multiple tabs)
const onlineUsers = new Map();

exports.init = (httpServer) => {
  const { Server } = require('socket.io');

  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
    if (origin.endsWith('.vercel.app') || origin === 'https://vactrix.vercel.app') return true;
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
    return false;
  };

  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (isOriginAllowed(origin)) {
          cb(null, true);
        } else {
          cb(new Error('Socket CORS blocked'));
        }
      },
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client sends userId immediately after connecting
    socket.on('register', (userId) => {
      if (!userId) return;
      const uid = userId.toString();
      if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
      onlineUsers.get(uid).add(socket.id);
      socket.userId = uid;
      console.log(`Socket connected: user=${uid} socket=${socket.id} online=${onlineUsers.size}`);
    });

    // Client marks a notification as read
    socket.on('mark_read', async (notificationId) => {
      try {
        const Notification = require('../models/Notification');
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        socket.emit('notification_read', { notificationId });
      } catch (err) {
        console.error('Socket mark_read error:', err.message);
      }
    });

    // Client marks ALL as read
    socket.on('mark_all_read', async () => {
      try {
        if (!socket.userId) return;
        const Notification = require('../models/Notification');
        await Notification.updateMany({ recipientId: socket.userId, isRead: false }, { isRead: true });
        socket.emit('notifications_cleared');
      } catch (err) {
        console.error('Socket mark_all_read error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        const sockets = onlineUsers.get(socket.userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) onlineUsers.delete(socket.userId);
        }
      }
    });
  });

  return io;
};

// ── Emit to a specific user by userId ────────────────────────────────
exports.emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  const uid     = userId.toString();
  const sockets = onlineUsers.get(uid);
  if (sockets && sockets.size > 0) {
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

// ── Emit to all HR users online ───────────────────────────────────────
exports.emitToRole = async (role, event, data) => {
  if (!io) return;
  try {
    const User = require('../models/User');
    const users = await User.find({ role }).select('_id');
    users.forEach(u => exports.emitToUser(u._id, event, data));
  } catch (err) {
    console.error('emitToRole error:', err.message);
  }
};

exports.getIO       = () => io;
exports.getOnlineUsers = () => onlineUsers;
