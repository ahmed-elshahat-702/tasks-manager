"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import axios from "axios";
import Dashboard from "@/components/dashboard/Dashboard";
import { AlertCircle, Loader } from "lucide-react";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check authentication status when page loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/check");
        console.log(response.data);

        // When no token found, just set authenticated to false without error
        if (!response.data.isAuthenticated) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(response.data.isAuthenticated);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setIsAuthenticated(false);

        // Handle 401 Unauthorized specifically by just showing login form
        if (error.response?.status === 401) {
          return;
        }

        // For other errors, show error message
        const errorMessage =
          error.response?.data?.message ||
          "Failed to check authentication status. Please try again later.";
        setError(errorMessage);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader className="h-6 w-6 animate-pulse" aria-hidden="true" />
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Show error state only for actual errors
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-red-700">Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated (including when no token found)
  if (!isAuthenticated) {
    return (
      <LoginForm
        setIsAuthenticated={setIsAuthenticated}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  return (
    <Dashboard
      setIsAuthenticated={setIsAuthenticated}
      setUsername={setUsername}
      setPassword={setPassword}
    />
  );
}
