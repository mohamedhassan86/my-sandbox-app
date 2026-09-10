/**
 * Design-system contract helpers.
 *
 * These are pure functions (no Angular, no rendering) that let the contract check verify the
 * shipped stylesheets: that every `var(--ds-*)` reference resolves, that literal values stay
 * inside the primitive layer, that the scales obey their rules, and that every documented
 * text/background pair meets WCAG 2.1 AA.
 *
 * See `specs/004-survey-design-system/contracts/design-tokens.md` for the contract itself.
 */

export type TokenMap = ReadonlyMap<string, string>;

export interface ContrastPair {
  /** Human-readable name used in failure messages. */
  readonly name: string;
  /** Foreground token, e.g. `--ds-color-text`. */
  readonly foreground: string;
  /** Background token, e.g. `--ds-color-surface`. */
  readonly background: string;
  /** Minimum WCAG 2.1 contrast ratio. */
  readonly minimum: number;
}

/** Token files in cascade order; later files may reference earlier ones. */
export const TOKEN_FILES = [
  'src/styles/tokens/primitives.css',
  'src/styles/tokens/semantic.css',
  'src/styles/tokens/typography.css',
  'src/styles/tokens/space.css',
  'src/styles/tokens/icons.css',
] as const;

/** Files that are allowed to contain literal colour values (tokens only). */
export const LITERAL_ALLOWED_FILES = ['src/styles/tokens/primitives.css'] as const;

/** Directories whose stylesheets are part of the shipped design system. */
export const SHIPPED_STYLE_ROOTS = ['src/styles', 'src/app'] as const;

