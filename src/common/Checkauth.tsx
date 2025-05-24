import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface User {
  role?: string;
}

interface CheckAuthProps {
  isAuthenticated: boolean;
  user: User | null;
  children: React.ReactNode;
}

const CheckAuth: React.FC<CheckAuthProps> = ({
  isAuthenticated,
  user,
  children,
}) => {
  const location = useLocation();

  // Check if token exists but auth state isn't ready yet
  const token = localStorage.getItem("token");
  const tokenExists = !!token;
  const roleFromStorage = localStorage.getItem("role");

  // If there's a token but Redux state hasn't been updated yet, temporarily consider user as authenticated
  const effectivelyAuthenticated = isAuthenticated || tokenExists;
  const effectiveRole = user?.role || roleFromStorage;

  // If we're loading, show a loading indicator
  if (tokenExists && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!effectivelyAuthenticated) {
    if (location.pathname !== "/login" && location.pathname !== "/signup") {
      return <Navigate to="/login" />;
    }
  } else {
    // Redirect from login/signup pages based on user role
    if (location.pathname === "/login" || location.pathname === "/signup") {
      if (effectiveRole === "expert") {
        return <Navigate to="/expert/dashboard" />;
      }
      if (effectiveRole === "player") {
        return <Navigate to="/player/dashboard" />;
      }
      if (effectiveRole === "sponsor") {
        return <Navigate to="/sponsor/dashboard" />;
      }
    }

    // Role-based route restrictions
    if (effectiveRole === "expert") {
      if (
        location.pathname.startsWith("/player") ||
        location.pathname.startsWith("/sponsor")
      ) {
        return <Navigate to="/unauthorized" />;
      }
    }
    if (effectiveRole === "player") {
      if (
        location.pathname.startsWith("/expert") ||
        location.pathname.startsWith("/sponsor")
      ) {
        return <Navigate to="/unauthorized" />;
      }
    }
    if (effectiveRole === "sponsor") {
      if (
        location.pathname.startsWith("/player") ||
        location.pathname.startsWith("/expert")
      ) {
        return <Navigate to="/unauthorized" />;
      }
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
