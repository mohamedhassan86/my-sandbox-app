import type { CollectionKey } from './entities.models';

/** Field filter descriptor used by collections + saved views. */
export interface FilterChip {
  id: string;
  field: string;
  op: 'eq' | 'contains' | 'in' | 'gte' | 'lte';
  value: string | number | boolean | (string | number)[];
  label: string;
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

export interface ColumnSetting {
  key: string;
  visible: boolean;
  order: number;
}

export type Density = 'comfortable' | 'compact';
export type Appearance = 'light' | 'dark' | 'system';

export interface AppPreferences {
  appearance: Appearance;
  accessibilityMode: boolean;
  tableDensity: Density;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  appearance: 'system',
  accessibilityMode: false,
  tableDensity: 'comfortable',
};

export interface DataView {
  id: string;
  collectionKey: CollectionKey;
  name: string;
  searchText: string;
  filters: FilterChip[];
  sort: SortState | null;
  columns: ColumnSetting[];
  density: Density;
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  taskKey: string;
  currentStepIndex: number;
  values: Record<string, string | string[] | boolean | number | null>;
  updatedAt: string;
}

export type FieldValue = string | string[] | boolean | number | null;
export type FieldKind = 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'date' | 'toggle' | 'textarea';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldSpec {
  key: string;
  kind: FieldKind;
  label: string;
  required: boolean;
  defaultValue?: string | number | boolean | string[] | null;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  helpText?: string;
}

export interface TaskStep {
  id: string;
  title: string;
  fields: FieldSpec[];
}

export interface TaskDefinition {
  taskKey: string;
  title: string;
  steps: TaskStep[];
}

export interface NotificationReadState {
  readIds: string[];
  clearedIds: string[];
}

export interface OnboardingState {
  completed: boolean;
  dismissedAt?: string;
}

export interface NavState {
  railCollapsed: boolean;
}
