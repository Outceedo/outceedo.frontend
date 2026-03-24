import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface User {
  role?: string;
  isBan?: boolean;
  isSuspended?: boolean;
}

interface CheckAuthProps {
  isAuthenticated: boolean;
  user: User | null;
  children: React.ReactNode;
  onAuthCheck?: () => void;
}

const CheckAuth: React.FC<CheckAuthProps> = ({
  isAuthenticated,
  user,
  children,
  onAuthCheck,
}) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const tokenExists = !!token;
  const roleFromStorage = localStorage.getItem("role");

  const effectivelyAuthenticated = isAuthenticated || tokenExists;
  const effectiveRole = user?.role || roleFromStorage;

  // Check if user is banned or suspended
  const isBan = user?.isBan || localStorage.getItem("isBan") === "true";
  const isSuspended =
    user?.isSuspended || localStorage.getItem("isSuspended") === "true";

  useEffect(() => {
    if (tokenExists && !user && onAuthCheck) {
      onAuthCheck();
    }
  }, [tokenExists, user, onAuthCheck]);

  if (tokenExists && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!effectivelyAuthenticated) {
    if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/" ||
      location.pathname.startsWith("/public/")
    ) {
      return <>{children}</>;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect banned or suspended users to /banned page
  if ((isBan || isSuspended) && location.pathname !== "/banned") {
    return <Navigate to="/banned" replace />;
  }

  // Handle authenticated users
  else {
    // If authenticated user is on root path, redirect to their profile
    if (location.pathname === "/") {
      switch (effectiveRole) {
        case "expert":
          return <Navigate to="/expert/profile" replace />;
        case "player":
          return <Navigate to="/player/profile" replace />;
        case "sponsor":
          return <Navigate to="/sponsor/profile" replace />;
        case "team":
          return <Navigate to="/team/profile" replace />;
        case "user":
        case "fan":
          return <Navigate to="/fan/profile" replace />; // Changed to dashboard since that's what you have for admin
        default:
          return <Navigate to="/" replace />;
      }
    }

    // If authenticated user is on login or signup, redirect to their profile
    if (location.pathname === "/login" || location.pathname === "/signup") {
      switch (effectiveRole) {
        case "expert":
          return <Navigate to="/expert/profile" replace />;
        case "player":
          return <Navigate to="/player/profile" replace />;
        case "sponsor":
          return <Navigate to="/sponsor/profile" replace />;
        case "team":
          return <Navigate to="/team/profile" replace />;
        case "user":
        case "fan":
          return <Navigate to="/fan/profile" replace />;

        default:
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
      user: ["/fan", "/", "/public"],
      fan: ["/fan", "/", "/public"],
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
