import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
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
import SponserLayout from "./components/sponser/layout";
//expertpage
import PlayersProfile from "./expertpages/playerProfiles";
import ExpertviewProfile from "./expertpages/playerinfo";
import ExpertProfile from "./expertpages/expertdata";
import ExpertDashboard from "./expertpages/Dashboard";
import BookingExpertside from "./expertpages/Bookings";
import ExpertMatches from "./expertpages/ExpertMatches";
import { authService } from "./store/apiConfig";
//sponser pages

import Sponserdashboard from "./SponserPages/Sponserdashboard";

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

  const navigate = useNavigate(); // Debug logging

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

  function handleNav() {
    const role = localStorage.getItem("role");
    if (role === "player") {
      navigate("/player/dashboard");
    } else if (role === "expert") {
      navigate("/expert/dashboard");
    } else if (role === "sponser") {
      navigate("/sponser/dashboard");
    }
  }

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
                user?.role === "player"
                  ? "/player/dashboard"
                  : user?.role === "expert"
                  ? "/expert/dashboard"
                  : "/sponser/dashboard"
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
                user?.role === "player"
                  ? "/player/dashboard"
                  : user?.role === "expert"
                  ? "/expert/dashboard"
                  : "/sponser/dashboard"
              }
            />
          ) : (
            <SignUp />
          )
        }
      />
      <Route path="/reset-password/:id" element={<ResetPassword />} />

      {/* Protected routes */}

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
        <Route path="details-form" element={<Detailsform />} />
        <Route path="book" element={<BookingCalendar />} />
        <Route path="sponsors" element={<>Player sponsers</>} />
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
        <Route path="details-form" element={<Detailsform />} />
        <Route path="sponsors" element={<>Expert sponsers</>} />
      </Route>

      {/* Sponser routes */}
      <Route
        path="/sponser"
        element={
          <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
            <SponserLayout />
          </CheckAuth>
        }
      >
        <Route path="dashboard" element={<Sponserdashboard />} />
        <Route path="players" element={<>sponser players</>} />
        <Route path="experts" element={<>sponser experts</>} />
        <Route path="application" element={<>sponser application</>} />
        <Route path="profile" element={<>Sponser profile</>} />
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
                onClick={handleNav}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
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
