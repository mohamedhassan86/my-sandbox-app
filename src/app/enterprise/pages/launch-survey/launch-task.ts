import type { TaskDefinition } from '../../models/state.models';

/**
 * "Launch a survey" guided task definition (FR-029–FR-032). Steps and field
 * specs are typed; values are stored in Draft and validated inline.
 */
export const LAUNCH_TASK: TaskDefinition = {
  taskKey: 'launch-survey',
  title: 'Launch a survey',
  steps: [
    {
      id: 'campaign',
      title: 'Campaign',
      fields: [
        {
          key: 'title',
          kind: 'text',
          label: 'Survey title',
          required: true,
          placeholder: 'e.g. Q3 Customer Satisfaction',
          helpText: 'Shown to participants on the first screen.',
        },
        {
          key: 'audience',
          kind: 'select',
          label: 'Audience',
          required: true,
          defaultValue: 'customers',
          options: [
            { label: 'Customers', value: 'customers' },
            { label: 'All staff', value: 'staff' },
            { label: 'Product team', value: 'product' },
            { label: 'Invitation list', value: 'invitees' },
          ],
        },
        {
          key: 'region',
          kind: 'select',
          label: 'Region',
          required: false,
          defaultValue: 'global',
          options: [
            { label: 'Global', value: 'global' },
            { label: 'North America', value: 'nam' },
            { label: 'Europe', value: 'emea' },
            { label: 'Middle East', value: 'mea' },
          ],
        },
        {
          key: 'description',
          kind: 'textarea',
          label: 'Description (optional)',
          required: false,
          placeholder: 'What will you do with the results?',
        },
      ],
    },
    {
      id: 'schedule',
      title: 'Schedule & reminders',
      fields: [
        {
          key: 'launchDate',
          kind: 'date',
          label: 'Launch date',
          required: true,
          helpText: 'Responses open at 09:00 local time on this date.',
        },
        {
          key: 'closeAfterDays',
          kind: 'number',
          label: 'Close after (days)',
          required: true,
          defaultValue: 14,
          min: 1,
          max: 90,
        },
        {
          key: 'anonymous',
          kind: 'toggle',
          label: 'Anonymous responses',
          required: false,
          defaultValue: true,
          helpText: 'Participants are not linked to their answers.',
        },
        {
          key: 'reminderDays',
          kind: 'multiselect',
          label: 'Auto reminders',
          required: false,
          defaultValue: ['2', '5'],
          options: [
            { label: '2 days before close', value: '2' },
            { label: '5 days before close', value: '5' },
            { label: 'At 50% of open window', value: 'half' },
          ],
        },
      ],
    },
    {
      id: 'review',
      title: 'Review & launch',
      fields: [
        {
          key: 'notifyOwner',
          kind: 'toggle',
          label: 'Email me on the first response',
          required: false,
          defaultValue: true,
        },
        {
          key: 'notes',
          kind: 'textarea',
          label: 'Internal notes (optional)',
          required: false,
          placeholder: 'Visible only to the operations team.',
        },
      ],
    },
  ],
};

/** Smart default launch date: seven days from now. */
export function defaultLaunchDate(): string {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}
