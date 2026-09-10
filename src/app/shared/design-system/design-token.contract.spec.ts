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
const UI_SIZE_CONTRACT = readFileSync(
  'specs/005-dropdown-menu-sizing/contracts/ui-sizes.md',
  'utf8',
);
// 006-survey-dock-brand documents its token delta alongside the 004 contract; the check
// merges both files so each feature keeps its own acceptance baseline.
const BRAND_DELTA_CONTRACT = readFileSync(
  'specs/006-survey-dock-brand/contracts/brand-delta.md',
  'utf8',
);
const SHELL_SIZE_CONTRACT = readFileSync(
  'specs/006-survey-dock-brand/contracts/shell-sizes.md',
  'utf8',
);
// 007-desktop-design-enhancement documents its desktop-chrome delta; the check merges it
// the same way so each feature keeps its own acceptance baseline.
const DESKTOP_CHROME_CONTRACT = readFileSync(
  'specs/007-desktop-design-enhancement/contracts/desktop-chrome.md',
  'utf8',
);
const MERGED_TOKEN_DOCS = `${TOKEN_CONTRACT}\n${BRAND_DELTA_CONTRACT}\n${DESKTOP_CHROME_CONTRACT}`;

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
    const documented = documentedTokens(MERGED_TOKEN_DOCS);
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
      expect(MERGED_TOKEN_DOCS, `${pair.foreground} should be documented`).toContain(
        pair.foreground,
      );
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

/**
 * Survey answer geometry contract — see
 * `specs/005-dropdown-menu-sizing/contracts/ui-sizes.md` for the documented heights and
 * widths this block enforces. The numbers are documentation; what the check protects is
 * that the sizes are token-driven, that the dropdown panel stays attached to its field,
 * that an open panel layers above sibling cards, and that the panel and list stay bounded.
 */
const SIZE_TOKENS = [
  '--ds-control-height',
  '--ds-select-list-max-height',
  '--ds-select-panel-max-height',
  '--ds-select-option-min-height',
  '--ds-z-active-card',
] as const;

/** Flattens a stylesheet into `{ selectors, declarations }` rules (ignores nesting/comments). */
function flatRules(css: string): { selectors: string; declarations: string }[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1].trim().replace(/\s+/g, ' '),
    declarations: match[2].replace(/\s+/g, ' ').trim(),
  }));
}

const PRIMENG_CSS = readFileSync('src/styles/integrations/primeng.css', 'utf8');
const COMPAT_CSS = readFileSync('src/styles/compat.css', 'utf8');
const PRIMENG_RULES = flatRules(PRIMENG_CSS);
const COMPAT_RULES = flatRules(COMPAT_CSS);

function rulesMatching(selectors: RegExp): { selectors: string; declarations: string }[] {
  return PRIMENG_RULES.filter((rule) => selectors.test(rule.selectors));
}

