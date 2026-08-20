import type {
  JobMatchAssessment,
  JobMatchResult,
  RequirementCategory,
} from "@/lib/validations/resume-analysis";

const CATEGORY_WEIGHTS: Record<RequirementCategory, number> = {
  technical: 35,
  experience: 25,
  mandatory: 15,
  seniority: 10,
  language_location: 10,
  education: 5,
};

const STATUS_VALUES = {
  matched: 1,
  partial: 0.5,
  missing: 0,
} as const;

const IMPORTANCE_VALUES = {
  required: 2,
  preferred: 1,
} as const;

export function calculateJobMatch(
  assessment: JobMatchAssessment | null,
): JobMatchResult | null {
  if (!assessment || assessment.requirements.length === 0) return null;

  const activeCategories = Object.keys(CATEGORY_WEIGHTS).filter((category) =>
    assessment.requirements.some((item) => item.category === category),
  ) as RequirementCategory[];
  const activeWeight = activeCategories.reduce(
    (sum, category) => sum + CATEGORY_WEIGHTS[category],
    0,
  );

  const breakdown = activeCategories.map((category) => {
    const requirements = assessment.requirements.filter(
      (item) => item.category === category,
    );
    const possible = requirements.reduce(
      (sum, item) => sum + IMPORTANCE_VALUES[item.importance],
      0,
    );
    const earned = requirements.reduce(
      (sum, item) =>
        sum +
        STATUS_VALUES[item.status] * IMPORTANCE_VALUES[item.importance],
      0,
    );

    return {
      category,
      weight: Math.round((CATEGORY_WEIGHTS[category] / activeWeight) * 100),
      score: Math.round((earned / possible) * 100),
      requirements: requirements.length,
    };
  });

  const score = Math.round(
    breakdown.reduce(
      (sum, item) => sum + item.score * CATEGORY_WEIGHTS[item.category],
      0,
    ) / activeWeight,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    targetRole: assessment.targetRole,
    requirements: assessment.requirements,
    breakdown,
  };
}

