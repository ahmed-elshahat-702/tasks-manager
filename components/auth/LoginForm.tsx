"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  setIsAuthenticated: (value: boolean) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

export function LoginForm({
  setIsAuthenticated,
  username,
  setUsername,
  password,
  setPassword,
}: LoginFormProps) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] =
    useState(false);

  // Validation rules
  const isUsernameValid = username.length >= 3;
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = !isLogin ? confirmPassword === password : true;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setShowUsernameError(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setShowPasswordError(true);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setShowConfirmPasswordError(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show all validation messages on submit
    setShowUsernameError(true);
    setShowPasswordError(true);

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setIsAuthenticated(true);
      toast({
        title: "Logged In",
        description: "You have successfully logged in.",
      });
    } catch (err) {
      const error = err as AxiosError;
      toast({
        title: "Login Failed",
        description:
          (error.response?.data as { message?: string })?.message ||
          "Invalid username or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show all validation messages on submit
    setShowUsernameError(true);
    setShowPasswordError(true);
    setShowConfirmPasswordError(true);

    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/register", {
        username,
        password,
      });

      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
      setIsLogin(true);
    } catch (err) {
      const error = err as AxiosError;
      toast({
        title: "Signup Failed",
        description:
          (error.response?.data as { message: string })?.message ||
          "Error creating account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">
          {isLogin ? "Login to Sticky Wall" : "Create an Account"}
        </h1>
        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="space-y-4"
        >
          <Input
            name="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            disabled={isLoading}
            className={
              showUsernameError && !isUsernameValid ? "border-red-500" : ""
            }
          />
          {showUsernameError && !isUsernameValid && (
            <p className="text-sm text-red-500">
              Username must be at least 3 characters long.
            </p>
          )}

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              className={
                showPasswordError && !isPasswordValid ? "border-red-500" : ""
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              {showPassword ? (
                <Eye className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          {showPasswordError && !isPasswordValid && (
            <p className="text-sm text-red-500">
              Password must be at least 6 characters long.
            </p>
          )}

          {!isLogin && (
            <>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                  className={
                    showConfirmPasswordError && !isConfirmPasswordValid
                      ? "border-red-500"
                      : ""
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {showConfirmPasswordError && !isConfirmPasswordValid && (
                <p className="text-sm text-red-500">Passwords do not match.</p>
              )}
            </>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </Button>
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:underline"
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
