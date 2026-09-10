import type { Answer, ResponseAttachment } from '../../core/models/response.models';
import type { Survey } from '../../core/models/survey.models';
import { pageProgress } from '../../core/validators/response.validator';

export interface CompletionTile {
  label: string;
  value: string;
}

/** Page tiles shown before the survey collapses into a single overflow tile. */
const MAX_PAGE_TILES = 4;

export function buildCompletionTiles(
  survey: Survey,
  answers: Answer[],
  attachments: ResponseAttachment[],
): CompletionTile[] {
  const progress = survey.pages.map((page) => ({
    label: page.title,
    ...pageProgress(page, answers, attachments),
  }));
  const files = attachments.length;
  const filesTile: CompletionTile = {
    label: 'Files',
    value: files === 1 ? '1 file attached' : `${files} files attached`,
  };
  if (progress.length <= MAX_PAGE_TILES) {
    return [
      ...progress.map((entry) => ({
        label: entry.label,
        value: `${entry.answered}/${entry.total} answered`,
      })),
      filesTile,
    ];
  }
  const head = progress.slice(0, MAX_PAGE_TILES - 1);
  const tail = progress.slice(MAX_PAGE_TILES - 1);
  const answered = tail.reduce((count, entry) => count + entry.answered, 0);
  const total = tail.reduce((count, entry) => count + entry.total, 0);
  return [
    ...head.map((entry) => ({
      label: entry.label,
      value: `${entry.answered}/${entry.total} answered`,
    })),
    { label: `+${tail.length} more`, value: `${answered}/${total} answered` },
    filesTile,
  ];
}
