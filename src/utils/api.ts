import { projectId, publicAnonKey } from './supabase/info';
import { Task } from '../types';

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

  async getTasks(accessToken: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error fetching tasks:', data.error);
      throw new Error(data.error || 'Failed to fetch tasks');
    }

    return data.tasks;
  },

  async saveTasks(accessToken: string, tasks: Task[]) {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tasks }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error saving tasks:', data.error);
      throw new Error(data.error || 'Failed to save tasks');
    }

    return data;
  },
};
