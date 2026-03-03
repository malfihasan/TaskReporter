"""
TaskReporter Backend - Flask API server
Serves and manages Markdown files as pages (like Notion/ClickUp)
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
import re
import uuid
from pathlib import Path
from datetime import datetime
import markdown
import frontmatter

app = Flask(__name__)

# Configure CORS - add your domain here
CORS(app, origins=[
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://malfihasan.com',
    'https://www.malfihasan.com',
])

# Paths - use environment variable for production
BASE_DIR = Path(os.environ.get('DATA_DIR', Path(__file__).parent.parent))
DATA_DIR = BASE_DIR / 'data' if 'DATA_DIR' not in os.environ else Path(os.environ['DATA_DIR'])
PAGES_DIR = DATA_DIR / 'pages'
TASKS_FILE = DATA_DIR / 'tasks.json'
CONFIG_FILE = DATA_DIR / 'config.json'

# Ensure directories exist
PAGES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_default_config():
    """Get default configuration"""
    return {
        'siteName': 'TaskReporter',
        'theme': 'light',
        'defaultView': 'list'
    }


def load_config():
    """Load configuration"""
    if not CONFIG_FILE.exists():
        config = get_default_config()
        save_config(config)
        return config
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)


def save_config(config):
    """Save configuration"""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


def load_tasks():
    """Load tasks from JSON file"""
    if not TASKS_FILE.exists():
        return []
    with open(TASKS_FILE, 'r') as f:
        return json.load(f)


def save_tasks(tasks):
    """Save tasks to JSON file"""
    with open(TASKS_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)


def get_page_tree(directory=None, parent_path=""):
    """Get hierarchical tree of all pages"""
    if directory is None:
        directory = PAGES_DIR
    
    tree = []
    
    try:
        items = sorted(directory.iterdir())
    except FileNotFoundError:
        return tree
    
    for item in items:
        rel_path = f"{parent_path}/{item.name}" if parent_path else item.name
        
        if item.is_dir():
            tree.append({
                'id': rel_path,
                'name': item.name,
                'type': 'folder',
                'path': rel_path,
                'children': get_page_tree(item, rel_path)
            })
        elif item.suffix == '.md':
            # Parse frontmatter to get title
            try:
                post = frontmatter.load(item)
                title = post.get('title', item.stem)
                icon = post.get('icon', '📄')
            except:
                title = item.stem
                icon = '📄'
            
            tree.append({
                'id': rel_path,
                'name': title,
                'icon': icon,
                'type': 'page',
                'path': rel_path,
                'filename': item.name
            })
    
    return tree


def parse_page(filepath):
    """Parse a markdown page with frontmatter"""
    try:
        post = frontmatter.load(filepath)
        content = post.content
        metadata = post.metadata
        
        # Convert markdown to HTML for preview
        html_content = markdown.markdown(
            content, 
            extensions=['tables', 'fenced_code', 'codehilite', 'toc', 'nl2br']
        )
        
        return {
            'content': content,
            'html': html_content,
            'metadata': metadata,
            'title': metadata.get('title', filepath.stem),
            'icon': metadata.get('icon', '📄'),
            'tags': metadata.get('tags', []),
            'created': metadata.get('created', ''),
            'updated': metadata.get('updated', ''),
        }
    except Exception as e:
        return {'error': str(e)}


def save_page(filepath, content, metadata=None):
    """Save a markdown page with frontmatter"""
    if metadata is None:
        metadata = {}
    
    metadata['updated'] = datetime.now().isoformat()
    if 'created' not in metadata:
        metadata['created'] = datetime.now().isoformat()
    
    post = frontmatter.Post(content, **metadata)
    
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(frontmatter.dumps(post))


# API Routes

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get app configuration"""
    return jsonify(load_config())


@app.route('/api/config', methods=['PUT'])
def update_config():
    """Update app configuration"""
    config = request.json
    save_config(config)
    return jsonify(config)


@app.route('/api/pages', methods=['GET'])
def get_pages():
    """Get all pages as tree structure"""
    tree = get_page_tree()
    return jsonify(tree)


@app.route('/api/pages/<path:page_path>', methods=['GET'])
def get_page(page_path):
    """Get a specific page content"""
    filepath = PAGES_DIR / page_path
    
    if not filepath.exists():
        return jsonify({'error': 'Page not found'}), 404
    
    if filepath.is_dir():
        return jsonify({
            'type': 'folder',
            'name': filepath.name,
            'children': get_page_tree(filepath, page_path)
        })
    
    page_data = parse_page(filepath)
    page_data['path'] = page_path
    return jsonify(page_data)


