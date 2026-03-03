---
title: Quick Start Guide
icon: 🚀
created: 2026-03-02T00:00:00
updated: 2026-03-02T00:00:00
tags:
  - guide
  - tutorial
---

# Quick Start Guide

Get up and running with TaskReporter in just a few minutes.

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Start the Application

```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access TaskReporter!

## Creating Your First Page

1. Click the **+** button in the sidebar
2. Enter a title for your page
3. Start writing in Markdown
4. Click **Save** to save your changes

## Managing Tasks

1. Click **Tasks** in the sidebar
2. Click **New Task** to create a task
3. Set priority, due date, and description
4. Click on the status icon to cycle through: Todo → In Progress → Done

## Tips & Tricks

- Use `#` for headings (# H1, ## H2, ### H3)
- Use `**bold**` and `*italic*` for text formatting
- Use \`code\` for inline code
- Use ``` for code blocks
- Drag and drop to reorder pages (coming soon)

---

Need help? Check the [documentation](./docs) or open an issue on GitHub.
