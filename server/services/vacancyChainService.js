/**
 * vacancyChainService.js — Real Graph + DFS Vacancy Engine
 * Part 5 upgrade: scoring now uses dynamic weights from ScoringConfig
 */
const OrgNode   = require('../models/OrgNode');
const User      = require('../models/User');
const OrgGraph  = require('./OrgGraph');
const scoringConfigService = require('./scoringConfigService');
const {
  calculateSkillMatch,
  calculateExpScore,
  calculateFinalScoreSync,
} = require('./scoringService');

// Build full org graph from DB
async function buildOrgGraph() {
  const allNodes = await OrgNode.find().populate('occupiedBy', 'name department skills experience performanceRating certifications');
  const graph = new OrgGraph();
  for (const node of allNodes) graph.addNode(node);
  for (const node of allNodes) {
    if (node.parentId) graph.addEdge(node.parentId, node._id);
  }
  return graph;
}

// Build scoring function using cached config weights
function buildScoringFn(allUsers, graph, weights) {
  return function scoreForNode(vacantNode) {
    const scored = [];
    for (const user of allUsers) {
      if (!user) continue;
      let currentNodeId = null;
      for (const [, node] of graph.nodes) {
        if (node.occupiedBy?._id?.toString() === user._id.toString()) {
          if (node.level >= vacantNode.level) currentNodeId = node._id.toString();
          break;
        }
      }
      const skillScore = calculateSkillMatch(user.skills || [], vacantNode.requiredSkills || []);
      const expScore   = calculateExpScore(user.experience || 0, vacantNode.minExperience || 0, true);
      const { finalScore, perfScore, certScore } = calculateFinalScoreSync(
        skillScore, expScore,
        user.performanceRating || 3,
        (user.certifications || []).length,
        weights
      );
      scored.push({
        userId: user._id, name: user.name, department: user.department,
        experience: user.experience, skills: user.skills,
        skillScore, expScore, perfScore: Math.round(perfScore),
        certScore: Math.round(certScore), finalScore, currentNodeId,
      });
    }
    return scored.sort((a, b) => b.finalScore - a.finalScore);
  };
}

exports.analyzeVacancyChain = async (promotedUserId, targetJobId) => {
  const Job = require('../models/Job');

  const [promotedUser, targetJob, config] = await Promise.all([
    User.findById(promotedUserId),
    Job.findById(targetJobId),
    scoringConfigService.getConfig(), // Part 5: load dynamic weights
  ]);

  if (!promotedUser) throw new Error('User not found');
  if (!targetJob)    throw new Error('Job not found');

  const graph    = await buildOrgGraph();
  const allUsers = await User.find({ _id: { $ne: promotedUserId }, role: 'employee' });

  // Pass config weights to scoring fn
  const weights = {
    skillWeight: config.skillWeight,
    expWeight:   config.expWeight,
    perfWeight:  config.perfWeight,
    certWeight:  config.certWeight,
  };

  let promotedNode = null;
  for (const [, node] of graph.nodes) {
    if (node.occupiedBy?._id?.toString() === promotedUserId.toString()) {
      promotedNode = node;
      break;
    }
  }

  const scoreFn = buildScoringFn(allUsers, graph, weights);
  let chain = [];

  if (promotedNode) {
    chain = graph.dfsVacancyChain(promotedNode._id, scoreFn, new Set(), 0, []);
  } else {
    const scored = scoreFn({
      _id: targetJob._id, title: targetJob.title,
      department: targetJob.department, level: 1,
      requiredSkills: targetJob.requiredSkills || [],
      minExperience:  targetJob.minExperience   || 0,
    });
    chain = [{
      depth: 0, nodeTitle: targetJob.title, department: targetJob.department,
      vacancy: `${targetJob.title} in ${targetJob.department} became vacant`,
      candidates: scored.slice(0, 5), bestCandidate: scored[0] || null,
      filled: scored.length > 0,
    }];
  }

  const chainDepth  = chain.length;
  const hasUnfilled = chain.some(s => !s.filled);
  const topScore    = chain[0]?.bestCandidate?.finalScore || 0;

  const riskLevel =
    hasUnfilled || topScore < 30 ? 'HIGH' :
    chainDepth >= 3 || topScore < 60 ? 'MEDIUM' : 'LOW';

  const recommendation =
    riskLevel === 'LOW'    ? 'Promotion Recommended — Strong replacement pipeline exists' :
    riskLevel === 'MEDIUM' ? 'Proceed with Caution — Training plan required for replacements' :
                             'High Risk — Deep cascade or no suitable replacement found';

  const chainAnalysis = {};
  chain.forEach((step, i) => {
    chainAnalysis[`step${i + 1}`] =
      step.filled
        ? `${step.vacancy} → Best fill: ${step.bestCandidate.name} (${step.bestCandidate.finalScore}% match)`
        : `${step.vacancy} → No suitable candidate found`;
  });
  chainAnalysis[`step${chain.length + 1}`] =
    `Chain depth: ${chainDepth} | Risk: ${riskLevel} | ${recommendation}`;

  const graphStats = graph.toJSON();
  const bestCandidate = chain[0]?.bestCandidate || null;

  return {
    promotedEmployee: {
      id: promotedUser._id, name: promotedUser.name,
      department: promotedUser.department, currentRole: promotedUser.role,
    },
    targetRole: targetJob.title, targetDepartment: targetJob.department,
    chain, chainDepth, chainAnalysis, riskLevel, recommendation,
    bestReplacement: bestCandidate ? {
      id: bestCandidate.userId, name: bestCandidate.name,
      department: bestCandidate.department,
      skillScore: bestCandidate.skillScore, expScore: bestCandidate.expScore,
      finalScore: bestCandidate.finalScore,
    } : null,
    replacementScore: bestCandidate?.finalScore || 0,
    allCandidates: (chain[0]?.candidates || []).slice(0, 10),
    graphStats: {
      totalNodes: graphStats.nodeCount,
      totalEdges: graphStats.edgeCount,
      graphBuilt: promotedNode !== null,
    },
    weightsUsed: weights,   // Part 5: show which weights were used
    complexity: {
      time:  'O(N + E) graph build + O(N×C) DFS scoring — N=nodes, E=edges, C=candidates',
      space: 'O(N + E) adjacency list + O(N) recursion stack',
    },
  };
};

exports.buildOrgGraph = buildOrgGraph;
