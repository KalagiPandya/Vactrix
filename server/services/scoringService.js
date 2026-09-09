/**
 * scoringService.js — Part 5: Configurable Scoring Engine
 *
 * UPGRADE from hardcoded weights → dynamic DB-driven weights.
 * Weights are loaded from ScoringConfig (cached) on every call.
 *
 * ALGORITHM 1: HashSet Skill Matching       O(n)
 * ALGORITHM 2: Experience Score             O(1)
 * ALGORITHM 3: Weighted Final Score         O(1) — weights from DB
 */
const scoringConfigService = require('./scoringConfigService');

// ── ALGORITHM 1: HashSet Skill Match ─────────────────────────────────
// O(n) — Set lookup vs O(n*m) nested loop
exports.calculateSkillMatch = (employeeSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 100;
  const skillSet  = new Set((employeeSkills || []).map(s => s.toLowerCase()));
  let matchCount  = 0;
  for (const skill of requiredSkills) {
    if (skillSet.has(skill.toLowerCase())) matchCount++;
  }
  return Math.round((matchCount / requiredSkills.length) * 100);
};

// ── ALGORITHM 2: Experience Score ────────────────────────────────────
exports.calculateExpScore = (empExp = 0, requiredExp = 0, isInternal = true) => {
  if (requiredExp === 0) return 100;
  const threshold = isInternal ? requiredExp * 0.8 : requiredExp;
  if (empExp >= requiredExp) return 100;
  if (empExp >= threshold)   return 80;
  return Math.round((empExp / requiredExp) * 100);
};

// ── ALGORITHM 3: Dynamic Weighted Final Score ─────────────────────────
// Reads weights from DB config (cached). No hardcoding.
exports.calculateFinalScore = async (skillMatch, expScore, perfRating, certCount) => {
  const config = await scoringConfigService.getConfig();

  const skillWeight = config.skillWeight / 100;
  const expWeight   = config.expWeight   / 100;
  const perfWeight  = config.perfWeight  / 100;
  const certWeight  = config.certWeight  / 100;

  // Convert raw values to 0–100 scale
  const perfScore = ((perfRating || 3) / 5) * 100;
  const certScore = Math.min((certCount || 0) * 20, 100);

  let finalScore;

  if (config.formulaType === 'geometric_mean') {
    // Geometric mean — penalizes low scores more than weighted sum
    const nonZero = s => Math.max(s, 1);
    finalScore = Math.round(
      Math.pow(
        Math.pow(nonZero(skillMatch), skillWeight) *
        Math.pow(nonZero(expScore),   expWeight)   *
        Math.pow(nonZero(perfScore),  perfWeight)  *
        Math.pow(nonZero(certScore),  certWeight),
        1
      )
    );
  } else if (config.formulaType === 'harmonic_mean') {
    // Harmonic mean — rewards balanced candidates
    const weights  = [skillWeight, expWeight, perfWeight, certWeight];
    const scores   = [skillMatch, expScore, perfScore, certScore].map(s => Math.max(s, 1));
    const weightedSum = weights.reduce((a, w, i) => a + (w / scores[i]), 0);
    finalScore = Math.round(1 / weightedSum);
  } else {
    // Default: weighted sum
    finalScore = Math.round(
      (skillMatch * skillWeight) +
      (expScore   * expWeight)   +
      (perfScore  * perfWeight)  +
      (certScore  * certWeight)
    );
  }

  // Apply bonus rules
  const bonusRules = config.bonusRules || {};
  let bonus = 0;
  if (skillMatch === 100 && bonusRules.perfectSkillMatchBonus) bonus += bonusRules.perfectSkillMatchBonus;

  finalScore = Math.min(100, finalScore + bonus);

  return {
    finalScore,
    perfScore: Math.round(perfScore),
    certScore: Math.round(certScore),
    // Include active weights in response so UI can show them
    weightsUsed: {
      skillWeight: config.skillWeight,
      expWeight:   config.expWeight,
      perfWeight:  config.perfWeight,
      certWeight:  config.certWeight,
      formulaType: config.formulaType,
    },
  };
};

// ── Sync version (uses cached/default weights — no await needed) ──────
// Used by DFS vacancy chain where async would complicate recursion
exports.calculateFinalScoreSync = (skillMatch, expScore, perfRating, certCount, weights = null) => {
  const w = weights || scoringConfigService.DEFAULT_CONFIG;
  const perfScore = ((perfRating || 3) / 5) * 100;
  const certScore = Math.min((certCount || 0) * 20, 100);
  const finalScore = Math.round(
    (skillMatch * (w.skillWeight / 100)) +
    (expScore   * (w.expWeight   / 100)) +
    (perfScore  * (w.perfWeight  / 100)) +
    (certScore  * (w.certWeight  / 100))
  );
  return { finalScore, perfScore: Math.round(perfScore), certScore: Math.round(certScore) };
};
