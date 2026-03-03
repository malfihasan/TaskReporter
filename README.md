# TaskReporter

A Notion-like task and document management system that runs locally using Markdown files as the backend storage.

![TaskReporter](https://img.shields.io/badge/TaskReporter-v1.0-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## Features

- 📄 **Markdown-based Pages** - Each page is a Markdown file with frontmatter
- ✅ **Task Management** - Create, track, and manage tasks with status, priority, and due dates
- 🔍 **Full-text Search** - Search across all pages instantly
- 📁 **Hierarchical Organization** - Organize pages in folders
- 🎨 **Clean UI** - Notion-inspired design with light/dark mode support
- 🚀 **Local First** - All data stored locally in Markdown files

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/malfihasan/TaskReporter.git
   cd TaskReporter
   ```

2. **Run the start script**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   Or manually:

   ```bash
   # Setup backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt

   # Setup frontend
   cd frontend
   npm install
   cd ..

   # Start backend (Terminal 1)
   cd backend
   python app.py

   # Start frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

3. **Open in browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
TaskReporter/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── next.config.js
├── data/
│   ├── pages/             # Markdown pages (your content)
│   ├── tasks.json         # Tasks data
│   └── config.json        # App configuration
├── deploy/                # Deployment configurations
├── start.sh              # Quick start script
└── README.md
```

## Deployment

### Option 1: Hostinger + PythonAnywhere (Recommended - Free)

Best for Hostinger users. Frontend on Hostinger, Flask backend on PythonAnywhere (free forever, no sleeping).

See [deploy/PYTHONANYWHERE.md](deploy/PYTHONANYWHERE.md) for detailed instructions.

### Option 2: Hostinger + Render.com

Alternative free option (backend sleeps after 15 min inactivity).

See [deploy/HOSTINGER.md](deploy/HOSTINGER.md) for instructions.

### Option 3: Docker (VPS)

```bash
docker-compose up -d
```

### Option 4: Convert to PHP

For single-host deployment on Hostinger only (no external services needed).


## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pages` | GET | List all pages |
| `/api/pages/:path` | GET | Get page content |
| `/api/pages/:path` | POST/PUT | Create/update page |
| `/api/pages/:path` | DELETE | Delete page |
| `/api/tasks` | GET | List all tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | PUT | Update task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/search?q=query` | GET | Search pages |
| `/api/stats` | GET | Get statistics |

## Technologies

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Backend**: Python, Flask
- **Storage**: Markdown files with YAML frontmatter

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Malfi Hasan** - [malfihasan.com](https://malfihasan.com)
