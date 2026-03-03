'use client';

import { useState } from 'react';
import { Task } from '@/types';
import {
  Plus,
  Trash2,
  Calendar,
  Flag,
  CheckCircle,
  Circle,
  Clock,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import TaskChat from './TaskChat';

interface TaskListProps {
  tasks: Task[];
  onCreateTask: (taskData: Partial<Task>) => void;
  onUpdateTask: (taskId: string, taskData: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: TaskListProps) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [showChat, setShowChat] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    onCreateTask({
      ...newTask,
      status: 'todo',
      tags: [],
    });
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowNewTask(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle size={18} className="text-gray-400" />;
      case 'in-progress':
        return <Clock size={18} className="text-blue-500" />;
      case 'done':
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return <Circle size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const cycleStatus = (task: Task) => {
    const statusOrder = ['todo', 'in-progress', 'done'] as const;
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdateTask(task.id, { status: nextStatus });
    
    // Show chat when task is completed
    if (nextStatus === 'done') {
      setShowChat(true);
    }
  };

  const handleChatCreateTask = (taskData: { title: string; description: string }) => {
    onCreateTask({
      ...taskData,
      status: 'todo',
      priority: 'medium',
      tags: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* AI Task Chat */}
      <TaskChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onCreateTask={handleChatCreateTask}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-notion-text dark:text-notion-text-dark">
          Tasks
        </h1>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-notion-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('-', ' ')}
            {f !== 'all' && (
              <span className="ml-1 text-xs">
                ({tasks.filter((t) => t.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-notion-border dark:border-notion-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">New Task</h3>
            <button
              onClick={() => setShowNewTask(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 mb-3 border border-notion-border dark:border-notion-border-dark rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 mb-3 border border-notion-border dark:border-notion-border-dark rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
          />
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-gray-400" />
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
                className="px-2 py-1 border border-notion-border dark:border-notion-border-dark rounded bg-transparent text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="px-2 py-1 border border-notion-border dark:border-notion-border-dark rounded bg-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewTask(false)}
              className="px-4 py-2 text-sm text-notion-text-muted hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-notion-text-muted">
            {filter === 'all' ? 'No tasks yet. Create your first task!' : `No ${filter} tasks`}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-notion-border dark:border-notion-border-dark hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => cycleStatus(task)}
                className="mt-0.5 hover:scale-110 transition-transform"
              >
                {getStatusIcon(task.status)}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      task.status === 'done'
                        ? 'line-through text-notion-text-muted'
                        : 'text-notion-text dark:text-notion-text-dark'
                    }`}
                  >
                    {task.title}
                  </span>
                  <Flag size={14} className={getPriorityColor(task.priority)} />
                </div>
                {task.description && (
                  <p className="text-xs text-notion-text-muted mt-1 truncate">
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-notion-text-muted">
                    <Calendar size={12} />
                    {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingTask(task.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
