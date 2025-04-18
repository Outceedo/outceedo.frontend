import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
//pages
import HomePage from "./Pages/HomePage";
import EmailVerification from "./Pages/EmailVerification";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Detailsform from "./Pages/Detailsform";
import SignUp from "./Pages/Signup";
import ResetPassword from "./Pages/Resetpassword";
//playerpage
import Profile from "./Playerpages/playerprofile";
import Dashboard from "./Playerpages/dashboard";
import Matches from "./Playerpages/matches";
import MyBooking from "./Playerpages/mybooking";
import Experts from "./Playerpages/experts";
import Expertspage from "./Playerpages/expertspage";
import AssessmentReport from "./Playerpages/AssessmentReport";
import BookingCalendar from "./Playerpages/BookService";
//store
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { validateToken, initializeFromLocalStorage } from "./store/auth-slice";
//common
import CheckAuth from "./common/Checkauth";
//components
import PlayerLayout from "./components/player/layout";
import ExpertLayout from "./components/expert/layout";
//expertpage
import PlayersProfile from "./expertpages/playerProfiles";
import ExpertviewProfile from "./expertpages/playerinfo";
import ExpertProfile from "./expertpages/expertdata";
import ExpertDashboard from "./expertpages/Dashboard";
import BookingExpertside from "./expertpages/Bookings";
import ExpertMatches from "./expertpages/ExpertMatches";
import { authService } from "./store/apiConfig";

// Set up authorization headers from localStorage immediately before rendering
const token = localStorage.getItem("token");
if (token) {
  authService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, tokenValidationInProgress } = useAppSelector(
    (state) => state.auth
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const hasToken = !!localStorage.getItem("token");

  // Debug logging
  console.log("Token:", localStorage.getItem("token"));
  console.log("User:", user);
  console.log("Is Authenticated:", isAuthenticated);
  console.log("Token Validation In Progress:", tokenValidationInProgress);

  useEffect(() => {
    const initApp = async () => {
      try {
        // First initialize from localStorage
        dispatch(initializeFromLocalStorage());

        // Set a short timeout to allow UI to reflect localStorage state first
        if (hasToken) {
          // Only validate if we actually have a token to validate
          await dispatch(validateToken()).unwrap();
        }
      } catch (error) {
        console.error("Failed to validate token:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, [dispatch, hasToken]);

  // Show loading state during initial authentication check
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-700">Authenticating...</span>
      </div>
    );
  }

  // Effective authentication check (use token presence as backup)
  const effectivelyAuthenticated = isAuthenticated || hasToken;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Public routes */}
      <Route path="/emailverification" element={<EmailVerification />} />
      <Route
        path="/login"
        element={
          effectivelyAuthenticated ? (
            <Navigate
              to={
                user?.role === "expert"
                  ? "/expert/dashboard"
                  : "/player/dashboard"
              }
            />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route
        path="/signup"
        element={
          effectivelyAuthenticated ? (
            <Navigate
              to={
                user?.role === "expert"
                  ? "/expert/dashboard"
                  : "/player/dashboard"
              }
            />
          ) : (
            <SignUp />
          )
        }
      />
      <Route
        path="/df37a6d56f5230c1a07f97fa0cb6f8bf1e6530214a0f5ad288dc7c20580ff08cc6948710"
        element={<ResetPassword />}
      />

      {/* Protected routes */}
      <Route
        path="/details-form"
        element={
          <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
            <Detailsform />
          </CheckAuth>
        }
      />

      {/* Player pages */}
      <Route
        path="/player"
        element={
          <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
            <PlayerLayout />
          </CheckAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="matches" element={<Matches />} />
        <Route path="mybooking" element={<MyBooking />} />
        <Route path="AssessmentReport" element={<AssessmentReport />} />
        <Route path="viewexperts" element={<Expertspage />} />
        <Route path="exdetails" element={<Experts />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Expert Outlet */}
      <Route
        path="/expert"
        element={
          <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
            <ExpertLayout />
          </CheckAuth>
        }
      >
        <Route path="dashboard" element={<ExpertDashboard />} />
        <Route path="matches" element={<ExpertMatches />} />
        <Route path="mybooking" element={<BookingExpertside />} />
        <Route path="viewplayers" element={<PlayersProfile />} />
        <Route path="profile" element={<ExpertProfile />} />
        <Route path="playerinfo" element={<ExpertviewProfile />} />
      </Route>

      <Route
        path="/unauthorized"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                Unauthorized Access
              </h1>
              <p className="text-gray-700">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
      <Route path="/book" element={<BookingCalendar />} />
    </Routes>
  );
};

// Navigate component for redirects
const Navigate = ({ to }: { to: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
};

// Main App component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
