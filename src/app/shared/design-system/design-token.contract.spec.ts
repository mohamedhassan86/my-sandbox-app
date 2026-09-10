import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRAST_PAIRS,
  LITERAL_ALLOWED_FILES,
  SHIPPED_STYLE_ROOTS,
  TOKEN_FILES,
  contrastRatio,
  designSystemClasses,
  documentedClasses,
  documentedTokens,
  durationInMs,
  findColorLiterals,
  findRawSpacing,
  formatRatio,
  mergeTokens,
  numericTokenValue,
  parseCustomProperties,
  referencedTokens,
  resolveColor,
} from './design-token.contract';

const CONTRACT_DIR = 'specs/004-survey-design-system/contracts';
const TOKEN_CONTRACT = readFileSync(join(CONTRACT_DIR, 'design-tokens.md'), 'utf8');
const CLASS_CONTRACT = readFileSync(join(CONTRACT_DIR, 'css-classes.md'), 'utf8');

function stylesheetsIn(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...stylesheetsIn(path));
    } else if (entry.name.endsWith('.css')) {
      found.push(path);
    }
  }
  return found;
}

const SHIPPED_STYLESHEETS = SHIPPED_STYLE_ROOTS.flatMap((root) => stylesheetsIn(root)).sort();
const SHIPPED_CSS = SHIPPED_STYLESHEETS.map((path) => ({ path, css: readFileSync(path, 'utf8') }));

const TOKENS = mergeTokens(TOKEN_FILES.map((path) => readFileSync(path, 'utf8')));

/**
 * Component-scoped custom properties (for example the `--ds-btn-*` slots that let one button
 * block express several variants) are defined where they are used, so references are
 * resolved against the token layer plus every custom property shipped anywhere in the app.
 */
const AVAILABLE_PROPERTIES = new Set([
  ...TOKENS.keys(),
  ...SHIPPED_CSS.flatMap(({ css }) => [...parseCustomProperties(css).keys()]),
]);

/**
 * Documentation coverage supports `--ds-token-*` wildcards, which keep the contract readable
 * for token families (palette ramps, icon masks, layout steps).
 */
function documentedTokenCoverage(token: string, documented: readonly string[]): boolean {
  return documented.some((entry) =>
    entry.endsWith('-*') ? token.startsWith(entry.slice(0, -1)) : entry === token,
  );
}

