/**
 * scoringConfigService.js — Part 5
 *
 * Provides a cached, singleton scoring configuration.
 *
 * WHY CACHE?
 *   Every job application triggers scoring. Without cache that's
 *   a DB read per application. With cache: one DB read, then
 *   memory lookups until config changes.
 *
 * CACHE INVALIDATION:
 *   Cache is cleared whenever admin updates weights.
 *   Next scoring call triggers a fresh DB read.
 *
 * DEFAULT WEIGHTS (used if no config in DB yet):
 *   Skills: 40%, Experience: 30%, Performance: 20%, Certs: 10%
 */
const ScoringConfig = require('../models/ScoringConfig');

// In-memory cache
let cachedConfig = null;
let cacheTime    = null;
const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes max stale time

// Default config (fallback if DB empty)
const DEFAULT_CONFIG = {
  skillWeight: 40,
  expWeight:   30,
  perfWeight:  20,
  certWeight:  10,
  formulaType: 'weighted_sum',
  bonusRules: {
    internalCandidateBonus: 5,
    perfectSkillMatchBonus: 10,
    seniorExperienceBonus:  5,
  },
};

/**
 * getConfig — Returns active scoring config (cached)
 */
exports.getConfig = async () => {
  // Return cache if fresh
  if (cachedConfig && cacheTime && (Date.now() - cacheTime < CACHE_TTL)) {
    return cachedConfig;
  }

  try {
    let config = await ScoringConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      // Seed default config on first use
      config = await ScoringConfig.create(DEFAULT_CONFIG);
    }

    cachedConfig = config;
    cacheTime    = Date.now();
    return config;
  } catch (err) {
    console.error('[scoringConfigService] Failed to load config:', err.message);
    return DEFAULT_CONFIG;
  }
};

/**
 * updateConfig — Update weights + bust cache
 */
exports.updateConfig = async (updates, adminUserId) => {
  const { skillWeight, expWeight, perfWeight, certWeight, formulaType, bonusRules, note } = updates;

  // Validate weights sum to 100
  const total = (skillWeight || 0) + (expWeight || 0) + (perfWeight || 0) + (certWeight || 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Weights must sum to 100. Current sum: ${total}`);
  }

  let config = await ScoringConfig.findOne().sort({ createdAt: -1 });

  if (!config) {
    config = new ScoringConfig(DEFAULT_CONFIG);
  }

  const oldWeights = {
    skillWeight: config.skillWeight,
    expWeight:   config.expWeight,
    perfWeight:  config.perfWeight,
    certWeight:  config.certWeight,
  };

  // Apply updates
  config.skillWeight = skillWeight;
  config.expWeight   = expWeight;
  config.perfWeight  = perfWeight;
  config.certWeight  = certWeight;
  if (formulaType)  config.formulaType = formulaType;
  if (bonusRules)   config.bonusRules  = { ...config.bonusRules, ...bonusRules };
  config.updatedBy   = adminUserId;
  config.updatedAt   = new Date();
  config.version     = (config.version || 1) + 1;

  // Append to change log
  config.changeLog.push({
    version:   config.version,
    weights:   { skillWeight, expWeight, perfWeight, certWeight },
    changedBy: adminUserId,
    changedAt: new Date(),
    note:      note || 'Weights updated by admin',
  });

  await config.save();

  // Bust cache so next scoring uses new weights
  cachedConfig = null;
  cacheTime    = null;

  return config;
};

/**
 * bustCache — Force cache invalidation
 */
exports.bustCache = () => {
  cachedConfig = null;
  cacheTime    = null;
};

exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
