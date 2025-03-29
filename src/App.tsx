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
import ExpertData from "./expertpages/expertdata";
import ExpertNavbar from "./expertpages/expertNavbar";
import PlayerPage from "./expertpages/playerpage";
import Player from "./expertpages/player";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { validateToken } from "./store/auth-slice";
import CheckAuth from "./common/Checkauth";

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
          path="/profile"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Profile />
            </CheckAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Dashboard />
            </CheckAuth>
          }
        />

        <Route
          path="/matches"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Matches />
            </CheckAuth>
          }
        />

        <Route
          path="/mybooking"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <MyBooking />
            </CheckAuth>
          }
        />

        <Route
          path="/viewexperts"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Expertspage />
            </CheckAuth>
          }
        />
        <Route
          path="/exdetails"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Experts />
            </CheckAuth>
          }
        />

        {/* Expert pages */}
        <Route
          path="/expertmedia"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertMedia />
            </CheckAuth>
          }
        />

        <Route
          path="/expertData"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertData />
            </CheckAuth>
          }
        />

        <Route
          path="/expertspage"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Expertspage />
            </CheckAuth>
          }
        />

        <Route
          path="/expertNavbar"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ExpertNavbar />
            </CheckAuth>
          }
        />

        <Route
          path="/playerpage"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <PlayerPage />
            </CheckAuth>
          }
        />

        <Route
          path="/player"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Player />
            </CheckAuth>
          }
        />

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
