import assert from "node:assert/strict";
import test from "node:test";
import { classifyAnalysisError, getSafeAnalysisErrorDetails } from "@/lib/ai/analyze-resume";

test("classifica rate limit encapsulado em erro de repetição", () => {
  const error = Object.assign(new Error("Failed after 2 attempts"), {
    name: "AI_RetryError",
    lastError: {
      statusCode: 429,
      message: "Too Many Requests",
    },
  });

  assert.equal(classifyAnalysisError(error), "rate_limit");
  assert.deepEqual(getSafeAnalysisErrorDetails(error), {
    name: "AI_RetryError",
    status: 429,
  });
});

test("classifica saída inválida encapsulada pelo SDK", () => {
  const error = Object.assign(new Error("Failed after generation"), {
    lastError: {
      statusCode: 400,
      responseBody: "tool_use_failed: output did not match schema",
    },
  });

  assert.equal(classifyAnalysisError(error), "invalid_output");
});
