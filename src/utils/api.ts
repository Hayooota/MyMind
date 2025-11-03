import { projectId, publicAnonKey } from './supabase/info';
import { TodoList } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9`;

export const api = {
  async signup(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  async getLists(accessToken: string): Promise<TodoList[]> {
    const response = await fetch(`${API_BASE}/lists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error fetching lists:', data.error);
      throw new Error(data.error || 'Failed to fetch lists');
    }

    return data.lists;
  },

  async saveLists(accessToken: string, lists: TodoList[]) {
    const response = await fetch(`${API_BASE}/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ lists }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error saving lists:', data.error);
      throw new Error(data.error || 'Failed to save lists');
    }

    return data;
  },
};
