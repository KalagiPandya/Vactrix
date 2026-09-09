const mongoose = require('mongoose');

/**
 * ScoringConfig — Part 5: Configurable Scoring Engine
 *
 * Stores the weight configuration for the candidate scoring formula.
 * Only ONE active config exists at a time (singleton pattern).
 * Admin can update weights — all future scoring uses the new values.
 *
 * Formula:
 *   finalScore = (skillScore  × skillWeight/100)
 *              + (expScore    × expWeight/100)
 *              + (perfScore   × perfWeight/100)
 *              + (certScore   × certWeight/100)
 *
 * Constraint: skillWeight + expWeight + perfWeight + certWeight === 100
 */
const scoringConfigSchema = new mongoose.Schema({
  // Weight for each scoring factor (must sum to 100)
  skillWeight: { type: Number, default: 40, min: 0, max: 100 },
  expWeight:   { type: Number, default: 30, min: 0, max: 100 },
  perfWeight:  { type: Number, default: 20, min: 0, max: 100 },
  certWeight:  { type: Number, default: 10, min: 0, max: 100 },

  // Formula customization — future support for custom formulas
  formulaType: {
    type: String,
    enum: ['weighted_sum', 'geometric_mean', 'harmonic_mean'],
    default: 'weighted_sum',
  },

  // Bonus rules — optional multipliers
  bonusRules: {
    internalCandidateBonus:  { type: Number, default: 5  }, // +5% for internal
    perfectSkillMatchBonus:  { type: Number, default: 10 }, // +10% if 100% skill match
    seniorExperienceBonus:   { type: Number, default: 5  }, // +5% if exp > 2× required
  },

  // Who last updated and when
  updatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  updatedAt:  { type: Date, default: Date.now },

  // Version tracking for audit trail
  version:    { type: Number, default: 1 },
  changeLog:  [{
    version:     Number,
    weights:     Object,
    changedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt:   { type: Date, default: Date.now },
    note:        String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('ScoringConfig', scoringConfigSchema);
