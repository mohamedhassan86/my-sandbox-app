import { describe, expect, it } from 'vitest';
import {
  liveCardLine,
  liveCardMeta,
  platformYear,
  stepCountsLabel,
  surveyInitial,
  topbarAction,
} from './desktop-chrome';

describe('desktop-chrome presenters', () => {
  describe('surveyInitial', () => {
    it('extracts the first letter, uppercased', () => {
      expect(surveyInitial('Customer Feedback Survey')).toEqual({ kind: 'letter', letter: 'C' });
      expect(surveyInitial('gcc insights')).toEqual({ kind: 'letter', letter: 'G' });
      expect(surveyInitial('  Demographics')).toEqual({ kind: 'letter', letter: 'D' });
    });

    it('accepts a leading digit as the monogram', () => {
      expect(surveyInitial('3M Survey')).toEqual({ kind: 'letter', letter: '3' });
    });

    it('falls back to the glyph for empty, whitespace, or letterless titles', () => {
      expect(surveyInitial('')).toEqual({ kind: 'glyph' });
      expect(surveyInitial('   ')).toEqual({ kind: 'glyph' });
      expect(surveyInitial('— ! ?')).toEqual({ kind: 'glyph' });
      expect(surveyInitial(null)).toEqual({ kind: 'glyph' });
      expect(surveyInitial(undefined)).toEqual({ kind: 'glyph' });
    });
  });

  describe('liveCardMeta / liveCardLine', () => {
    it('formats plural sections and rounded minutes', () => {
      const meta = liveCardMeta({ pages: [1, 2, 3], estimatedMinutes: 4.2 });
      expect(meta).toEqual({
        sectionsLabel: '3 sections',
        minutesLabel: '~4 min',
        encryptedLabel: 'Encrypted',
      });
      expect(liveCardLine(meta)).toBe('3 sections • ~4 min • Encrypted');
    });

    it('uses the singular section form for one page', () => {
      expect(liveCardMeta({ pages: [{}] }).sectionsLabel).toBe('1 section');
      expect(liveCardMeta({ pages: 1 }).sectionsLabel).toBe('1 section');
    });

    it('omits the minutes segment without leaving a stray separator', () => {
      for (const estimatedMinutes of [undefined, null, 0, -3, Number.NaN]) {
        const meta = liveCardMeta({ pages: 3, estimatedMinutes });
        expect(meta.minutesLabel).toBeNull();
        expect(liveCardLine(meta)).toBe('3 sections • Encrypted');
      }
      expect(liveCardLine(liveCardMeta({}))).toBe('0 sections • Encrypted');
    });
  });

  describe('stepCountsLabel', () => {
    it('reads N questions • A/B done with plural agreement', () => {
      expect(stepCountsLabel(2, 3)).toBe('3 questions • 2/3 done');
      expect(stepCountsLabel(0, 1)).toBe('1 question • 0/1 done');
      expect(stepCountsLabel(0, 0)).toBe('0 questions • 0/0 done');
    });
  });

  describe('platformYear', () => {
    it('returns the render-time full year', () => {
      expect(platformYear(new Date(2026, 0, 1))).toBe(2026);
      expect(platformYear(new Date(2031, 11, 31))).toBe(2031);
    });
  });

  describe('topbarAction', () => {
    it('collapses the rail on desktop and toggles the drawer below the breakpoint', () => {
      expect(topbarAction(true)).toBe('rail');
      expect(topbarAction(false)).toBe('drawer');
    });
  });
});
