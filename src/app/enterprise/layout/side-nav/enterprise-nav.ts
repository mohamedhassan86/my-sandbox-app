import { copy } from '../../copy/copy';

export interface NavArea {
  id: string;
  label: string;
  route: string;
  glyph: string;
}

/** Top-level navigation areas; single source for nav, breadcrumbs, and search pages. */
export const NAV_AREAS: NavArea[] = [
  { id: 'home', label: copy.nav.home, route: '/enterprise/home', glyph: '\u2302' },
  { id: 'surveys', label: copy.nav.surveys, route: '/enterprise/surveys', glyph: '\u2630' },
  { id: 'responses', label: copy.nav.responses, route: '/enterprise/responses', glyph: '\u2606' },
  { id: 'participants', label: copy.nav.participants, route: '/enterprise/participants', glyph: '\u25C9' },
  { id: 'help', label: copy.nav.help, route: '/enterprise/help', glyph: '?' },
];
