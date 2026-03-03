export interface PageNode {
  id: string;
  name: string;
  type: 'page' | 'folder';
  path: string;
  icon?: string;
  filename?: string;
  children?: PageNode[];
}

export interface PageContent {
  content: string;
  html: string;
  metadata: Record<string, any>;
  title: string;
  icon: string;
  tags: string[];
  created: string;
  updated: string;
  path?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  pageRef?: string;
  created: string;
  updated: string;
}

export interface Stats {
  totalPages: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
}

export interface SearchResult {
  path: string;
  title: string;
  icon: string;
  snippet: string;
}

export interface Config {
  siteName: string;
  theme: 'light' | 'dark';
  defaultView: 'list' | 'board';
}
