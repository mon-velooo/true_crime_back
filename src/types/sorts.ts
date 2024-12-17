export interface Sort {
  key: string;
  order: string;
}

export interface SortableKey {
  paramsKey: string;
  accessKey: string;
}

export type SortableKeys = SortableKey[];
