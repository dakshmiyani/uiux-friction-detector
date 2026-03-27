/**
 * UX Score Calculator
 */

const CATEGORY_WEIGHTS = {
  usability: 0.3,
  accessibility: 0.3,
  performance: 0.2,
  design: 0.2
};

function calculateScores(issues) {
  const categoryScores = {
    usability: 100,
    accessibility: 100,
    performance: 100,
    design: 100
  };

  issues.forEach(issue => {
    if (categoryScores[issue.category] !== undefined) {
      categoryScores[issue.category] = Math.max(0, categoryScores[issue.category] - issue.score_impact);
    }
  });

  let overallScore = 0;
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    overallScore += categoryScores[category] * weight;
  }

  return {
    overall: Math.round(overallScore),
    categories: categoryScores
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculateScores };
}