describe('design system contract: survey answer geometry', () => {
  it('ships the size tokens that drive every question surface', () => {
    for (const token of SIZE_TOKENS) {
      expect(TOKENS.has(token), `${token} should be defined in the token layer`).toBe(true);
    }
  });

  it('documents every size token in the size and token contracts', () => {
    const documented = documentedTokens(TOKEN_CONTRACT);
    for (const token of SIZE_TOKENS) {
      expect(UI_SIZE_CONTRACT, `${token} should appear in the size contract`).toContain(token);
      expect(
        documentedTokenCoverage(token, documented),
        `${token} should appear in the token contract`,
      ).toBe(true);
    }
    // The contract is only a contract if it states the measured values for the documented
    // reference viewports.
    for (const viewport of ['320', '375', '768', '1280', '1440']) {
      expect(UI_SIZE_CONTRACT, `viewport ${viewport} should be documented`).toContain(viewport);
    }
  });

  it('derives one control height from the same steps the text input uses', () => {
    const controlHeight = TOKENS.get('--ds-control-height') ?? '';
    for (const step of ['--ds-space-sm', '--ds-line-height-normal', '--ds-font-size-lg', 'calc(']) {
      expect(controlHeight, `--ds-control-height should be derived from ${step}`).toContain(step);
    }
    const formControl = COMPAT_RULES.find((rule) =>
      rule.selectors.split(',').some((selector) => selector.trim() === '.form-control'),
    );
    expect(formControl, '.form-control should be styled').toBeDefined();
    for (const step of [
      'var(--ds-space-sm)',
      'var(--ds-font-size-lg)',
      'var(--ds-line-height-normal)',
    ]) {
      expect(
        formControl?.declarations,
        `.form-control should use ${step}, the same step the control height contract uses`,
      ).toContain(step);
    }
  });

  it('sizes the select field, its label, and its option rows from tokens', () => {
    const selectRules = rulesMatching(/^\.p-select(?![\w-])/);
    expect(selectRules.length, 'the select field should be styled').toBeGreaterThan(0);
    const selectField = selectRules.find((rule) => rule.selectors === '.p-select');
    expect(selectField?.declarations).toContain('min-height: var(--ds-control-height)');
    expect(selectField?.declarations).not.toMatch(/\d+px/);

    const overlayRules = rulesMatching(/^\.p-select-overlay/);
    expect(overlayRules.length, 'the option panel should be styled').toBeGreaterThan(0);
    const sizedByTokens = overlayRules.some(
      (rule) =>
        rule.declarations.includes('max-height:') &&
        rule.declarations.includes('var(--ds-select-panel-max-height)'),
    );
    expect(sizedByTokens, 'the panel ceiling should come from --ds-select-panel-max-height').toBe(
      true,
    );
    const optionRow = overlayRules.find((rule) =>
      rule.declarations.includes('min-height: var(--ds-select-option-min-height)'),
    );
    expect(optionRow, 'option rows should use --ds-select-option-min-height').toBeDefined();

    // No literal size may decide the geometry of the select surfaces.
    const literalSizes = [...selectRules, ...overlayRules].flatMap(
      (rule) => rule.declarations.match(/\d+(?:\.\d+)?(?:px|rem|em|vw|vh)/g) ?? [],
    );
    expect(literalSizes, 'select surfaces should be sized by tokens only').toEqual([]);
  });

  it('keeps the option panel attached to its field while it is open', () => {
    const placed = PRIMENG_RULES.find((rule) =>
      rule.selectors.includes('.p-select-overlay.p-component-overlay.p-component'),
    );
    expect(
      placed,
      'the panel needs an explicit rule to override the library overlay default placement',
    ).toBeDefined();
    expect(placed?.declarations).toContain('position: absolute');
    expect(placed?.declarations).toContain('top: 0');
  });

  it('can flip the option panel above its field when there is no room below', () => {
    const above = PRIMENG_RULES.find(
      (rule) =>
        rule.selectors.includes('.panel-above') && rule.selectors.includes('.p-select-overlay'),
    );
    expect(
      above,
      'the upwards placement needs a selector the component can switch on',
    ).toBeDefined();
    expect(above?.declarations).toContain('bottom: 100%');
    expect(above?.declarations).toContain('top: auto');
    const component = readFileSync(
      'src/app/survey/components/dropdown-question/dropdown-question.ts',
      'utf8',
    );
    expect(component).toContain('[class.panel-above]');
    expect(component).toContain('shouldOpenAbove');
  });

  it('lifts the card that owns an open option panel above its siblings', () => {
    const active = COMPAT_RULES.find((rule) => rule.selectors.includes(':has(.p-select-overlay)'));
    expect(active, 'the open-panel card needs an explicit z-index').toBeDefined();
    expect(active?.declarations).toContain('z-index: var(--ds-z-active-card)');
  });

  it('passes the option-list viewport token to the dropdown control, never a literal', () => {
    const component = readFileSync(
      'src/app/survey/components/dropdown-question/dropdown-question.ts',
      'utf8',
    );
    const placement = readFileSync(
      'src/app/survey/components/dropdown-question/dropdown-panel-placement.ts',
      'utf8',
    );
    expect(placement).toContain('var(--ds-select-list-max-height)');
    expect(component).toContain('[scrollHeight]="listViewport()"');
    expect(component).not.toMatch(/scrollHeight[^\n]*\d+px/);
    // The measured viewport height may only lower the token ceiling, never replace it.
    expect(component).toContain('[style.--ds-select-available-height]');
    const overlayCeiling = rulesMatching(/^\.p-select-overlay/).find((rule) =>
      rule.declarations.includes('max-height:'),
    );
    expect(overlayCeiling?.declarations).toContain('var(--ds-select-available-height');
  });
});

/**
 * Survey dock shell geometry contract — see
 * `specs/006-survey-dock-brand/contracts/shell-sizes.md` for the rules (R-01…R-12) and
 * `specs/006-survey-dock-brand/contracts/brand-delta.md` for the tokens that drive them.
 * Like the 005 geometry block, the check protects token discipline (tokens exist, are
 * documented, and drive the shell surfaces); the ruler values in the contract are verified
 * by the quickstart review pass.
 */
const SHELL_TOKENS = [
  '--ds-dock-width',
  '--ds-dock-rail-width',
  '--ds-drawer-width',
  '--ds-ring-size',
  '--ds-topbar-height',
  '--ds-toast-duration',
] as const;

const SHELL_CSS_PATH = 'src/app/survey/survey-shell.css';
// The ring and step rules live in the navigation component's scoped stylesheet (view
// encapsulation keeps view styles out of child templates), so both files are shell.
const SHELL_SCAN_PATHS = [
  SHELL_CSS_PATH,
  'src/app/survey/components/survey-navigation/survey-navigation.css',
] as const;

