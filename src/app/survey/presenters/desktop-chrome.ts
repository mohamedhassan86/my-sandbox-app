/**
 * Desktop chrome presenters (007-desktop-design-enhancement).
 *
 * Pure derived strings/glyphs for the desktop-only surfaces — dock badge monogram,
 * live-card meta line, step-counts line, platform year, and the topbar menu branch.
 * No Angular, no DOM: the rules live here (constitution II), templates only bind to
 * them. Contract: specs/007-desktop-design-enhancement/contracts/desktop-chrome.md §5.
 */

/**
 * Monogram content for the circular dock badge on desktop. A letterless title falls
 * back to the documented clipboard glyph so the badge is never empty (FR-003).
 */
export type DockMonogram =
  { readonly kind: 'letter'; readonly letter: string } | { readonly kind: 'glyph' };

export function surveyInitial(title: string | null | undefined): DockMonogram {
  const letter = (title ?? '').match(/[\p{L}\p{N}]/u)?.[0];
  return letter === undefined
    ? { kind: 'glyph' }
    : { kind: 'letter', letter: letter.toUpperCase() };
}

/** Segments of the desktop live-card meta line (FR-004). */
export interface LiveCardMeta {
  readonly sectionsLabel: string;
  readonly minutesLabel: string | null;
  readonly encryptedLabel: 'Encrypted';
}

export function liveCardMeta(input: {
  pages?: ReadonlyArray<unknown> | number;
  estimatedMinutes?: number | null;
}): LiveCardMeta {
  const pages = typeof input.pages === 'number' ? input.pages : (input.pages?.length ?? 0);
  const sectionsLabel = pages === 1 ? '1 section' : `${pages} sections`;
  const minutes = input.estimatedMinutes;
  const minutesLabel =
    typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
      ? `~${Math.round(minutes)} min`
      : null;
  return { sectionsLabel, minutesLabel, encryptedLabel: 'Encrypted' };
}

/** Joins the live-card segments; a null minutes segment leaves no stray separator. */
export function liveCardLine(meta: LiveCardMeta): string {
  return [meta.sectionsLabel, meta.minutesLabel, meta.encryptedLabel]
    .filter((segment): segment is string => typeof segment === 'string' && segment.length > 0)
    .join(' • ');
}

/** Desktop step-row counts line: `N question(s) • A/B done` (FR-006). */
export function stepCountsLabel(answered: number, total: number): string {
  const noun = total === 1 ? 'question' : 'questions';
  return `${total} ${noun} • ${answered}/${total} done`;
}

/** Render-time year for the platform line (FR-012). */
export function platformYear(now: Date): number {
  return now.getFullYear();
}

/**
 * What the topbar menu button controls (FR-009): the dock rail on desktop, the drawer
 * below the breakpoint. The drawer branch preserves today's behavior exactly.
 */
export type TopbarAction = 'rail' | 'drawer';

export function topbarAction(isDesktop: boolean): TopbarAction {
  return isDesktop ? 'rail' : 'drawer';
}
