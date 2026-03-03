'use client';

import { useState } from 'react';
import { PageNode, SearchResult } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Plus,
  Search,
  Home,
  CheckSquare,
  Settings,
  Menu,
  X,
  FolderPlus,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  pages: PageNode[];
  isOpen: boolean;
  onToggle: () => void;
  onSelectPage: (path: string) => void;
  onCreatePage: (parentPath?: string) => void;
  onCreateFolder: () => void;
  onDeletePage: (path: string) => void;
  selectedPage: string | null;
  onViewChange: (view: 'page' | 'tasks' | 'dashboard') => void;
  currentView: string;
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
}

export default function Sidebar({
  pages,
  isOpen,
  onToggle,
  onSelectPage,
  onCreatePage,
  onCreateFolder,
  onDeletePage,
  selectedPage,
  onViewChange,
  currentView,
  searchQuery,
  onSearch,
  searchResults,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderPageTree = (nodes: PageNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedPage === node.path;

      if (node.type === 'folder') {
        return (
          <div key={node.id}>
            <div
              className={`sidebar-item flex items-center gap-2 group`}
              style={{ paddingLeft: `${8 + level * 16}px` }}
            >
              <button
                onClick={() => toggleFolder(node.path)}
                className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <Folder size={16} className="text-yellow-600" />
              <span className="flex-1 truncate text-sm">{node.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreatePage(node.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                <Plus size={14} />
              </button>
            </div>
            {isExpanded && node.children && (
              <div>{renderPageTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={node.id}
          className={`sidebar-item flex items-center gap-2 group ${
            isSelected ? 'active' : ''
          }`}
          style={{ paddingLeft: `${28 + level * 16}px` }}
          onClick={() => onSelectPage(node.path)}
        >
          <span className="text-base">{node.icon || '📄'}</span>
          <span className="flex-1 truncate text-sm">{node.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePage(node.path);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    });
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full
          bg-notion-sidebar dark:bg-notion-sidebar-dark
          border-r border-notion-border dark:border-notion-border-dark
          transition-all duration-300
          ${isOpen ? 'w-64' : 'w-0 md:w-12'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="p-4 border-b border-notion-border dark:border-notion-border-dark">
            <h1 className="text-lg font-semibold text-notion-text dark:text-notion-text-dark">
              📋 TaskReporter
            </h1>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-notion-border dark:border-notion-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-gray-800 border border-notion-border dark:border-notion-border-dark rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.path}
                    onClick={() => onSelectPage(result.path)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>{result.icon}</span>
                      <span className="text-sm font-medium">{result.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {result.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-3 py-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`sidebar-item flex items-center gap-3 w-full ${
                currentView === 'dashboard' ? 'active' : ''
              }`}
            >
              <Home size={16} />
              <span className="text-sm">Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange('tasks')}
              className={`sidebar-item flex items-center gap-3 w-full ${
                currentView === 'tasks' ? 'active' : ''
              }`}
            >
              <CheckSquare size={16} />
              <span className="text-sm">Tasks</span>
            </button>
          </div>

          {/* Pages Section */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Pages
              </span>
              <div className="flex gap-1">
                <button
                  onClick={onCreateFolder}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="New Folder"
                >
                  <FolderPlus size={14} />
                </button>
                <button
                  onClick={() => onCreatePage()}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="New Page"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            {pages.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                No pages yet.
                <br />
                Click + to create one.
              </div>
            ) : (
              renderPageTree(pages)
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-notion-border dark:border-notion-border-dark">
            <button className="sidebar-item flex items-center gap-3 w-full">
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