/**
 * Documented contrast contract. Every pair here is also listed in
 * `contracts/design-tokens.md`; the check fails if a pair is added in one place only.
 */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  {
    name: 'body text on surface',
    foreground: '--ds-color-text',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'body text on muted surface',
    foreground: '--ds-color-text',
    background: '--ds-color-surface-muted',
    minimum: 4.5,
  },
  {
    name: 'secondary text on surface',
    foreground: '--ds-color-text-secondary',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'muted text on surface',
    foreground: '--ds-color-text-muted',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'muted text on muted surface',
    foreground: '--ds-color-text-muted',
    background: '--ds-color-surface-muted',
    minimum: 4.5,
  },
  {
    name: 'subtle text on surface (large text only)',
    foreground: '--ds-color-text-subtle',
    background: '--ds-color-surface',
    minimum: 3,
  },
  {
    name: 'primary brand text on surface',
    foreground: '--ds-color-primary',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'selection text on surface',
    foreground: '--ds-color-selection',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'success text on surface',
    foreground: '--ds-color-success',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'warning text on surface',
    foreground: '--ds-color-warning',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'danger text on surface',
    foreground: '--ds-color-danger',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'danger text on danger tint',
    foreground: '--ds-color-danger-strong',
    background: '--ds-color-danger-soft',
    minimum: 4.5,
  },
  {
    name: 'success text on success tint',
    foreground: '--ds-color-success',
    background: '--ds-color-success-soft',
    minimum: 4.5,
  },
  {
    name: 'warning text on warning tint',
    foreground: '--ds-color-warning',
    background: '--ds-color-warning-soft',
    minimum: 4.5,
  },
  {
    name: 'text on canvas',
    foreground: '--ds-color-text-on-canvas',
    background: '--ds-color-canvas',
    minimum: 4.5,
  },
  {
    name: 'muted text on canvas',
    foreground: '--ds-color-text-muted-on-canvas',
    background: '--ds-color-canvas',
    minimum: 4.5,
  },
  {
    name: 'primary brand text on canvas',
    foreground: '--ds-color-primary',
    background: '--ds-color-canvas',
    minimum: 4.5,
  },
  {
    name: 'text on primary fill',
    foreground: '--ds-color-text-on-primary',
    background: '--ds-color-primary',
    minimum: 4.5,
  },
  {
    name: 'text on selection fill',
    foreground: '--ds-color-text-on-selection',
    background: '--ds-color-selection',
    minimum: 4.5,
  },
  {
    name: 'text on success fill',
    foreground: '--ds-color-text-on-success',
    background: '--ds-color-success',
    minimum: 4.5,
  },
  {
    name: 'text on danger fill',
    foreground: '--ds-color-text-on-danger',
    background: '--ds-color-danger',
    minimum: 4.5,
  },
  {
    name: 'interactive border on surface',
    foreground: '--ds-color-border-interactive',
    background: '--ds-color-surface',
    minimum: 3,
  },
  {
    name: 'selection fill on surface (selected state)',
    foreground: '--ds-color-selection',
    background: '--ds-color-surface',
    minimum: 3,
  },
  {
    name: 'selection fill on muted surface (selected tile)',
    foreground: '--ds-color-selection',
    background: '--ds-color-surface-muted',
    minimum: 3,
  },
  {
    name: 'focus ring on surface',
    foreground: '--ds-color-focus-ring-core',
    background: '--ds-color-surface',
    minimum: 3,
  },
  {
    name: 'focus ring on canvas',
    foreground: '--ds-color-focus-ring-core',
    background: '--ds-color-canvas',
    minimum: 3,
  },
  // --- 006-survey-dock-brand delta (see specs/006-survey-dock-brand/contracts/brand-delta.md §5) ---
  {
    name: 'dock primary text',
    foreground: '--ds-color-text-on-dock',
    background: '--ds-color-surface-dock',
    minimum: 4.5,
  },
  {
    name: 'dock gold labels',
    foreground: '--ds-color-accent-on-dark',
    background: '--ds-color-surface-dock',
    minimum: 4.5,
  },
  {
    name: 'dock muted text',
    foreground: '--ds-color-text-muted-on-dock',
    background: '--ds-color-surface-dock',
    minimum: 4.5,
  },
  {
    name: 'submit label',
    foreground: '--ds-color-text-on-accent',
    background: '--ds-color-accent-decorative',
    minimum: 4.5,
  },
  {
    name: 'gold symbols',
    foreground: '--ds-color-accent',
    background: '--ds-color-surface',
    minimum: 3,
  },
  {
    name: 'maroon selection on cream',
    foreground: '--ds-color-selection',
    background: '--ds-color-canvas',
    minimum: 3,
  },
  {
    name: 'maroon focus on cream',
    foreground: '--ds-color-focus-ring-core',
    background: '--ds-color-canvas',
    minimum: 3,
  },
  {
    name: 'rose error text',
    foreground: '--ds-color-danger',
    background: '--ds-color-surface',
    minimum: 4.5,
  },
  {
    name: 'rose error on tint',
    foreground: '--ds-color-danger-strong',
    background: '--ds-color-danger-soft',
    minimum: 4.5,
  },
  {
    name: 'completed step tile',
    foreground: '--ds-color-text-on-success',
    background: '--ds-color-success',
    minimum: 4.5,
  },
  {
    name: 'muted text on cream',
    foreground: '--ds-color-text-muted',
    background: '--ds-color-canvas',
    minimum: 4.5,
  },
];

/** Parses `--name: value;` pairs, supporting multi-line values. */
export function parseCustomProperties(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const pattern = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  let match = pattern.exec(css);
  while (match !== null) {
    tokens.set(match[1].trim(), match[2].trim().replace(/\s+/g, ' '));
    match = pattern.exec(css);
  }
  return tokens;
}

export function mergeTokens(sources: readonly string[]): TokenMap {
  const merged = new Map<string, string>();
  for (const source of sources) {
    for (const [name, value] of parseCustomProperties(source)) {
      merged.set(name, value);
    }
  }
  return merged;
}

/** Finds every `var(--token)` reference in a stylesheet. */
export function referencedTokens(css: string): string[] {
  const names = new Set<string>();
  const pattern = /var\(\s*(--[a-z0-9-]+)\s*(?:,[^()]*)?\)/gi;
  let match = pattern.exec(css);
  while (match !== null) {
    names.add(match[1].trim());
    match = pattern.exec(css);
  }
  return [...names];
}

/**
 * Resolves a token to a literal colour value by following `var()` chains.
 * Returns `null` for tokens that do not resolve to a colour (lengths, stacks, shadows).
 */
