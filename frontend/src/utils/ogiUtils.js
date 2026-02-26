/**
 * OGI (Overall Growth Index) calculation and growth classification.
 * Used across Analytics, Leaderboard, and Student Insights.
 */

/** Default weights for weighted OGI (configurable in leaderboard) */
export const DEFAULT_OGI_WEIGHTS = {
  quizScore: 0.25,
  assignmentScore: 0.25,
  attendance: 0.25,
  completionRate: 0.15,
  submissionConsistency: 0.1,
};

/**
 * Compute OGI for a single student from 0–100 inputs.
 * @param {Object} params
 * @param {number} [params.quizAvg] - Average quiz score (0–100)
 * @param {number} [params.assignmentAvg] - Average assignment score (0–100)
 * @param {number} [params.attendancePct] - Attendance percentage (0–100)
 * @param {number} [params.completionRate] - Module/course completion % (0–100)
 * @param {number} [params.submissionConsistency] - Submission consistency % (0–100)
 * @param {Object} [params.weights] - Custom weights (same keys as DEFAULT_OGI_WEIGHTS)
 * @returns {number} OGI 0–100
 */
export function computeOGI({
  quizAvg = 0,
  assignmentAvg = 0,
  attendancePct = 0,
  completionRate = 0,
  submissionConsistency = 0,
  weights = DEFAULT_OGI_WEIGHTS,
}) {
  const w = { ...DEFAULT_OGI_WEIGHTS, ...weights };
  const score =
    (quizAvg || 0) * w.quizScore +
    (assignmentAvg || 0) * w.assignmentScore +
    (attendancePct || 0) * w.attendance +
    (completionRate || 0) * w.completionRate +
    (submissionConsistency || 0) * w.submissionConsistency;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Classify growth from OGI trend (current vs previous).
 * @param {number} currentOGI - Current OGI (0–100)
 * @param {number} [previousOGI] - Previous period OGI (optional)
 * @returns {'Excellent'|'Improving'|'Stable'|'Needs Attention'}
 */
export function getGrowthClassification(currentOGI, previousOGI = null) {
  if (currentOGI >= 80) return 'Excellent';
  if (currentOGI >= 60) {
    if (previousOGI != null && currentOGI > previousOGI) return 'Improving';
    return 'Stable';
  }
  return 'Needs Attention';
}

/**
 * Get badge color class for growth classification.
 * Green = High, Yellow = Moderate, Red = Needs Attention
 */
export function getGrowthBadgeColor(classification) {
  switch (classification) {
    case 'Excellent':
      return 'growth-excellent'; // green
    case 'Improving':
      return 'growth-improving'; // green
    case 'Stable':
      return 'growth-stable'; // yellow
    case 'Needs Attention':
      return 'growth-needs-attention'; // red
    default:
      return 'growth-stable';
  }
}

/**
 * Compute class-level OGI from array of student OGI values.
 */
export function computeClassOGI(studentOGIs) {
  if (!studentOGIs?.length) return 0;
  const sum = studentOGIs.reduce((a, b) => a + b, 0);
  return Math.round(sum / studentOGIs.length);
}

/**
 * Compute weighted performance score (alternative to OGI for leaderboard).
 * Same inputs as computeOGI but with custom weights.
 */
export function computeWeightedScore(params, weights = DEFAULT_OGI_WEIGHTS) {
  return computeOGI({ ...params, weights });
}
