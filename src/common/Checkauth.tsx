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

  if (!isAuthenticated) {
    if (location.pathname !== "/login" && location.pathname !== "/signup") {
      return <Navigate to="/login" />;
    }
  } else {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      return <Navigate to="/dashboard" />;
    }
    if (user?.role === "expert" && location.pathname.startsWith("/player")) {
      return <Navigate to="/unauthorized" />;
    }
    if (user?.role === "player" && location.pathname.startsWith("/expert")) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
