import assert from "node:assert/strict";
import test from "node:test";
import { calculateJobMatch } from "../lib/analysis/job-match.ts";
import type {
  JobMatchAssessment,
  RequirementCategory,
} from "../lib/validations/resume-analysis.ts";

type Requirement = JobMatchAssessment["requirements"][number];

function requirement(
  label: string,
  category: RequirementCategory,
  status: Requirement["status"],
  importance: Requirement["importance"] = "required",
): Requirement {
  return {
    requirement: label,
    category,
    importance,
    status,
    evidence: status === "missing" ? null : `Evidência para ${label}`,
    recommendation: status === "matched" ? null : `Melhorar ${label}`,
  };
}

function score(requirements: Requirement[]) {
  const result = calculateJobMatch({
    targetRole: "Software Engineer",
    requirements,
  });
  assert.ok(result);
  return result.score;
}

test("candidato que atende todos os requisitos recebe 100", () => {
  assert.equal(
    score([
      requirement("React", "technical", "matched"),
      requirement("5 anos", "experience", "matched"),
      requirement("Inglês B2", "language_location", "matched"),
      requirement("Licenciatura", "education", "matched", "preferred"),
    ]),
    100,
  );
});

test("candidato sem nenhuma evidência recebe 0", () => {
  assert.equal(
    score([
      requirement("React", "technical", "missing"),
      requirement("5 anos", "experience", "missing"),
      requirement("Inglês B2", "language_location", "missing"),
    ]),
    0,
  );
});

test("melhorar um requisito nunca reduz a pontuação", () => {
  const missing = score([
    requirement("React", "technical", "missing"),
    requirement("TypeScript", "technical", "matched"),
  ]);
  const partial = score([
    requirement("React", "technical", "partial"),
    requirement("TypeScript", "technical", "matched"),
  ]);
  const matched = score([
    requirement("React", "technical", "matched"),
    requirement("TypeScript", "technical", "matched"),
  ]);

  assert.ok(missing < partial);
  assert.ok(partial < matched);
});

test("requisito obrigatório influencia mais que requisito desejável", () => {
  const requiredMissing = score([
    requirement("React", "technical", "missing", "required"),
    requirement("Figma", "technical", "matched", "preferred"),
  ]);
  const preferredMissing = score([
    requirement("React", "technical", "matched", "required"),
    requirement("Figma", "technical", "missing", "preferred"),
  ]);

  assert.ok(requiredMissing < preferredMissing);
  assert.equal(requiredMissing, 33);
  assert.equal(preferredMissing, 67);
});

test("pesos são redistribuídos somente entre categorias presentes", () => {
  const result = calculateJobMatch({
    targetRole: "Frontend Developer",
    requirements: [
      requirement("React", "technical", "matched"),
      requirement("3 anos", "experience", "missing"),
    ],
  });

  assert.ok(result);
  assert.equal(result.score, 58);
  assert.deepEqual(
    result.breakdown.map(({ category, weight }) => ({ category, weight })),
    [
      { category: "technical", weight: 58 },
      { category: "experience", weight: 42 },
    ],
  );
});

test("casos calibrados permanecem em faixas coerentes", () => {
  const strongCandidate = score([
    requirement("React", "technical", "matched"),
    requirement("TypeScript", "technical", "matched"),
    requirement("Next.js", "technical", "partial", "preferred"),
    requirement("5 anos", "experience", "partial"),
    requirement("Senior", "seniority", "matched"),
    requirement("Inglês C1", "language_location", "matched"),
  ]);

  const mediumCandidate = score([
    requirement("React", "technical", "matched"),
    requirement("TypeScript", "technical", "partial"),
    requirement("Next.js", "technical", "missing", "preferred"),
    requirement("5 anos", "experience", "partial"),
    requirement("Senior", "seniority", "partial"),
    requirement("Inglês C1", "language_location", "missing"),
  ]);

  const weakCandidate = score([
    requirement("React", "technical", "partial"),
    requirement("TypeScript", "technical", "missing"),
    requirement("Next.js", "technical", "missing", "preferred"),
    requirement("5 anos", "experience", "missing"),
    requirement("Senior", "seniority", "missing"),
    requirement("Inglês C1", "language_location", "missing"),
  ]);

  assert.ok(strongCandidate >= 75 && strongCandidate <= 90);
  assert.ok(mediumCandidate >= 35 && mediumCandidate <= 65);
  assert.ok(weakCandidate >= 5 && weakCandidate <= 25);
  assert.ok(strongCandidate > mediumCandidate);
  assert.ok(mediumCandidate > weakCandidate);
});

test("score é determinístico para a mesma avaliação", () => {
  const input = [
    requirement("React", "technical", "matched"),
    requirement("TypeScript", "technical", "partial"),
    requirement("4 anos", "experience", "matched"),
  ];

  assert.equal(score(input), score(structuredClone(input)));
});
