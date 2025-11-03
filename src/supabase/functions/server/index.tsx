import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to create Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper to create Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Helper to verify user from access token
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', userId: null };
  }

  const accessToken = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.error('Authorization error while verifying user:', error);
      return { error: 'Unauthorized', userId: null };
    }
    
    return { error: null, userId: user.id };
  } catch (err) {
    console.error('Exception during user verification:', err);
    return { error: 'Unauthorized', userId: null };
  }
};

// Health check endpoint
app.get("/make-server-44897ff9/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-44897ff9/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with auto-confirmed email since email server isn't configured
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Automatically confirm the user's email since an email server hasn't been configured
    });

    if (error) {
      console.error('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      userId: data.user.id,
      message: "User created successfully" 
    });
  } catch (err: any) {
    console.error('Exception during signup:', err);
    return c.json({ error: err.message || "Signup failed" }, 500);
  }
});

// Login endpoint
app.post("/make-server-44897ff9/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Error signing in user during login:', error);
      return c.json({ error: error?.message || "Login failed" }, 401);
    }

    return c.json({
      accessToken: data.session.access_token,
      userId: data.user.id,
      name: data.user.user_metadata?.name || "User",
    });
  } catch (err: any) {
    console.error('Exception during login:', err);
    return c.json({ error: err.message || "Login failed" }, 500);
  }
});

// Get tasks for authenticated user
app.get("/make-server-44897ff9/tasks", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyUser(authHeader);

  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const tasksKey = `user_${userId}_tasks`;
    const tasks = await kv.get(tasksKey);
    
    return c.json({ tasks: tasks || [] });
  } catch (err: any) {
    console.error('Error fetching tasks for user:', err);
    return c.json({ error: err.message || "Failed to fetch tasks" }, 500);
  }
});

// Save tasks for authenticated user
app.post("/make-server-44897ff9/tasks", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyUser(authHeader);

  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { tasks } = await c.req.json();

    if (!Array.isArray(tasks)) {
      return c.json({ error: "Tasks must be an array" }, 400);
    }

    const tasksKey = `user_${userId}_tasks`;
    await kv.set(tasksKey, tasks);
    
    return c.json({ success: true, message: "Tasks saved successfully" });
  } catch (err: any) {
    console.error('Error saving tasks for user:', err);
    return c.json({ error: err.message || "Failed to save tasks" }, 500);
  }
});

Deno.serve(app.fetch);