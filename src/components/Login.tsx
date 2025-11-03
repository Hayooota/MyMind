import React, { useState } from "react";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface LoginProps {
  onLogin: (accessToken: string, userId: string, name: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-44897ff9/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password, name }),
          }
        );

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
          throw new Error(signupData.error || "Sign up failed");
        }

        // Auto-login after signup
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

        if (!loginResponse.ok) {
          throw new Error(loginData.error || "Auto-login failed");
        }

        onLogin(loginData.accessToken, loginData.userId, loginData.name);
      } else {
        // Login
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

        if (!loginResponse.ok) {
          throw new Error(loginData.error || "Login failed");
        }

        onLogin(loginData.accessToken, loginData.userId, loginData.name);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#FAF9F6] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-8"
      >
        <h1 className="text-center mb-12 text-[#3D3630] opacity-80 text-4xl">
          My Mind
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
              />
            </motion.div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 bg-white/50 border border-[#3D3630]/10 rounded-2xl focus:outline-none focus:border-[#3D3630]/30 transition-colors placeholder:text-[#3D3630]/40"
          />

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#3D3630] text-white rounded-2xl hover:bg-[#3D3630]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : isSignUp ? "Sign Up" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full text-[#3D3630]/60 hover:text-[#3D3630] transition-colors"
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
