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

  // ✅ ONLY trust Redux (user)
  const effectivelyAuthenticated = isAuthenticated || tokenExists;
  const effectiveRole = user?.role;

  const isBan = user?.isBan;
  const isSuspended = user?.isSuspended;

  // ✅ Trigger validation if token exists but user not loaded
  useEffect(() => {
    if (tokenExists && !user && onAuthCheck) {
      onAuthCheck();
    }
  }, [tokenExists, user, onAuthCheck]);

  // ✅ WAIT until user is loaded (prevents flicker + wrong redirects)
  if (tokenExists && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // ❌ Not authenticated → allow public routes or redirect
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

  // 🚨 CRITICAL: Ban/Suspend check (NOW RELIABLE)
  if ((isBan || isSuspended) && location.pathname !== "/banned") {
    return <Navigate to="/banned" replace />;
  }

  // ✅ Authenticated users logic
  if (effectiveRole) {
    // Redirect root → profile
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
          return <Navigate to="/fan/profile" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }

    // Redirect login/signup → profile
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

    // ✅ Role-based route protection
    const rolePathMap: Record<string, string[]> = {
      expert: ["/expert", "/", "/public"],
      player: ["/player", "/", "/public"],
      sponsor: ["/sponsor", "/", "/public"],
      team: ["/team", "/", "/public"],
      user: ["/fan", "/", "/public"],
      fan: ["/fan", "/", "/public"],
    };

    const allowedPaths = rolePathMap[effectiveRole] || [];

    const isPathAllowed = allowedPaths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`),
    );

    if (!isPathAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