export function resolveColor(tokenName: string, tokens: TokenMap, depth = 0): string | null {
  if (depth > 8) {
    return null;
  }
  const value = tokens.get(tokenName);
  if (!value) {
    return null;
  }
  const reference = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(value.trim());
  if (reference) {
    return resolveColor(reference[1].trim(), tokens, depth + 1);
  }
  const colour = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))$/i.exec(value.trim());
  return colour ? colour[1] : null;
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance per WCAG 2.1. Supports `#rgb`, `#rrggbb`, `rgb()` and `rgb(a b / c)` syntax. */
export function relativeLuminance(colour: string): number {
  const { r, g, b } = parseColor(colour);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function parseColor(colour: string): { r: number; g: number; b: number } {
  const value = colour.trim();
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    const expanded =
      hex.length === 3
        ? hex
            .split('')
            .map((digit) => digit + digit)
            .join('')
        : hex.slice(0, 6);
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
    };
  }

  const numbers = value
    .replace(/^rgba?\(/i, '')
    .replace(/\)$/, '')
    .split(/[\s,/]+/)
    .filter((part) => part.length > 0)
    .slice(0, 3)
    .map((part) => Number.parseFloat(part));

  return { r: numbers[0] ?? 0, g: numbers[1] ?? 0, b: numbers[2] ?? 0 };
}

/** WCAG 2.1 contrast ratio between two colour literals. */
export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Rounds a ratio for readable failure messages. */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/** Colour literals must not appear outside the primitive token layer. */
export function findColorLiterals(css: string): string[] {
  const withoutUrls = css.replace(/url\([^)]*\)/gi, 'url()');
  const matches = withoutUrls.match(/#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi);
  return matches ? [...new Set(matches)] : [];
}

const SPACING_PROPERTIES =
  /(?:^|[\s;{])(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*([^;{}]+);/gi;
const RAW_LENGTH = /(?!0(?:[a-z%]*)\b)(?:\d*\.?\d+(?:px|rem|em|ch|vw|vh|vmin|vmax))/i;

/**
 * Spacing declarations must use spacing tokens (or `0`, `auto`, percentages, `calc()`).
 * Returns the offending declarations for a stylesheet.
 */
export function findRawSpacing(css: string): string[] {
  const offenders: string[] = [];
  const pattern = new RegExp(SPACING_PROPERTIES);
  let match = pattern.exec(css);
  while (match !== null) {
    const value = match[1].trim();
    const usesToken = value.includes('var(');
    const isSafe = /^(0|auto|inherit|unset|initial)$/i.test(value) || /%$/.test(value);
    const isHairline = /^1px$/i.test(value);
    if (!usesToken && !isSafe && !isHairline && RAW_LENGTH.test(value)) {
      offenders.push(value);
    }
    match = pattern.exec(css);
  }
  return offenders;
}

/** Numeric token values (rem-based) such as spacing and radius steps. */
export function numericTokenValue(value: string): number | null {
  const match = /^(-?\d*\.?\d+)rem$/.exec(value.trim());
  return match ? Number.parseFloat(match[1]) : null;
}

/** Duration token values converted to milliseconds. */
export function durationInMs(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const amount = Number.parseFloat(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** Extracts `ds-` class names used in selectors. */
export function designSystemClasses(css: string): string[] {
  const names = new Set<string>();
  const pattern = /\.(-?ds-[a-z0-9_-]+)/gi;
  let match = pattern.exec(css);
  while (match !== null) {
    names.add(match[1]);
    match = pattern.exec(css);
  }
  return [...names];
}

/**
 * Extracts `--ds-*` token names documented in a markdown contract file. A trailing `*`
 * documents a whole family (for example `--ds-maroon-*`), which keeps ramps readable.
 */
export function documentedTokens(markdown: string): string[] {
  const names = new Set<string>();
  const pattern = /(--ds-[a-z0-9-]+)(\*)?/gi;
  let match = pattern.exec(markdown);
  while (match !== null) {
    names.add(`${match[1]}${match[2] ?? ''}`);
    match = pattern.exec(markdown);
  }
  return [...names];
}

/** Extracts `ds-` class names documented in a markdown contract file. */
export function documentedClasses(markdown: string): string[] {
  const names = new Set<string>();
  const pattern = /(?:^|[\s`|(,.])(ds-[a-z0-9_-]+)/gim;
  let match = pattern.exec(markdown);
  while (match !== null) {
    names.add(match[1]);
    match = pattern.exec(markdown);
  }
  return [...names];
}
