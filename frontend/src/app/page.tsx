'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import { PageNode, Task, Stats } from '@/types';
import { api } from '@/lib/api';

export default function Home() {
  const [pages, setPages] = useState<PageNode[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'page' | 'tasks' | 'dashboard'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    loadPages();
    loadTasks();
    loadStats();
  }, []);

  const loadPages = async () => {
    try {
      const data = await api.getPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await api.search(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPage = (path: string) => {
    setSelectedPage(path);
    setView('page');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreatePage = async (parentPath?: string) => {
    const title = prompt('Enter page title:');
    if (!title) return;

    const path = parentPath 
      ? `${parentPath}/${title.toLowerCase().replace(/\s+/g, '-')}.md`
      : `${title.toLowerCase().replace(/\s+/g, '-')}.md`;

    try {
      await api.createPage(path, {
        content: `# ${title}\n\nStart writing here...`,
        metadata: { title, icon: '📄' }
      });
      await loadPages();
      await loadStats();
      handleSelectPage(path);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      await api.createFolder(name.toLowerCase().replace(/\s+/g, '-'));
      await loadPages();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeletePage = async (path: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await api.deletePage(path);
      await loadPages();
      await loadStats();
      if (selectedPage === path) {
        setSelectedPage(null);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await api.createTask(taskData);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await api.updateTask(taskId, taskData);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handlePageUpdate = async () => {
    await loadPages();
    await loadStats();
  };

  return (
    <div className="flex h-screen bg-notion-bg dark:bg-notion-bg-dark">
      <Sidebar
        pages={pages}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        onCreateFolder={handleCreateFolder}
        onDeletePage={handleDeletePage}
        selectedPage={selectedPage}
        onViewChange={setView}
        currentView={view}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        searchResults={searchResults}
      />
      
      <MainContent
        view={view}
        selectedPage={selectedPage}
        tasks={tasks}
        stats={stats}
        onCreatePage={handleCreatePage}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onPageUpdate={handlePageUpdate}
        onViewChange={setView}
      />
    </div>
  );
}
