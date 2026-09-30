export interface ProjectionMilestone {
  years: number;
  months: number;
  totalContributed: number;
  futureValue: number;
  wealthGained: number;
  label: string;
}

export interface ProjectionDataPoint {
  year: number;
  contributions: number;
  projectedValue: number;
  interestEarned: number;
}

export function calculateFutureValue(
  monthlySavings: number,
  annualRatePct: number,
  years: number
): number {
  if (monthlySavings <= 0 || years <= 0) return 0;
  const months = years * 12;

  if (annualRatePct <= 0) {
    return monthlySavings * months;
  }

  const monthlyRate = annualRatePct / 100 / 12;
  const fv = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return Math.round(fv);
}

export function generateProjectionSchedule(
  monthlySavings: number,
  annualRatePct: number,
  maxYears = 10
): {
  dataPoints: ProjectionDataPoint[];
  milestones: ProjectionMilestone[];
  disclaimer: string;
} {
  const dataPoints: ProjectionDataPoint[] = [];

  // Year 0
  dataPoints.push({
    year: 0,
    contributions: 0,
    projectedValue: 0,
    interestEarned: 0
  });

  for (let y = 1; y <= maxYears; y++) {
    const fv = calculateFutureValue(monthlySavings, annualRatePct, y);
    const contributions = monthlySavings * y * 12;
    dataPoints.push({
      year: y,
      contributions,
      projectedValue: fv,
      interestEarned: Math.max(0, fv - contributions)
    });
  }

  // Common milestones
  const milestoneYears = [1, 3, 5, 10].filter(y => y <= maxYears);
  const milestones: ProjectionMilestone[] = milestoneYears.map(y => {
    const fv = calculateFutureValue(monthlySavings, annualRatePct, y);
    const totalContributed = monthlySavings * y * 12;
    return {
      years: y,
      months: y * 12,
      totalContributed,
      futureValue: fv,
      wealthGained: Math.max(0, fv - totalContributed),
      label: `${y} ${y === 1 ? 'Year' : 'Years'}`
    };
  });

  return {
    dataPoints,
    milestones,
    disclaimer: "Illustrative projection based on an assumed annual return. Actual investment returns are not guaranteed. This is an educational calculator, not financial advice."
  };
}
