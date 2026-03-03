'use client';

import { Stats, Task } from '@/types';
import { FileText, CheckSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  stats: Stats | null;
  tasks: Task[];
}

export default function Dashboard({ stats, tasks }: DashboardProps) {
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Pages',
      value: stats?.totalPages || 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks || 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    },
    {
      label: 'Completed',
      value: stats?.doneTasks || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-notion-text dark:text-notion-text-dark mb-2">
          Welcome to TaskReporter
        </h1>
        <p className="text-notion-text-muted">
          Your personal task and document management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg border border-notion-border dark:border-notion-border-dark p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notion-text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-notion-text dark:text-notion-text-dark">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-notion-border dark:border-notion-border-dark p-6">
          <h2 className="text-lg font-semibold mb-4 text-notion-text dark:text-notion-text-dark">
            Recent Tasks
          </h2>
          {recentTasks.length === 0 ? (
            <p className="text-notion-text-muted text-sm">No tasks yet</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium
                        ${task.status === 'todo' ? 'status-todo' : ''}
                        ${task.status === 'in-progress' ? 'status-in-progress' : ''}
                        ${task.status === 'done' ? 'status-done' : ''}
                      `}
                    >
                      {task.status}
                    </span>
                    <span className="text-sm text-notion-text dark:text-notion-text-dark">
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs
                      ${task.priority === 'high' ? 'priority-high' : ''}
                      ${task.priority === 'medium' ? 'priority-medium' : ''}
                      ${task.priority === 'low' ? 'priority-low' : ''}
                    `}
                  >
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-notion-border dark:border-notion-border-dark p-6">
          <h2 className="text-lg font-semibold mb-4 text-notion-text dark:text-notion-text-dark flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500" />
            Upcoming Due Dates
          </h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-notion-text-muted text-sm">No upcoming tasks</p>
          ) : (
            <ul className="space-y-3">
              {upcomingTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span className="text-sm text-notion-text dark:text-notion-text-dark">
                    {task.title}
                  </span>
                  <span className="text-xs text-notion-text-muted">
                    {task.dueDate && format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <p className="text-sm opacity-90 mb-4">
          Create pages to organize your notes and documents. Add tasks to track your work.
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Create Your First Page
          </button>
          <button className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
