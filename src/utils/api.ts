/**
 * api.ts - Backend API Client
 * 
 * This file provides a clean interface for communicating with the
 * Supabase Edge Function backend.
 * 
 * Architecture:
 * - Frontend (this file) → Supabase Edge Function → Database
 * - All requests go through the /make-server-44897ff9 route prefix
 * - Authentication via Bearer tokens in Authorization header
 * 
 * Error Handling:
 * - All functions throw errors on failure
 * - Calling code should wrap in try-catch
 * - Errors include server response for debugging
 * 
 * @module api
 */

import { projectId, publicAnonKey } from './supabase/info';
import { Task } from '../types';

/**
 * API Base URL
 * 
 * Constructed from Supabase project ID.
 * All API requests are prefixed with /make-server-44897ff9 for routing.
 * 
 * Format: https://[projectId].supabase.co/functions/v1/make-server-44897ff9
 * 
 * Example: 
 * https://abcdefghijk.supabase.co/functions/v1/make-server-44897ff9/signup
 */
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9`;

/**
 * API Client Object
 * 
 * Provides methods for all backend operations:
 * - Authentication (signup, login)
 * - Data operations (getTasks, saveTasks)
 * 
 * All methods are async and return Promises.
 */
export const api = {
  /**
   * Sign Up New User
   * 
   * Creates a new user account with Supabase Auth.
   * 
   * Flow:
   * 1. Send POST request to /signup endpoint
   * 2. Backend uses Supabase Auth Admin API to create user
   * 3. User's email is auto-confirmed (no email server configured)
   * 4. User metadata (name) is stored
   * 5. Returns success/error
   * 
   * After signup, user should login to get access token.
   * (Note: In our app, we auto-login after signup for better UX)
   * 
   * @param {string} email - User's email address (must be unique)
   * @param {string} password - User's password (min 6 characters)
   * @param {string} name - User's display name
   * @returns {Promise<any>} Success response from server
   * @throws {Error} If signup fails (duplicate email, weak password, etc.)
   * 
   * @example
   * try {
   *   await api.signup('user@example.com', 'password123', 'John Doe');
   *   // Now login to get access token
   * } catch (error) {
   *   console.error('Signup failed:', error.message);
   * }
   */
  async signup(email: string, password: string, name: string) {
    // Send POST request to signup endpoint
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use public anon key for unauthenticated requests
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      // Throw error with server's error message
      throw new Error(data.error || 'Signup failed');
    }

    // Return success response
    return data;
  },

  /**
   * Login Existing User
   * 
   * Authenticates a user and returns an access token.
   * 
   * Flow:
   * 1. Send POST request to /login endpoint
   * 2. Backend uses Supabase Auth signInWithPassword
   * 3. If credentials valid, returns access token
   * 4. Frontend stores token for authenticated requests
   * 
   * The access token should be:
   * - Stored in localStorage for session persistence
   * - Included in Authorization header for all authenticated requests
   * - Refreshed before expiry (not implemented yet)
   * 
   * Token Format: JWT (JSON Web Token)
   * Token Lifetime: 1 hour (Supabase default)
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{accessToken: string, userId: string, name: string}>}
   * @throws {Error} If login fails (wrong credentials, user not found, etc.)
   * 
   * @example
   * try {
   *   const { accessToken, userId, name } = await api.login(
   *     'user@example.com', 
   *     'password123'
   *   );
   *   // Store token
   *   localStorage.setItem('accessToken', accessToken);
   *   // Load user's data
   *   const tasks = await api.getTasks(accessToken);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   */
  async login(email: string, password: string) {
    // Send POST request to login endpoint
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use public anon key for unauthenticated requests
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      // Throw error with server's error message
      throw new Error(data.error || 'Login failed');
    }

    // Return authentication data
    // Contains: { accessToken, userId, name }
    return data;
  },

  /**
   * Get User's Tasks
   * 
   * Fetches all tasks for the authenticated user from the database.
   * 
   * Flow:
   * 1. Send GET request to /tasks endpoint
   * 2. Include access token in Authorization header
   * 3. Backend verifies token and extracts userId
   * 4. Backend loads tasks from KV store at key: user_{userId}_tasks
   * 5. Returns array of tasks (or empty array if no tasks)
   * 
   * Authentication:
   * - Requires valid access token
   * - Token verified by backend before accessing data
   * - User can ONLY access their own tasks (data isolation)
   * 
   * Data Structure:
   * - Returns Task[] (array of top-level tasks)
   * - Each task may have nested subtasks (recursive)
   * - Empty array returned if user has no tasks
   * 
   * @param {string} accessToken - JWT access token from login
   * @returns {Promise<Task[]>} Array of user's tasks
   * @throws {Error} If request fails (invalid token, network error, etc.)
   * 
   * @example
   * try {
   *   const tasks = await api.getTasks(accessToken);
   *   console.log(`Loaded ${tasks.length} tasks`);
   *   setTasks(tasks);
   * } catch (error) {
   *   console.error('Failed to load tasks:', error.message);
   *   // Possibly prompt user to login again
   * }
   */
  async getTasks(accessToken: string): Promise<Task[]> {
    // Send GET request to tasks endpoint
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'GET',
      headers: {
        // Use access token for authenticated request
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      // Log detailed error for debugging
      console.error('Error fetching tasks:', data.error);
      // Throw user-friendly error
      throw new Error(data.error || 'Failed to fetch tasks');
    }

    // Return tasks array
    // Backend sends: { tasks: Task[] }
    return data.tasks;
  },

  /**
   * Save User's Tasks
   * 
   * Persists the entire task tree to the database.
   * 
   * Flow:
   * 1. Send POST request to /tasks endpoint
   * 2. Include access token in Authorization header
   * 3. Include tasks array in request body
   * 4. Backend verifies token and extracts userId
   * 5. Backend saves tasks to KV store at key: user_{userId}_tasks
   * 6. Returns success confirmation
   * 
   * Behavior:
   * - Completely replaces existing tasks (not a merge/patch)
   * - All tasks in array are saved (including nested subtasks)
   * - Previous tasks are overwritten
   * 
   * Optimization:
   * - In App.tsx, this is called via debounced auto-save
   * - Only saves once per second (prevents excessive API calls)
   * - User doesn't need to manually save
   * 
   * @param {string} accessToken - JWT access token from login
   * @param {Task[]} tasks - Complete array of tasks to save
   * @returns {Promise<any>} Success response from server
   * @throws {Error} If save fails (invalid token, network error, etc.)
   * 
   * @example
   * try {
   *   await api.saveTasks(accessToken, tasks);
   *   console.log('Tasks saved successfully');
   * } catch (error) {
   *   console.error('Failed to save tasks:', error.message);
   *   // Could show toast notification to user
   * }
   */
  async saveTasks(accessToken: string, tasks: Task[]) {
    // Send POST request to tasks endpoint
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use access token for authenticated request
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tasks }),
    });

    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      // Log detailed error for debugging
      console.error('Error saving tasks:', data.error);
      // Throw user-friendly error
      throw new Error(data.error || 'Failed to save tasks');
    }

    // Return success response
    return data;
  },
};

/**
 * ERROR HANDLING EXAMPLES:
 * 
 * 1. Network error (offline):
 * ```typescript
 * try {
 *   await api.getTasks(token);
 * } catch (error) {
 *   // error.message might be "Failed to fetch"
 *   // Show offline indicator to user
 * }
 * ```
 * 
 * 2. Invalid token (expired or wrong):
 * ```typescript
 * try {
 *   await api.getTasks(token);
 * } catch (error) {
 *   // error.message might be "Unauthorized"
 *   // Redirect to login page
 * }
 * ```
 * 
 * 3. Duplicate email on signup:
 * ```typescript
 * try {
 *   await api.signup('existing@email.com', 'pass', 'Name');
 * } catch (error) {
 *   // error.message might be "User already exists"
 *   // Show error message in form
 * }
 * ```
 */

/**
 * SECURITY NOTES:
 * 
 * 1. Public Anon Key:
 *    - Safe to expose (it's in the frontend)
 *    - Used for unauthenticated endpoints (signup, login)
 *    - Restricted by Row Level Security in Supabase
 * 
 * 2. Access Token:
 *    - JWT contains user ID (not password)
 *    - Verified on backend for each request
 *    - Expires after 1 hour (Supabase default)
 *    - Should be refreshed before expiry (not implemented)
 * 
 * 3. Service Role Key:
 *    - NEVER sent to frontend
 *    - Only used in Edge Function
 *    - Has full database access (admin)
 *    - Required for Auth Admin API (creating users)
 * 
 * 4. Data Isolation:
 *    - Each user can only access their own data
 *    - Backend enforces this by verifying token
 *    - KV keys include userId: user_{userId}_tasks
 *    - No way for User A to access User B's tasks
 */

/**
 * FUTURE ENHANCEMENTS:
 * 
 * 1. Token Refresh:
 *    - Check token expiry before each request
 *    - Refresh if about to expire
 *    - Seamless for user (no re-login)
 * 
 * 2. Optimistic Updates:
 *    - Update UI immediately
 *    - Save in background
 *    - Rollback if save fails
 * 
 * 3. Offline Support:
 *    - Queue changes while offline
 *    - Sync when back online
 *    - Conflict resolution
 * 
 * 4. Request Cancellation:
 *    - Cancel in-flight requests on component unmount
 *    - Prevents memory leaks
 *    - Use AbortController
 * 
 * 5. Retry Logic:
 *    - Retry failed requests (e.g., 3 times)
 *    - Exponential backoff
 *    - Only for network errors, not auth errors
 */
