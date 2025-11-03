# My Mind - Hierarchical Todo List Application

A beautiful, minimalist web application for managing hierarchical todo lists with an infinite canvas interface.

## Demo Video
[Insert your Loom/screen recording link here - max 5 minutes]

## Features

### Core Functionality
- ✅ **Multiple Users**: Each user has their own account with secure authentication
- ✅ **User Isolation**: Users can only see and modify their own tasks
- ✅ **Hierarchical Tasks**: Support for nested subtasks up to 3 levels deep
- ✅ **Task Management**: Create, edit, delete, and complete tasks at any level
- ✅ **Collapse/Expand**: Hide or show subtasks by double-clicking on tasks
- ✅ **Drag & Drop**: Move tasks anywhere on the infinite canvas or nest them as subtasks
- ✅ **Search**: Find tasks with intelligent search that centers on the best match
- ✅ **Persistent Storage**: All data is automatically saved to a secure database (Supabase)

### User Interface
- Clean, minimalist design with off-white background (#FAF9F6)
- Josefin Sans typography throughout
- Color-coded tasks using Notion's color palette
- Infinite canvas for spatial organization of tasks
- Smooth animations and transitions
- Personalized header showing "[Your Name]'s Mind"
- Trash zone for easy deletion via drag and drop

## Project Structure

```
├── App.tsx                      # Main application component with state management
├── components/
│   ├── Login.tsx               # Authentication (login/signup)
│   ├── Header.tsx              # Top navigation bar with search and create
│   ├── InfiniteCanvas.tsx      # Main canvas for displaying tasks
│   ├── TaskCard.tsx            # Individual task component with subtasks
│   ├── ColorPalette.tsx        # Color picker for tasks
│   ├── CustomDragLayer.tsx     # Custom drag preview layer
│   └── TrashZone.tsx           # Trash zone for deleting tasks
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   ├── api.ts                  # API client for backend communication
│   ├── colors.ts               # Notion color palette configuration
│   └── supabase/
│       └── info.tsx            # Supabase configuration
├── supabase/functions/server/
│   ├── index.tsx               # Backend API routes (Hono server)
│   └── kv_store.tsx            # Key-value store utilities
└── styles/
    └── globals.css             # Global styles and Tailwind configuration
```

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **Drag and Drop**: react-dnd with HTML5 backend
- **Animations**: Motion (Framer Motion)
- **Backend**: Supabase Edge Functions with Hono
- **Database**: Supabase PostgreSQL with KV store
- **Authentication**: Supabase Auth

## Installation and Setup

This is a React application that requires Node.js to run.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Extract the project files**
   ```bash
   unzip my-mind.zip
   cd my-mind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the URL shown in your terminal)

### Important Notes
- Do NOT include the `node_modules` folder in your zip submission
- The application requires an internet connection to access the Supabase backend
- The backend is already deployed and configured

## Usage Guide

### Getting Started
1. **Sign Up**: Create an account with your email, password, and name
2. **Log In**: Use your credentials to access your personal workspace

### Managing Tasks
- **Create Task**: Click the + icon in the header, type task name, select a color from the palette below
- **Edit Task**: Hover over a task and click the edit (pencil) icon, or click to rename
- **Complete Task**: Click the checkbox next to any task
- **Delete Task**: Drag the task to the trash zone at the bottom of the screen
- **Move Task**: Click and drag any task to reposition it on the canvas

### Working with Subtasks
- **Add Subtask**: Click the + icon within any task (supports up to 3 levels deep)
- **Edit Subtask**: Same as editing tasks - hover and click the edit icon
- **Nest Tasks**: Drag and drop a task onto another task to make it a subtask
- **Collapse/Expand**: Double-click on any task to hide/show its subtasks
- **Nested Hierarchy**: Subtasks inherit their parent's color with progressively lighter shades
- **Drag Subtasks**: All tasks at all levels can be dragged and repositioned or nested

### Searching
- Click the search icon (magnifying glass) in the header
- Type your query and press Enter
- The canvas will smoothly center on the best matching task

### Navigation
- **Pan Canvas**: Click and drag on the empty canvas background to pan around
- **Logout**: Click the logout button next to your name in the header

## MVP Requirements Checklist

- ✅ Multiple users with authentication
- ✅ Each user only sees their own tasks
- ✅ Users cannot modify other users' tasks
- ✅ Mark tasks as complete (checkbox)
- ✅ Collapse/expand tasks (double-click)
- ✅ Move tasks between positions on canvas
- ✅ Durable storage (Supabase PostgreSQL)
- ✅ Create, edit, and delete tasks
- ✅ Hierarchical structure up to 3 levels deep
- ✅ Drag and drop for all task levels (top-level and subtasks)

## Code Architecture

### Frontend (App.tsx)
The main application manages:
- Authentication state and user session persistence
- Task state with auto-save functionality (1 second debounce)
- All CRUD operations for tasks
- Recursive task tree operations (search, update, delete)
- Canvas positioning and task search

### Backend (supabase/functions/server/index.tsx)
The Hono server provides:
- `/signup` - Create new user accounts with auto-confirmed email
- `/login` - Authenticate users and return access tokens
- `/tasks` - GET/POST endpoints for loading and saving tasks
- User verification middleware for protected routes
- Comprehensive error handling and logging

### Data Model
```typescript
interface Task {
  id: string;           // Unique identifier
  title: string;        // Task name
  color: NotionColor;   // One of 9 Notion colors
  x: number;           // Canvas X position (top-level only)
  y: number;           // Canvas Y position (top-level only)
  completed: boolean;  // Completion status
  collapsed: boolean;  // Whether subtasks are hidden
  subtasks: Task[];    // Nested tasks (recursive)
  parentId?: string;   // ID of parent task (if subtask)
}
```

### Database Schema
- User authentication managed by Supabase Auth
- Tasks stored in KV store with key: `user_{userId}_tasks`
- Each user's data is completely isolated
- Auto-save triggered 1 second after any change

## Key Implementation Details

### Authentication Flow
1. User signs up → Backend creates user with auto-confirmed email
2. User logs in → Backend returns access token
3. Token stored in localStorage for session persistence
4. Token sent with all API requests in Authorization header

### Task Hierarchy
- Maximum depth: 3 levels (Task → Subtask → Sub-subtask)
- Each subtask inherits parent color with lighter shades (progressive opacity overlay)
- Recursive rendering for nested display
- All tasks at all levels support drag-and-drop

### Drag and Drop System
- **Top-level tasks**: Can be dragged anywhere on the canvas
- **Subtasks**: Can be dragged onto other tasks to nest them, or onto canvas to make top-level
- **Trash zone**: Drag any task over the trash icon to delete
- **Visual feedback**: Custom drag layer for top-level tasks, opacity change for subtasks

### Auto-Save System
- All changes trigger a debounced save (1 second delay)
- Prevents excessive API calls during rapid edits
- Console logs confirm successful saves
- Graceful error handling with user feedback

### Search Algorithm
Scoring system for finding best match:
- Exact match: 100 points
- Starts with query: 80 points
- Contains query: 60 points
- Word matching: Proportional scoring (0-40 points)
- Searches recursively through all subtasks and all levels

### Double-Click Detection
- Custom implementation tracks click timestamps
- 300ms window for double-click detection
- Toggles collapse/expand state for task subtasks

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### App won't start
- Make sure you ran `npm install`
- Check that Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### Login fails
- Check your internet connection
- Make sure you're using a valid email format
- Password must be at least 6 characters

### Tasks not saving
- Check browser console for error messages
- Ensure you have a stable internet connection
- Try logging out and back in

### Drag and drop not working
- Make sure you're clicking and holding on the task card
- For top-level tasks, you can drop anywhere on the canvas
- For nesting, drop directly onto another task card
- Drop on the trash icon at the bottom to delete

## Development Notes

### Testing the Application
When grading, please test:
1. Creating multiple users and verifying data isolation
2. Creating tasks with different colors
3. Creating nested subtasks (up to 3 levels deep)
4. Editing task titles at all levels
5. Dragging tasks on the canvas (top-level)
6. Dragging subtasks to nest them or make them top-level
7. Collapsing/expanding tasks by double-clicking
8. Searching for tasks
9. Deleting tasks with the trash zone
10. Checking tasks as complete

### Code Comments
The code includes extensive comments explaining:
- State management patterns
- Recursive algorithms for task trees
- Authentication flow
- API integration
- Debouncing logic
- Drag and drop mechanics

## Future Enhancements (Not Implemented)
- Infinite nesting depth (currently limited to 3 levels)
- Undo/redo functionality
- Due dates and reminders
- Task priorities
- Collaborative lists
- Mobile responsive design
- Export/import functionality
- Keyboard shortcuts

## Author
Created for web development coursework

## License
Educational use only
