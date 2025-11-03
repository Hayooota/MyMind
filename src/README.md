# My Mind - Hierarchical Todo List Application

A beautiful, minimalist web application for managing hierarchical todo lists with multi-user support.

## Demo Video
[Insert your Loom/screen recording link here - max 5 minutes]

## Features

### Core Functionality
- ✅ **Multiple Users**: Each user has their own account with secure authentication
- ✅ **User Isolation**: Users can only see and modify their own tasks
- ✅ **Multiple Lists**: Create and manage multiple todo lists
- ✅ **Hierarchical Tasks**: Support for nested subtasks up to 3 levels deep
- ✅ **Task Management**: Create, edit, delete, and complete tasks
- ✅ **Collapse/Expand**: Hide or show subtasks by double-clicking on tasks
- ✅ **Move Between Lists**: Move top-level tasks between different lists
- ✅ **Search**: Find tasks across your lists with intelligent search
- ✅ **Persistent Storage**: All data is saved to a secure database (Supabase)

### User Interface
- Clean, minimalist design with off-white background (#FAF9F6)
- Josefin Sans typography throughout
- Color-coded tasks using Notion's color palette
- Infinite canvas for spatial organization of tasks
- Smooth animations and transitions
- Drag-and-drop task positioning
- Trash zone for easy deletion

## Project Structure

```
├── App.tsx                      # Main application component with state management
├── components/
│   ├── Login.tsx               # Authentication (login/signup)
│   ├── Header.tsx              # Top navigation bar with search and create
│   ├── ListsSidebar.tsx        # Sidebar for managing multiple lists
│   ├── InfiniteCanvas.tsx      # Main canvas for displaying tasks
│   ├── TaskCard.tsx            # Individual task component with subtasks
│   ├── ColorPalette.tsx        # Color picker for tasks
│   ├── MoveTaskDialog.tsx      # Dialog for moving tasks between lists
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

### Managing Lists
- **Create List**: Click the + icon in the Lists sidebar
- **Switch Lists**: Click on any list name to view its tasks
- **Rename List**: Click the edit icon next to a list name
- **Delete List**: Click the trash icon (only if you have more than one list)

### Managing Tasks
- **Create Task**: Click the + icon in the header, enter task name, select a color
- **Edit Task**: Hover over a task and click the edit icon
- **Complete Task**: Click the checkbox next to the task
- **Delete Task**: Drag the task to the trash zone at the bottom
- **Move Task**: Drag and drop tasks on the canvas to reposition them

### Working with Subtasks
- **Add Subtask**: Click the + icon within a task (up to 3 levels deep)
- **Collapse/Expand**: Double-click on a task to hide/show its subtasks
- **Nested Hierarchy**: Subtasks inherit their parent's color with progressively lighter shades

### Moving Tasks Between Lists
- **Move Task**: Click the arrow icon on a top-level task, select the target list

### Searching
- Click the search icon in the header, type your query, and press Enter
- The canvas will center on the best matching task

## MVP Requirements Checklist

- ✅ Multiple users with authentication
- ✅ Each user only sees their own tasks
- ✅ Users cannot modify other users' tasks
- ✅ Mark tasks as complete (checkbox)
- ✅ Collapse/expand tasks (double-click)
- ✅ Move top-level tasks between lists (arrow button + dialog)
- ✅ Durable storage (Supabase PostgreSQL)
- ✅ Create, edit, and delete tasks and lists
- ✅ Hierarchical structure up to 3 levels deep

## Code Architecture

### Frontend (App.tsx)
The main application manages:
- Authentication state and user session
- Multiple todo lists with current list selection
- All CRUD operations for lists and tasks
- Auto-save functionality (debounced to 1 second)
- Task search and navigation

### Backend (supabase/functions/server/index.tsx)
The Hono server provides:
- `/signup` - Create new user accounts
- `/login` - Authenticate users
- `/lists` - GET/POST endpoints for loading and saving lists
- User verification middleware for protected routes
- Error handling and logging

### Data Model
```typescript
interface TodoList {
  id: string;
  name: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  color: NotionColor;
  x: number;
  y: number;
  completed: boolean;
  collapsed: boolean;
  subtasks: Task[];
  parentId?: string;
}
```

### Database Schema
- User authentication managed by Supabase Auth
- Lists stored in KV store with key: `user_{userId}_lists`
- Each user's data is completely isolated

## Key Implementation Details

### Authentication Flow
1. User signs up → Backend creates user with auto-confirmed email
2. User logs in → Backend returns access token
3. Token stored in localStorage for persistence
4. Token sent with all API requests for authorization

### Task Hierarchy
- Maximum 3 levels: Task → Subtask → Sub-subtask
- Each subtask inherits parent color with lighter shades
- Recursive rendering and state management
- Drag-and-drop supports moving tasks within hierarchy

### Auto-Save System
- All changes trigger a debounced save (1 second delay)
- Prevents excessive API calls during rapid edits
- Console logs confirm successful saves
- Error handling with user feedback

### Search Algorithm
- Exact match: 100 points
- Starts with query: 80 points
- Contains query: 60 points
- Word matching: Proportional scoring
- Searches recursively through all subtasks

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

## Development Notes

### Testing the Application
When grading, please test:
1. Creating multiple users and verifying data isolation
2. Creating multiple lists and switching between them
3. Creating tasks with subtasks (up to 3 levels)
4. Editing task titles
5. Moving tasks between lists using the arrow button
6. Collapsing/expanding tasks by double-clicking
7. Searching for tasks
8. Dragging tasks on the canvas
9. Deleting tasks with the trash zone

### Code Comments
The code includes extensive comments explaining:
- State management patterns
- Recursive algorithms for task trees
- Authentication flow
- API integration
- Debouncing logic

## Future Enhancements (Not Implemented)
- Infinite nesting depth (currently limited to 3 levels)
- Arbitrary task movement between any subtask levels
- Unit tests
- Due dates and reminders
- Task priorities
- Collaborative lists
- Mobile responsive design improvements

## Author
Created for CS/IS 340 Web Development assignment

## License
Educational use only
