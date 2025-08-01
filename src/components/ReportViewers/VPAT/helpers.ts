import { AxeResult, AxeResultWithStoryId } from "src/components/ReportViewer";
import { WCAGRuleLink } from "src/hooks/useReportServer";
import { ScanResult, StoryScanResult } from "src/server/runScan";

export type ResultsByImpact = {
  critical: AxeResultWithStoryId[];
  serious: AxeResultWithStoryId[];
  moderate: AxeResultWithStoryId[];
  minor: AxeResultWithStoryId[];
};

export function getResultsByImpact(
  results: AxeResultWithStoryId[],
): ResultsByImpact {
  return [...results].reduce<ResultsByImpact>(
    (acc, result) => {
      acc[result.impact].push(result);
      return acc;
    },
    {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    },
  );
}
export function getRuleConformanceLevel(
  rule: WCAGRuleLink,
  report: ScanResult,
): "No Violations Found" | "Partially Supports" | "Does Not Support" {
  const ruleResults = report.results.reduce((acc, story) => {
    const violations = story.violations.filter((violation) =>
      violation.tags.includes(rule.ruleTag),
    );
    if (violations.length > 0) {
      acc.push({
        violations,
        storyId: story.meta.storyId,
      });
    }
    return acc;
  }, []);

  if (ruleResults.length === 0) {
    return "No Violations Found";
  } else {
    for (const result of ruleResults) {
      const impactCount = getResultsByImpact(result.violations);
      if (
        impactCount.critical.length === 0 &&
        impactCount.serious.length === 0
      ) {
        if (
          impactCount.moderate.length === 0 &&
          impactCount.minor.length === 0
        ) {
          return "No Violations Found";
        }
        return "Partially Supports";
      }

      return "Does Not Support";
    }
  }
}
export function getResultsByTag(
  report: ScanResult,
  tag: string,
  type: "violations" | "incomplete" | "inapplicable",
): AxeResultWithStoryId[] {
  const resultsWithTag = [
    ...report.results.filter((story) => {
      return story.violations.some((violation) => violation.tags.includes(tag));
    }),
  ];

  let results: AxeResultWithStoryId[] = [];

  resultsWithTag.forEach((story) => {
    const violations = [
      ...story[type].filter((violation) => violation.tags.includes(tag)),
    ].map((v) => ({
      ...v,
      storyId: story.meta.storyId,
    }));

    results = results.concat(violations as AxeResultWithStoryId[]);
  });

  return results;
}
