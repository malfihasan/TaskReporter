'use client';

import { useState, useEffect } from 'react';
import { PageContent } from '@/types';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Edit2, Save, X, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface PageViewerProps {
  path: string;
  onUpdate: () => void;
}

export default function PageViewer({ path, onUpdate }: PageViewerProps) {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPage();
  }, [path]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const data = await api.getPage(path);
      setPage(data);
      setEditContent(data.content);
      setEditTitle(data.title);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;
    
    setSaving(true);
    try {
      await api.updatePage(path, {
        content: editContent,
        metadata: {
          ...page.metadata,
          title: editTitle,
        },
      });
      await loadPage();
      onUpdate();
      setEditing(false);
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (page) {
      setEditContent(page.content);
      setEditTitle(page.title);
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-notion-text-muted">
        Page not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{page.icon}</span>
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-notion-text dark:text-notion-text-dark">
                {page.title}
              </h1>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-notion-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-notion-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-notion-text-muted">
          {page.created && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              Created: {format(new Date(page.created), 'MMM dd, yyyy')}
            </div>
          )}
          {page.updated && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              Updated: {format(new Date(page.updated), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
          {page.tags && page.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag size={14} />
              {page.tags.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="border border-notion-border dark:border-notion-border-dark rounded-lg overflow-hidden">
          <div className="flex border-b border-notion-border dark:border-notion-border-dark bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-notion-text-muted">
            Markdown Editor
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[500px] p-4 bg-white dark:bg-gray-900 focus:outline-none font-mono text-sm resize-none"
            placeholder="Write your content in Markdown..."
          />
        </div>
      ) : (
        <div className="markdown-body prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return isInline ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {page.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