function readShellCss(): string {
  return SHELL_SCAN_PATHS.map((path) => readFileSync(path, 'utf8')).join('\n');
}

describe('design system contract: survey dock shell', () => {
  it('ships the shell tokens that drive the dock, drawer, topbar, ring, and toast', () => {
    for (const token of SHELL_TOKENS) {
      expect(TOKENS.has(token), `${token} should be defined in the token layer`).toBe(true);
    }
  });

  it('documents every shell token in the shell-size and merged token contracts', () => {
    const documented = documentedTokens(MERGED_TOKEN_DOCS);
    for (const token of SHELL_TOKENS) {
      expect(SHELL_SIZE_CONTRACT, `${token} should appear in the shell-size contract`).toContain(
        token,
      );
      expect(
        documentedTokenCoverage(token, documented),
        `${token} should appear in the merged token contract`,
      ).toBe(true);
    }
  });

  it('caps the mobile drawer at 88% of the viewport', () => {
    const drawer = TOKENS.get('--ds-drawer-width') ?? '';
    expect(drawer, '--ds-drawer-width should carry the 88vw ceiling').toContain('88vw');
  });

  it('drives the shell surfaces from the shell tokens, never literals', () => {
    const css = readShellCss();
    const referenced = referencedTokens(css);
    for (const token of [
      '--ds-dock-width',
      '--ds-dock-rail-width',
      '--ds-drawer-width',
      '--ds-ring-size',
      '--ds-topbar-height',
    ] as const) {
      expect(referenced, `shell stylesheets should reference ${token}`).toContain(token);
    }
    // No literal length may decide the width/height of a dock, drawer, topbar, ring, or
    // toast surface: every such declaration is a token, or a neutral 0/auto/100%.
    const offenders: string[] = [];
    for (const rule of flatRules(css)) {
      if (
        !/dock|drawer|topbar|ring|toast|mobile-pills|progress-card|survey-card|page-step|step-/i.test(
          rule.selectors,
        )
      ) {
        continue;
      }
      for (const declaration of rule.declarations.match(
        // The lookbehind keeps `stroke-width` / `border-width` out of the sizing rule.
        /(?<![\w-])(?:min-|max-)?(?:width|height)\s*:\s*[^;{]+/g,
      ) ?? []) {
        const value = declaration.replace(/^[^:]+:\s*/, '').trim();
        const neutral = /^(0|auto|100%|none)$/.test(value);
        if (!neutral && !value.includes('var(')) {
          offenders.push(`${rule.selectors} { ${declaration.trim()} }`);
        }
      }
    }
    expect(offenders, 'shell surfaces should be sized by tokens only').toEqual([]);
  });
});

/**
 * Desktop chrome contract (007) — see
 * `specs/007-desktop-design-enhancement/contracts/desktop-chrome.md`. New chrome composes
 * existing color roles, so the block protects that the 007 assets exist, that they are
 * documented in the feature's own contract, and that the contract stays merged into the
 * token-documentation baseline.
 */
const DESKTOP_CHROME_TOKENS = [
  '--ds-pattern-sparkle-lg',
  '--ds-pattern-sparkle-sm',
  '--ds-dock-texture-opacity',
  '--ds-icon-lock',
  '--ds-icon-steps',
] as const;

describe('design system contract: desktop chrome (007)', () => {
  it('ships the sparkle texture and glyph assets', () => {
    for (const token of DESKTOP_CHROME_TOKENS) {
      expect(TOKENS.has(token), `${token} should be defined in the token layer`).toBe(true);
    }
  });

  it('documents every desktop-chrome token in the 007 contract', () => {
    for (const token of DESKTOP_CHROME_TOKENS) {
      expect(DESKTOP_CHROME_CONTRACT, `${token} should appear in the 007 contract`).toContain(
        token,
      );
    }
  });

  it('documents the desktop-chrome copy-string slots in the 007 contract', () => {
    for (const anchor of [
      'Survey steps',
      'Private & secure',
      'Maroon • Gold • Cream Theme',
      'Dock Navigation Edition',
      'survey.dock.mode',
    ]) {
      expect(DESKTOP_CHROME_CONTRACT, `${anchor} should be documented`).toContain(anchor);
    }
  });

  it('reuses already-verified contrast pairs for every new chrome surface', () => {
    // No CONTRAST_PAIRS entries are added by 007: each surface cites an existing pair in
    // the contract's §4, which must stay empty of new enforcement rows.
    expect(
      DESKTOP_CHROME_CONTRACT,
      'the 007 contract should state that its pairs reuse the existing matrix',
    ).toContain('no new pairs were added');
    expect(MERGED_TOKEN_DOCS).toContain('--ds-color-accent-on-dark');
    expect(MERGED_TOKEN_DOCS).toContain('--ds-color-text-muted-on-dock');
    expect(MERGED_TOKEN_DOCS).toContain('--ds-color-text-on-primary');
  });
});
