'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
  suggestions?: { idea1: string; idea2: string; idea3: string };
}

interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: { title: string; description: string }) => void;
}

export default function TaskChat({
  isOpen,
  onClose,
  onCreateTask,
}: TaskChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      content: '🎉 Great job completing your task! What would you like to work on next? Describe your next task and I\'ll give you 3 different approaches.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<{
    ideas: { idea1: string; idea2: string; idea3: string };
    originalDescription: string;
  } | null>(null);
  const [awaitingSelection, setAwaitingSelection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);

    // Check if user is selecting an option (1, 2, or 3)
    if (awaitingSelection && currentSuggestions && ['1', '2', '3'].includes(userMessage)) {
      const ideaKey = `idea${userMessage}` as 'idea1' | 'idea2' | 'idea3';
      const selectedIdea = currentSuggestions.ideas[ideaKey];
      
      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: `Creating task from: "${selectedIdea}"...` },
      ]);

      try {
        const data = await api.createTaskStory(selectedIdea, currentSuggestions.originalDescription);

        if (data.success && data.task) {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              type: 'bot',
              content: `✅ Task created!\n\n**${data.task.title}**\n\n${data.task.description}\n\nI've added this to your task list. Want to create another task?`,
            },
          ]);

          // Create the task
          onCreateTask({
            title: data.task.title,
            description: data.task.description,
          });

          setCurrentSuggestions(null);
          setAwaitingSelection(false);
        } else {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              type: 'bot',
              content: `Sorry, I couldn't create the task. ${data.error || 'Please try again.'}`,
            },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            type: 'bot',
            content: 'Sorry, there was an error connecting to the AI service. Please try again.',
          },
        ]);
      }

      setIsLoading(false);
      return;
    }

    // Get task suggestions
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: 'bot', content: '🤔 Thinking of ideas...' },
    ]);

    try {
      const data = await api.getTaskSuggestions(userMessage);

      if (data.success && data.suggestions) {
        const suggestions = data.suggestions;
        setCurrentSuggestions({ ideas: suggestions, originalDescription: userMessage });
        setAwaitingSelection(true);
        
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            type: 'bot',
            content: `Here are 3 approaches for your task:\n\n**1.** ${suggestions.idea1}\n\n**2.** ${suggestions.idea2}\n\n**3.** ${suggestions.idea3}\n\nType **1**, **2**, or **3** to select an approach and I'll create a task for you.`,
            suggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            type: 'bot',
            content: `Sorry, I couldn't generate suggestions. ${data.error || 'Please try again.'}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          type: 'bot',
          content: 'Sorry, there was an error connecting to the AI service. Please make sure the backend is running and OPENROUTER_API_KEY is set.',
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        type: 'bot',
        content: '🎉 Great job completing your task! What would you like to work on next? Describe your next task and I\'ll give you 3 different approaches.',
      },
    ]);
    setCurrentSuggestions(null);
    setAwaitingSelection(false);
  };

  const handleClose = () => {
    resetChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-notion-border dark:border-notion-border-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary-500" size={20} />
            <span className="font-semibold text-notion-text dark:text-notion-text-dark">
              AI Task Assistant
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-lg whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-notion-text dark:text-notion-text-dark'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm text-notion-text-muted">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick selection buttons when awaiting selection */}
        {awaitingSelection && currentSuggestions && (
          <div className="px-4 py-2 border-t border-notion-border dark:border-notion-border-dark flex gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setInput(String(num));
                  setTimeout(handleSendMessage, 100);
                }}
                disabled={isLoading}
                className="flex-1 py-2 px-3 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 disabled:opacity-50 transition-colors"
              >
                Option {num}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-notion-border dark:border-notion-border-dark">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                awaitingSelection
                  ? 'Type 1, 2, or 3 to select...'
                  : 'Describe your next task...'
              }
              className="flex-1 px-4 py-2 border border-notion-border dark:border-notion-border-dark rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
