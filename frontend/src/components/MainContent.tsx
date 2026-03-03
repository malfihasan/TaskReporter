'use client';

import { Task, Stats } from '@/types';
import Dashboard from './Dashboard';
import TaskList from './TaskList';
import PageViewer from './PageViewer';

interface MainContentProps {
  view: 'page' | 'tasks' | 'dashboard';
  selectedPage: string | null;
  tasks: Task[];
  stats: Stats | null;
  onCreateTask: (taskData: Partial<Task>) => void;
  onUpdateTask: (taskId: string, taskData: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onPageUpdate: () => void;
}

export default function MainContent({
  view,
  selectedPage,
  tasks,
  stats,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onPageUpdate,
}: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-white dark:bg-notion-bg-dark">
      {view === 'dashboard' && <Dashboard stats={stats} tasks={tasks} />}
      
      {view === 'tasks' && (
        <TaskList
          tasks={tasks}
          onCreateTask={onCreateTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}
      
      {view === 'page' && selectedPage && (
        <PageViewer path={selectedPage} onUpdate={onPageUpdate} />
      )}
      
      {view === 'page' && !selectedPage && (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select a page to view
        </div>
      )}
    </main>
  );
}