@app.route('/api/pages/<path:page_path>', methods=['POST', 'PUT'])
def create_or_update_page(page_path):
    """Create or update a page"""
    data = request.json
    content = data.get('content', '')
    metadata = data.get('metadata', {})
    
    # Ensure .md extension
    if not page_path.endswith('.md'):
        page_path = page_path + '.md'
    
    filepath = PAGES_DIR / page_path
    
    # Check if creating new page
    is_new = not filepath.exists()
    
    save_page(filepath, content, metadata)
    
    return jsonify({
        'success': True,
        'path': page_path,
        'created': is_new
    })


@app.route('/api/pages/<path:page_path>', methods=['DELETE'])
def delete_page(page_path):
    """Delete a page"""
    filepath = PAGES_DIR / page_path
    
    if not filepath.exists():
        return jsonify({'error': 'Page not found'}), 404
    
    if filepath.is_dir():
        import shutil
        shutil.rmtree(filepath)
    else:
        filepath.unlink()
    
    return jsonify({'success': True})


@app.route('/api/folders', methods=['POST'])
def create_folder():
    """Create a new folder"""
    data = request.json
    folder_path = data.get('path', '')
    
    if not folder_path:
        return jsonify({'error': 'Folder path required'}), 400
    
    folder = PAGES_DIR / folder_path
    folder.mkdir(parents=True, exist_ok=True)
    
    return jsonify({'success': True, 'path': folder_path})


@app.route('/api/search', methods=['GET'])
def search_pages():
    """Search across all pages"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify([])
    
    results = []
    
    for filepath in PAGES_DIR.rglob('*.md'):
        try:
            post = frontmatter.load(filepath)
            content = post.content.lower()
            title = post.get('title', filepath.stem).lower()
            
            if query in content or query in title:
                rel_path = str(filepath.relative_to(PAGES_DIR))
                results.append({
                    'path': rel_path,
                    'title': post.get('title', filepath.stem),
                    'icon': post.get('icon', '📄'),
                    'snippet': get_snippet(post.content, query)
                })
        except:
            continue
    
    return jsonify(results)


def get_snippet(content, query, context_chars=100):
    """Get a text snippet around the search query"""
    query_lower = query.lower()
    content_lower = content.lower()
    
    idx = content_lower.find(query_lower)
    if idx == -1:
        return content[:context_chars] + '...'
    
    start = max(0, idx - context_chars // 2)
    end = min(len(content), idx + len(query) + context_chars // 2)
    
    snippet = content[start:end]
    if start > 0:
        snippet = '...' + snippet
    if end < len(content):
        snippet = snippet + '...'
    
    return snippet


# Tasks API

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    tasks = load_tasks()
    return jsonify(tasks)


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.json
    tasks = load_tasks()
    
    task = {
        'id': str(uuid.uuid4()),
        'title': data.get('title', 'Untitled Task'),
        'description': data.get('description', ''),
        'status': data.get('status', 'todo'),  # todo, in-progress, done
        'priority': data.get('priority', 'medium'),  # low, medium, high
        'dueDate': data.get('dueDate'),
        'tags': data.get('tags', []),
        'pageRef': data.get('pageRef'),  # Reference to a page
        'created': datetime.now().isoformat(),
        'updated': datetime.now().isoformat()
    }
    
    tasks.append(task)
    save_tasks(tasks)
    
    return jsonify(task)


@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.json
    tasks = load_tasks()
    
    for i, task in enumerate(tasks):
        if task['id'] == task_id:
            tasks[i].update(data)
            tasks[i]['updated'] = datetime.now().isoformat()
            save_tasks(tasks)
            return jsonify(tasks[i])
    
    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    tasks = load_tasks()
    tasks = [t for t in tasks if t['id'] != task_id]
    save_tasks(tasks)
    return jsonify({'success': True})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    tasks = load_tasks()
    pages = list(PAGES_DIR.rglob('*.md'))
    
    todo_count = len([t for t in tasks if t['status'] == 'todo'])
    in_progress_count = len([t for t in tasks if t['status'] == 'in-progress'])
    done_count = len([t for t in tasks if t['status'] == 'done'])
    
    return jsonify({
        'totalPages': len(pages),
        'totalTasks': len(tasks),
        'todoTasks': todo_count,
        'inProgressTasks': in_progress_count,
        'doneTasks': done_count
    })


# Health check
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'version': '1.0.0'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
