/**
 * Login.tsx - Authentication Component
 * 
 * This component handles both user login and signup functionality.
 * It provides a clean, centered interface for authentication with smooth animations.
 * 
 * Features:
 * - Toggle between login and signup modes
 * - Form validation (email, password, name for signup)
 * - Error handling with user feedback
 * - Loading states during API calls
 * - Auto-login after successful signup
 * - Smooth animations using Motion
 * 
 * @component
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

/**
 * Props interface for the Login component
 * @interface LoginProps
 * @property {Function} onLogin - Callback function triggered on successful authentication
 *                                 Receives: accessToken (string), userId (string), name (string)
 */
interface LoginProps {
  onLogin: (accessToken: string, userId: string, name: string) => void;
}

/**
 * Login Component
 * 
 * Renders a centered authentication form that handles both login and signup.
 * The form includes smooth transitions when switching between modes.
 */
export function Login({ onLogin }: LoginProps) {
  // State: Toggle between signup (true) and login (false) modes
  const [isSignUp, setIsSignUp] = useState(false);
  
  // State: User's full name (only required for signup)
  const [name, setName] = useState("");
  
  // State: User's email address (required for both login and signup)
  const [email, setEmail] = useState("");
  
  // State: User's password (required for both login and signup)
  const [password, setPassword] = useState("");
  
  // State: Error message to display to user (empty string = no error)
  const [error, setError] = useState("");
  
  // State: Loading indicator during API calls (prevents duplicate submissions)
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission for both login and signup
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Clear any previous errors
   * 3. Set loading state
   * 4. If signup: Create user account, then auto-login
   * 5. If login: Authenticate user
   * 6. On success: Call onLogin callback with user data
   * 7. On error: Display error message to user
   * 8. Finally: Clear loading state
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setError(""); // Clear any previous error messages
    setLoading(true); // Show loading indicator

    try {
      // SIGNUP FLOW
      if (isSignUp) {
        // Step 1: Create new user account via backend API
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`, // Public anon key for unauthenticated requests
            },
            body: JSON.stringify({ email, password, name }),
          }
        );

        const signupData = await signupResponse.json();

        // Check if signup was successful
        if (!signupResponse.ok) {
          throw new Error(signupData.error || "Sign up failed");
        }

        // Step 2: Auto-login after successful signup
        // This provides a seamless experience for new users
        const loginResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const loginData = await loginResponse.json();

        // Check if auto-login was successful
        if (!loginResponse.ok) {
          throw new Error(loginData.error || "Auto-login failed");
        }

        // Step 3: Pass authentication data to parent component
        onLogin(loginData.accessToken, loginData.userId, loginData.name);
      } 
      // LOGIN FLOW
      else {
        // Authenticate existing user via backend API
        const loginResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const loginData = await loginResponse.json();

        // Check if login was successful
        if (!loginResponse.ok) {
          throw new Error(loginData.error || "Login failed");
        }

        // Pass authentication data to parent component
        onLogin(loginData.accessToken, loginData.userId, loginData.name);
      }
    } catch (err: any) {
      // Log error to console for debugging
      console.error("Authentication error:", err);
      // Display user-friendly error message
      setError(err.message || "Something went wrong");
    } finally {
      // Always clear loading state, whether success or failure
      setLoading(false);
    }
  };

  return (
    // Full-screen container with off-white background
    // Centered both horizontally and vertically
    <div className="w-screen h-screen bg-[#FAF9F6] flex items-center justify-center">
      {/* Animated form container with fade-in and slide-up effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Start invisible and slightly below
        animate={{ opacity: 1, y: 0 }}   // Fade in and slide to position
        transition={{ duration: 0.5 }}   // Animation takes 0.5 seconds
        className="w-full max-w-md px-8"
      >
        {/* Application title */}
        <h1 className="text-center mb-12 text-[#3D3630] opacity-80 text-4xl">
          My Mind
        </h1>

        {/* Authentication form - centered for better alignment */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          <div className="w-full space-y-6">
            {/* Name field - only visible in signup mode */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}    // Start collapsed
                animate={{ opacity: 1, height: "auto" }} // Expand smoothly
                exit={{ opacity: 0, height: 0 }}       // Collapse when hidden
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp} // Only required in signup mode
                  className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
                />
              </motion.div>
            )}

            {/* Email field - always visible */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
            />

            {/* Password field - always visible */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
            />

            {/* Error message display - only visible when error exists */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }} // Fade in smoothly
                animate={{ opacity: 1 }}
                className="text-red-500 text-center text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Submit button - changes text based on mode and loading state */}
          <button
            type="submit"
            disabled={loading} // Prevent multiple submissions
            className="w-full max-w-xs py-4 bg-[#3D3630] text-white rounded-2xl hover:bg-[#3D3630]/90 transition-colors disabled:opacity-50 text-center"
          >
            {loading ? "..." : isSignUp ? "Sign Up" : "Login"}
          </button>

          {/* Toggle button to switch between login and signup modes */}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp); // Toggle mode
              setError("");           // Clear any error messages
            }}
            className="w-full max-w-xs text-[#3D3630]/60 hover:text-[#3D3630] transition-colors text-center"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