describe('design system contract: token layer', () => {
  it('ships the token files in cascade order', () => {
    for (const path of TOKEN_FILES) {
      expect(() => readFileSync(path, 'utf8'), `${path} should exist`).not.toThrow();
    }
    expect(TOKENS.size).toBeGreaterThan(100);
  });

  it('resolves every var(--ds-*) reference used by the shipped stylesheets', () => {
    const unresolved: string[] = [];
    for (const { path, css } of SHIPPED_CSS) {
      for (const reference of referencedTokens(css)) {
        if (!AVAILABLE_PROPERTIES.has(reference)) {
          unresolved.push(`${path}: ${reference}`);
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it('keeps literal colour values inside the primitive token layer', () => {
    const violations: string[] = [];
    for (const { path, css } of SHIPPED_CSS) {
      if (LITERAL_ALLOWED_FILES.includes(path as (typeof LITERAL_ALLOWED_FILES)[number])) {
        continue;
      }
      const literals = findColorLiterals(css);
      if (literals.length > 0) {
        violations.push(`${path}: ${literals.join(', ')}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('uses spacing tokens instead of raw spacing lengths', () => {
    const violations: string[] = [];
    for (const { path, css } of SHIPPED_CSS) {
      const offenders = findRawSpacing(css);
      if (offenders.length > 0) {
        violations.push(`${path}: ${offenders.join(' | ')}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('documents every shipped token and removes stale documentation', () => {
    const documented = documentedTokens(TOKEN_CONTRACT);
    const undocumented = [...TOKENS.keys()].filter(
      (token) => !documentedTokenCoverage(token, documented),
    );
    const stale = documented.filter((entry) =>
      entry.endsWith('-*')
        ? ![...TOKENS.keys()].some((token) => token.startsWith(entry.slice(0, -1)))
        : !TOKENS.has(entry),
    );
    expect(undocumented).toEqual([]);
    expect(stale).toEqual([]);
  });

  it('documents every shipped design-system class and removes stale documentation', () => {
    const shippedClasses = new Set(SHIPPED_CSS.flatMap(({ css }) => designSystemClasses(css)));
    const documented = new Set(documentedClasses(CLASS_CONTRACT));
    const undocumented = [...shippedClasses].filter((name) => !documented.has(name)).sort();
    const stale = [...documented].filter((name) => !shippedClasses.has(name)).sort();
    expect(undocumented).toEqual([]);
    expect(stale).toEqual([]);
  });

  it('keeps the design-system scales ordered and on the 4px base', () => {
    const spacing = [...TOKENS.keys()]
      .filter((token) => /^--ds-space-(?!fluid)/.test(token))
      .map((token) => ({ token, value: numericTokenValue(TOKENS.get(token) ?? '') }))
      .filter((entry): entry is { token: string; value: number } => entry.value !== null);

    expect(spacing.length).toBeGreaterThan(8);
    for (let index = 1; index < spacing.length; index += 1) {
      expect(
        spacing[index].value,
        `${spacing[index].token} should follow ${spacing[index - 1].token}`,
      ).toBeGreaterThan(spacing[index - 1].value);
      expect(
        (spacing[index].value * 16) % 2,
        `${spacing[index].token} should sit on the 2px hairline grid`,
      ).toBe(0);
    }

    const radii = [...TOKENS.keys()]
      .filter((token) => /^--ds-radius-(?!pill)/.test(token))
      .map((token) => ({ token, value: numericTokenValue(TOKENS.get(token) ?? '') }))
      .filter((entry): entry is { token: string; value: number } => entry.value !== null);
    for (let index = 1; index < radii.length; index += 1) {
      expect(radii[index].value, `${radii[index].token} radius order`).toBeGreaterThan(
        radii[index - 1].value,
      );
    }

    const durations = [...TOKENS.keys()]
      .filter((token) => token.startsWith('--ds-duration-'))
      .map((token) => ({ token, value: durationInMs(TOKENS.get(token) ?? '') }))
      .filter((entry): entry is { token: string; value: number } => entry.value !== null);
    expect(durations).toHaveLength(5);
    for (let index = 1; index < durations.length; index += 1) {
      expect(durations[index].value, `${durations[index].token} duration order`).toBeGreaterThan(
        durations[index - 1].value,
      );
    }
  });

  it('keeps the type scale monotonic and body copy at 16px or larger', () => {
    const scaleOrder = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

    const maxima = scaleOrder.map((step) => {
      const value = TOKENS.get(`--ds-font-size-${step}`) ?? '';
      const clamp = /clamp\(([^)]+)\)/.exec(value);
      const size = clamp ? Number.parseFloat(clamp[1].split(',')[2]) : numericTokenValue(value);
      expect(size, `--ds-font-size-${step} should be a length`).not.toBeNull();
      return size as number;
    });

    for (let index = 1; index < maxima.length; index += 1) {
      expect(maxima[index], `--ds-font-size-${scaleOrder[index]} order`).toBeGreaterThan(
        maxima[index - 1],
      );
    }

    const bodySize = numericTokenValue(TOKENS.get('--ds-font-size-md') ?? '');
    expect(bodySize).not.toBeNull();
    expect((bodySize as number) * 16).toBeGreaterThanOrEqual(16);
  });

  it('meets the documented WCAG 2.1 contrast contract', () => {
    const failures: string[] = [];
    for (const pair of CONTRAST_PAIRS) {
      const foreground = resolveColor(pair.foreground, TOKENS);
      const background = resolveColor(pair.background, TOKENS);
      expect(foreground, `${pair.foreground} should resolve to a colour`).not.toBeNull();
      expect(background, `${pair.background} should resolve to a colour`).not.toBeNull();
      const ratio = contrastRatio(foreground as string, background as string);
      if (ratio < pair.minimum) {
        failures.push(
          `${pair.name}: ${formatRatio(ratio)} < ${pair.minimum}:1 (${pair.foreground} on ${pair.background})`,
        );
      }
    }
    expect(failures).toEqual([]);
  });

  it('documents the contrast pairs that the check enforces', () => {
    for (const pair of CONTRAST_PAIRS) {
      expect(TOKEN_CONTRACT, `${pair.foreground} should be documented`).toContain(pair.foreground);
    }
  });

  it('collapses every motion token when reduced motion is requested', () => {
    const a11y = readFileSync('src/styles/base/a11y.css', 'utf8');
    const block = /prefers-reduced-motion:\s*reduce[\s\S]*?\{([\s\S]*?)\n\}/.exec(a11y);
    expect(block, 'a prefers-reduced-motion: reduce block should exist').not.toBeNull();

    const reduced = block?.[1] ?? '';
    for (const token of ['instant', 'fast', 'base', 'slow', 'slower']) {
      expect(reduced, `--ds-duration-${token} should collapse`).toContain(
        `--ds-duration-${token}: 1ms`,
      );
    }
    expect(reduced).toContain('--ds-enter-distance: 0');
    expect(reduced).toContain('animation-duration: 1ms !important');
    expect(reduced).toContain('transition-duration: 1ms !important');
  });

  it('keeps animation on the compositor (opacity and transform only)', () => {
    const motion = readFileSync('src/styles/components/motion.css', 'utf8');
    const keyframes = [...motion.matchAll(/@keyframes[\s\S]*?\{([\s\S]*?)\n\}/g)].map(
      (match) => match[1],
    );
    expect(keyframes.length).toBeGreaterThan(2);
    for (const frame of keyframes) {
      for (const declaration of frame.match(/^\s+[a-z-]+:/gim) ?? []) {
        const property = declaration.trim().replace(':', '');
        expect(
          ['opacity', 'transform'],
          `@keyframes should only animate opacity/transform, found ${property}`,
        ).toContain(property);
      }
    }
  });

  it('themes library controls through the design tokens', () => {
    const primeng = readFileSync('src/styles/integrations/primeng.css', 'utf8');
    const mapped = [...primeng.matchAll(/--p-[a-z0-9-]+:\s*([^;]+);/g)].map((match) =>
      match[1].trim(),
    );
    expect(mapped.length).toBeGreaterThan(60);
    const literal = mapped.filter((value) => findColorLiterals(value).length > 0);
    expect(literal).toEqual([]);
    // Every mapped value is either a design token (possibly inside a calc) or a structural
    // keyword/number that carries no colour or size decision of its own.
    const structural = /^(none|transparent|solid|inherit|0|1px|[\d.]+%?)$/i;
    const unmapped = mapped.filter(
      (value) => !value.includes('var(--ds-') && !structural.test(value),
    );
    expect(unmapped).toEqual([]);
    expect(primeng).toContain('--p-select-');
    expect(primeng).toContain('--p-togglebutton-');
  });
});
