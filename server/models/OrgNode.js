const mongoose = require('mongoose');

/**
 * OrgNode — Organizational Hierarchy Node
 *
 * Represents one "role/position" in the company org chart.
 * This is a GRAPH NODE. Each node has:
 *   - a role title
 *   - a department
 *   - a level (0=CEO, 1=VP, 2=Manager, 3=Senior, 4=Junior …)
 *   - parentId → the role ABOVE this one (who this role reports to)
 *   - children  → roles that report to this node (populated via parentId refs)
 *   - occupiedBy → the User currently in this role (null = vacant)
 *
 * Together all OrgNodes form a directed acyclic graph (tree per department).
 * DFS traverses this graph downwards from any vacated node.
 */
const orgNodeSchema = new mongoose.Schema({
  title:      { type: String, required: true },       // e.g. "Senior Developer"
  department: { type: String, required: true },       // e.g. "Engineering"
  level:      { type: Number, required: true },       // 0 = top, higher = junior

  // Graph edge — parent node (who this role reports to)
  parentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'OrgNode', default: null },

  // Who currently occupies this role (null = vacant)
  occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Is this position currently vacant?
  isVacant:   { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast graph traversal queries
orgNodeSchema.index({ department: 1, level: 1 });
orgNodeSchema.index({ parentId: 1 });

module.exports = mongoose.model('OrgNode', orgNodeSchema);
