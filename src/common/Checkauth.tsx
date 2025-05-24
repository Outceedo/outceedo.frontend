import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface User {
  role?: string;
}

interface CheckAuthProps {
  isAuthenticated: boolean;
  user: User | null;
  children: React.ReactNode;
  onAuthCheck?: () => void; // Optional callback to trigger auth check
}

const CheckAuth: React.FC<CheckAuthProps> = ({
  isAuthenticated,
  user,
  children,
  onAuthCheck,
}) => {
  const location = useLocation();

  // Check if token exists but auth state isn't ready yet
  const token = localStorage.getItem("token");
  const tokenExists = !!token;
  const roleFromStorage = localStorage.getItem("role");

  // If there's a token but Redux state hasn't been updated yet, temporarily consider user as authenticated
  const effectivelyAuthenticated = isAuthenticated || tokenExists;
  const effectiveRole = user?.role || roleFromStorage;

  // Trigger auth check when component mounts if token exists but no user
  useEffect(() => {
    if (tokenExists && !user && onAuthCheck) {
      onAuthCheck();
    }
  }, [tokenExists, user, onAuthCheck]);

  // Handle loading state when we have a token but no user data yet
  if (tokenExists && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!effectivelyAuthenticated) {
    // Allow access to public routes
    if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/" ||
      location.pathname.startsWith("/public/")
    ) {
      return <>{children}</>;
    }

    // Redirect to login and remember the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle authenticated users
  else {
    // Redirect from login/signup pages based on user role
    if (location.pathname === "/login" || location.pathname === "/signup") {
      switch (effectiveRole) {
        case "expert":
          return <Navigate to="/expert/dashboard" replace />;
        case "player":
          return <Navigate to="/player/dashboard" replace />;
        case "sponsor":
          return <Navigate to="/sponsor/dashboard" replace />;
        case "team":
          return <Navigate to="/team/dashboard" replace />;
        default:
          // If role is unknown, redirect to a safe default
          return <Navigate to="/" replace />;
      }
    }

    // Handle role-based route restrictions
    const userRole = effectiveRole || "";

    // Define allowed path prefixes for each role
    const rolePathMap: Record<string, string[]> = {
      expert: ["/expert", "/", "/public"],
      player: ["/player", "/", "/public"],
      sponsor: ["/sponsor", "/", "/public"],
      team: ["/team", "/", "/public"],
    };

    // Check if current path is allowed for the user's role
    const allowedPaths = rolePathMap[userRole] || [];
    const isPathAllowed = allowedPaths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    if (!isPathAllowed) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
