import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import EmailVerification from "./Pages/EmailVerification";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Detailsform from "./Pages/Detailsform";
import SignUp from "./Pages/Signup";
import ResetPassword from "./Pages/Resetpassword";
import Profile from "./Playerpages/playerprofile";
import Dashboard from "./Playerpages/dashboard";
import Matches from "./Playerpages/matches";
import MyBooking from "./Playerpages/mybooking";
import Experts from "./Playerpages/experts";
import Expertspage from "./Playerpages/expertspage";
import ExpertMedia from "./expertpages/expertmedia";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { validateToken } from "./store/auth-slice";
import CheckAuth from "./common/Checkauth";
import PlayerLayout from "./components/player/layout";
import ExpertLayout from "./components/expert/layout";
import PlayersProfile from "./expertpages/playerProfiles";
import ExpertviewProfile from "./expertpages/playerinfo";
import ExpertProfileDetails from "./expertpages/Expertdetails";
import ExpertProfile from "./expertpages/expertdata";
import ExpertDashboard from "./expertpages/Dashboard";
import BookingExpertside from "./expertpages/Bookings";
import ExpertMatches from "./expertpages/ExpertMatches";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/emailverification" element={<EmailVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/df37a6d56f5230c1a07f97fa0cb6f8bf1e6530214a0f5ad288dc7c20580ff08cc6948710"
          element={<ResetPassword />}
        />

        {/* Protected routes - you need to wrap each Route with CheckAuth */}
        <Route
          path="/detailsform"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Detailsform />
            </CheckAuth>
          }
        />

        {/* Player pages */}

        <Route
          path="/player"
          element={
            // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <PlayerLayout />
            // </CheckAuth>
          }
        >
          <Route
            path="/player/dashboard"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Dashboard />
              // </CheckAuth>
            }
          />
          <Route
            path="/player/matches"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Matches />
              // </CheckAuth>
            }
          />
          <Route
            path="/player/mybooking"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <MyBooking />
              // {/* </CheckAuth> */}
            }
          />
          <Route
            path="/player/viewexperts"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Expertspage />
              // {/* </CheckAuth> */}
            }
          />
          <Route
            path="/player/exdetails"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Experts />
              // </CheckAuth>
            }
          />
          <Route
            path="/player/profile"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Profile />
              // {/* </CheckAuth> */}
            }
          />
        </Route>

        {/* Expert Outlet */}
        <Route path="/expert" element={<ExpertLayout />}>
          <Route
            path="/expert/dashboard"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertDashboard />
              // </CheckAuth>
            }
          />
          <Route
            path="/expert/matches"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertMatches />
              // </CheckAuth>
            }
          />
          <Route
            path="/expert/mybooking"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <BookingExpertside />
              // </CheckAuth>
            }
          />
          <Route
            path="/expert/viewplayers"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <PlayersProfile />
              // </CheckAuth>
            }
          />
          <Route
            path="/expert/profile"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertProfile />
              // </CheckAuth>
            }
          />
          <Route
            path="/expertmedia"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertMedia />
              // </CheckAuth>
            }
          />
          <Route
            path="/expert/playerinfo"
            element={
              // <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertviewProfile />
              // </CheckAuth>
            }
          />
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
