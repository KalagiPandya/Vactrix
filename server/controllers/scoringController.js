/**
 * scoringController.js — Part 5
 * Admin endpoints for configuring the scoring engine.
 */
const scoringConfigService = require('../services/scoringConfigService');
const auditLog             = require('../services/auditService');

// GET /api/scoring/config — get current config + history
exports.getConfig = async (req, res) => {
  try {
    const config = await scoringConfigService.getConfig();
    res.json({
      config: {
        skillWeight: config.skillWeight,
        expWeight:   config.expWeight,
        perfWeight:  config.perfWeight,
        certWeight:  config.certWeight,
        formulaType: config.formulaType,
        bonusRules:  config.bonusRules,
        version:     config.version,
        updatedAt:   config.updatedAt,
      },
      changeLog: (config.changeLog || []).slice(-10).reverse(),
      totalWeight: config.skillWeight + config.expWeight + config.perfWeight + config.certWeight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/scoring/config — update weights (admin only)
exports.updateConfig = async (req, res) => {
  try {
    const { skillWeight, expWeight, perfWeight, certWeight, formulaType, bonusRules, note } = req.body;

    const config = await scoringConfigService.updateConfig(
      { skillWeight, expWeight, perfWeight, certWeight, formulaType, bonusRules, note },
      req.user.userId
    );

    await auditLog.log({
      userId: req.user.userId, userRole: req.user.role,
      action: 'UPDATE_SCORING_CONFIG',
      resource: '/api/scoring/config', method: 'PUT', success: true,
      message: `Updated scoring weights: skill=${skillWeight}% exp=${expWeight}% perf=${perfWeight}% cert=${certWeight}%`,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      meta: { skillWeight, expWeight, perfWeight, certWeight, formulaType },
    });

    res.json({
      message: 'Scoring configuration updated successfully',
      config: {
        skillWeight: config.skillWeight,
        expWeight:   config.expWeight,
        perfWeight:  config.perfWeight,
        certWeight:  config.certWeight,
        formulaType: config.formulaType,
        bonusRules:  config.bonusRules,
        version:     config.version,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/scoring/preview — preview score with given weights (no save)
exports.previewScore = async (req, res) => {
  try {
    const { skillWeight, expWeight, perfWeight, certWeight, skillMatch, expScore, perfRating, certCount } = req.body;
    const total = skillWeight + expWeight + perfWeight + certWeight;
    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({ message: `Weights must sum to 100 (current: ${total})` });
    }

    const perfScore = ((perfRating || 3) / 5) * 100;
    const certScore = Math.min((certCount || 0) * 20, 100);

    const finalScore = Math.round(
      ((skillMatch || 0) * skillWeight / 100) +
      ((expScore   || 0) * expWeight   / 100) +
      (perfScore         * perfWeight  / 100) +
      (certScore         * certWeight  / 100)
    );

    res.json({
      preview: { skillMatch, expScore, perfScore: Math.round(perfScore), certScore: Math.round(certScore), finalScore },
      weights: { skillWeight, expWeight, perfWeight, certWeight },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scoring/formulas — list available formula types
exports.getFormulas = async (req, res) => {
  res.json({
    formulas: [
      { id: 'weighted_sum', label: 'Weighted Sum (default)', desc: 'Each factor multiplied by its weight and summed. Most predictable.' },
      { id: 'geometric_mean', label: 'Geometric Mean', desc: 'Penalizes extremely low scores in any factor. Rewards balanced candidates.' },
      { id: 'harmonic_mean', label: 'Harmonic Mean', desc: 'Strongly penalizes weak areas. Best for roles requiring all-round competence.' },
    ],
  });
};
