/**
 * orgController.js
 * Handles the 3 new org graph API endpoints:
 *   GET  /api/org/graph              — full adjacency list graph
 *   GET  /api/org/vacancy-chain/:id  — DFS chain from any org node
 *   POST /api/org/simulate           — simulate a promotion scenario
 */

const OrgNode  = require('../models/OrgNode');
const User     = require('../models/User');
const { buildOrgGraph } = require('../services/vacancyChainService');
const {
  calculateSkillMatch,
  calculateExpScore,
  calculateFinalScore,
} = require('../services/scoringService');

// ── GET /api/org/graph ────────────────────────────────────────────────
// Returns the full organizational graph (nodes + edges + hierarchy)
exports.getOrganizationalGraph = async (req, res) => {
  try {
    const graph = await buildOrgGraph();
    const json  = graph.toJSON();

    // Build level-by-level structure for frontend tree rendering
    const departments = {};
    for (const node of json.nodes) {
      if (!departments[node.department]) departments[node.department] = [];
      departments[node.department].push(node);
    }

    // Sort each dept by level
    for (const dept in departments) {
      departments[dept].sort((a, b) => a.level - b.level);
    }

    res.json({
      graph: json,
      departments,
      summary: {
        totalNodes:    json.nodeCount,
        totalEdges:    json.edgeCount,
        departments:   Object.keys(departments).length,
        vacantNodes:   json.nodes.filter(n => n.isVacant).length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/org/vacancy-chain/:nodeId ───────────────────────────────
// Run DFS from a specific org node — returns full cascade chain
exports.getVacancyChain = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const graph = await buildOrgGraph();
    const node  = graph.getNode(nodeId);

    if (!node) {
      return res.status(404).json({ message: 'Org node not found' });
    }

    const allUsers = await User.find({ role: 'employee' });

    // Build scorer
    const scoreFn = (vacantNode) => {
      return allUsers.map(user => {
        const skillScore = calculateSkillMatch(user.skills || [], vacantNode.requiredSkills || []);
        const expScore   = calculateExpScore(user.experience || 0, vacantNode.minExperience || 0, true);
        const { finalScore, perfScore } = calculateFinalScore(
          skillScore, expScore, user.performanceRating || 3, (user.certifications || []).length
        );
        return {
          userId:     user._id,
          name:       user.name,
          department: user.department,
          skillScore, expScore,
          perfScore:  Math.round(perfScore),
          finalScore,
          currentNodeId: null,
        };
      }).sort((a, b) => b.finalScore - a.finalScore);
    };

    const chain = graph.dfsVacancyChain(nodeId, scoreFn, new Set(), 0, []);

    res.json({
      startNode: {
        id:         node._id,
        title:      node.title,
        department: node.department,
        level:      node.level,
      },
      chain,
      chainDepth: chain.length,
      complexity: {
        time:  'O(N+E) graph traversal where N=nodes, E=edges',
        space: 'O(N) recursion stack',
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/org/simulate ───────────────────────────────────────────
// Simulate a promotion — returns predicted full chain WITHOUT saving to DB
// Body: { userId, targetNodeId }
exports.simulatePromotion = async (req, res) => {
  try {
    const { userId, targetNodeId } = req.body;
    if (!userId || !targetNodeId) {
      return res.status(400).json({ message: 'userId and targetNodeId are required' });
    }

    const user       = await User.findById(userId);
    const targetNode = await OrgNode.findById(targetNodeId);

    if (!user)       return res.status(404).json({ message: 'User not found' });
    if (!targetNode) return res.status(404).json({ message: 'Target org node not found' });

    const graph    = await buildOrgGraph();
    const allUsers = await User.find({ role: 'employee', _id: { $ne: userId } });

    const scoreFn = (vacantNode) => {
      return allUsers.map(user => {
        const skillScore = calculateSkillMatch(user.skills || [], vacantNode.requiredSkills || []);
        const expScore   = calculateExpScore(user.experience || 0, vacantNode.minExperience || 0, true);
        const { finalScore, perfScore } = calculateFinalScore(
          skillScore, expScore, user.performanceRating || 3, (user.certifications || []).length
        );
        return {
          userId: user._id, name: user.name, department: user.department,
          skillScore, expScore, perfScore: Math.round(perfScore), finalScore,
          currentNodeId: null,
        };
      }).sort((a, b) => b.finalScore - a.finalScore);
    };

    // Find the user's current node
    let currentNode = null;
    for (const [, n] of graph.nodes) {
      if (n.occupiedBy?._id?.toString() === userId.toString()) {
        currentNode = n;
        break;
      }
    }

    // Run DFS from current node (it becomes vacant on promotion)
    const chain = currentNode
      ? graph.dfsVacancyChain(currentNode._id, scoreFn, new Set(), 0, [])
      : [];

    const riskLevel =
      chain.some(s => !s.filled) ? 'HIGH' :
      chain.length >= 3 ? 'MEDIUM' : 'LOW';

    res.json({
      simulation: true,
      user:       { id: user._id, name: user.name, department: user.department },
      targetNode: { id: targetNode._id, title: targetNode.title, department: targetNode.department },
      currentNode: currentNode ? { id: currentNode._id, title: currentNode.title } : null,
      chain,
      chainDepth: chain.length,
      riskLevel,
      recommendation:
        riskLevel === 'LOW'    ? 'Safe to promote' :
        riskLevel === 'MEDIUM' ? 'Manageable cascade — prepare replacements' :
                                 'High risk cascade — reconsider or hire externally',
      note: 'This is a simulation — no data was changed',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/org/nodes ───────────────────────────────────────────────
// List all org nodes (for admin/HR to manage the hierarchy)
exports.getOrgNodes = async (req, res) => {
  try {
    const nodes = await OrgNode.find()
      .populate('occupiedBy', 'name email department')
      .populate('parentId', 'title department')
      .sort({ department: 1, level: 1 });
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/org/nodes ──────────────────────────────────────────────
// Create an org node (admin only)
exports.createOrgNode = async (req, res) => {
  try {
    const { title, department, level, parentId, occupiedBy } = req.body;
    if (!title || !department || level === undefined) {
      return res.status(400).json({ message: 'title, department and level are required' });
    }
    const node = await OrgNode.create({ title, department, level, parentId: parentId || null, occupiedBy: occupiedBy || null });
    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
