import axe from 'axe-core';

export interface A11yAssertOptions {
  /** Rules to run. Defaults to WCAG 2.x A/AA rule sets. */
  runOnly?: string[];
  /** Disabled rule ids (optional). */
  disabledRules?: string[];
}

export interface A11yResult {
  violations: axe.Result[];
  passCount: number;
  incompleteCount: number;
}

/**
 * Runs axe-core against a DOM context (document or element) and returns the
 * violations limited to WCAG A/AA plus best-practice rules. Throws nothing —
 * callers assert on `violations`.
 */
export async function runA11yChecks(context: ParentNode = document, options: A11yAssertOptions = {}): Promise<A11yResult> {
  const runOnly = options.runOnly ?? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  const result = await axe.run(context as Element, {
    runOnly: { type: 'tag', values: runOnly },
    rules: options.disabledRules?.length ? { ...Object.fromEntries(options.disabledRules.map((id) => [id, { enabled: false }])) } : undefined,
  });
  return {
    violations: result.violations,
    passCount: result.passes.length,
    incompleteCount: result.incomplete.length,
  };
}

/** Collects a single-line summary of the violation node targets for diagnostics. */
export function violationSummary(violations: axe.Result[]): string {
  return violations
    .map((v) => `${v.id}: ${v.help ?? ''} (${v.nodes.length} node(s))`)
    .join('\n');
}
