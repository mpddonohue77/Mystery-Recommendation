
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  reason: string;
  publishedYear: string;
  isbn: string;
  coverPrompt: string;
  coverUrl?: string;
  rating?: number;
}

export type BookStatus = 'recommended' | 'read' | 'saved';
export type SearchMode = 'standard' | 'deep-cuts';

export interface UserBook extends Book {
  status: BookStatus;
  timestamp: number;
}

export interface QuickPick {
  label: string;
  query: string;
}
