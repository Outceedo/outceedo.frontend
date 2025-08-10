import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";

//pages
import HomePage from "./Pages/Home/HomePage";
import EmailVerification from "./Pages/Auth/EmailVerification";
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import Detailsform from "./common/Detailsform";
import SignUp from "./Pages/Auth/Signup";
import ResetPassword from "./Pages/Auth/Resetpassword";
import loader from "./assets/images/loader.gif";
//playerpage
import Profile from "./Playerpages/playerprofile";
import Dashboard from "./Playerpages/dashboard";
import Matches from "./Playerpages/matches";
import MyBooking from "./Playerpages/bookings/mybooking";
import Experts from "./Playerpages/experts";
import Expertspage from "./Playerpages/expertspage";
import AssessmentReport from "./Pages/common/AssessmentReport";
import BookingCalendar from "./Playerpages/BookService";
import PlayerSponsors from "./Playerpages/PlayerSponsors";
import SponsorApplicationpage from "./Playerpages/SponsorApplications";
import PlayerSponsorInfo from "./Playerpages/sponsorinfo";

//store
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { validateToken, initializeFromLocalStorage } from "./store/auth-slice";
//common
import CheckAuth from "./common/Checkauth";
//components
import PlayerLayout from "./components/player/layout";
import ExpertLayout from "./components/expert/layout";
import SponserLayout from "./components/sponsor/layout";
import TeamLayout from "./components/team/layout";
//expertpage
import PlayersProfile from "./expertpages/playerProfiles";
import ExpertDashboard from "./expertpages/Dashboard";
import ExpertMatches from "./expertpages/ExpertMatches";
import BookingExpertside from "./expertpages/bookings/Bookings";
import ExpertProfile from "./expertpages/expertdata";
import Playerview from "./Pages/Player/Playerview";
import ExpertAvailabilityManager from "./expertpages/Slots";
import Expertsponsors from "./expertpages/Expertsponsors";
import SponsorInfo from "./expertpages/sponsorinfo";

import { authService } from "./store/apiConfig";
//sponser pages
import Sponsorprofile from "./SponsorPages/Sponsorprofile";
import SponsorApplication from "./SponsorPages/SponsorApplication";
import SponsorForm from "./SponsorPages/SponsorForm";
import Sponsorplayer from "./SponsorPages/Sponsorplayer";
import Sponsorexperts from "./SponsorPages/Sponsorexperts";
import SponsorDetailsForm from "./SponsorPages/SponsorDetailsForm";
import TeamPlayerInfo from "./SponsorPages/playerinfo";
import SponsorPlayerInfo from "./SponsorPages/playerinfo";
import SponsorExperts from "./SponsorPages/Expertssponsor";

//Team pages
import TeamDetailsForm from "./teampages/teamdetailsform";
import TeamProfile from "./teampages/teamprofile";
import TeamExpert from "./teampages/experts";
import TeamPlayer from "./teampages/player";
import TeamSponsor from "./teampages/TeamSponser";
import TeamSponsorInfo from "./teampages/Sponsorinfo";
import TeamExperts from "./teampages/expertprofile";
//fan pages
import FanLayout from "./components/fan/layout";
import FanPlayers from "./fanpages/Players";
import FanExperts from "./fanpages/Experts";
import Fanprofile from "./fanpages/FanProfile";
import Fandetailsform from "./fanpages/Fandetailsform";

//admin pages
import AdminLayout from "./components/admin/layout";
import Dashboardadmin from "./components/admin/dashboard";
import AdminLayoutdefault from "./components/admin/defaultlayout";

import Player from "./Adminpages/Player/Player";
import Booking from "./Adminpages/Player/Booking";
import SponsorShipApplication from "./Adminpages/Player/SponsorShipApplication";
import ServiceTransaction from "./Adminpages/Player/ServiceTransaction";
import Media from "./Adminpages/Player/Media";

import Expert from "./Adminpages/Expert/Expert";
import ExpertBooking from "./Adminpages/Expert/ExpertBooking";
import ExpertMedia from "./Adminpages/Expert/ExpertMedia";
import ExpertServices from "./Adminpages/Expert/ExpertServices";
import PaymentClaims from "./Adminpages/Expert/PaymentClaims";

import Sponsor from "./Adminpages/Sponsor/Sponsor";
import Playersrequest from "./Adminpages/Sponsor/Playersrequest";
import SponsorMedia from "./Adminpages/Sponsor/SponsorMedia";
import SponsorshipOfferedTable from "./Adminpages/Sponsor/Sponsorshipoffered";
import SponsorshipTransactions from "./Adminpages/Sponsor/Sponsorshiptransactions";

import RegisteredTeams from "./Adminpages/Teams/RegisteredTeams";
import RegisteredClubs from "./Adminpages/Teams/RegisteredClubs";
import PlayersAssociations from "./Adminpages/Teams/PlayersAssociations";
import ReviewsComments from "./Adminpages/Teams/Reviews&Comments";
import Activities from "./Adminpages/Teams/Activities";

import Fans from "./Adminpages/Fans/Fans";
import Reviews from "./Adminpages/Fans/FansReviews";
import Interests from "./Adminpages/Fans/Interest";
import Comments from "./Adminpages/Fans/comments";

import NotFound from "./common/notfound";
import AssessmentEvaluationForm from "./expertpages/evaluation";
import Success from "./common/Success";
import PricingPlans from "./Pages/Home/Pricing";
import Expertinfo from "./fanpages/Expertinfo";
import Playerinfo from "./fanpages/Playerinfo";
import Aboutus from "./Pages/Home/aboutus";
import Teams from "./Pages/Home/teams";
import Contact from "./Pages/Home/Contact";
import ScrollToTop from "./common/ScrollToTop";
import Terms from "./Pages/Home/terms";
import Privacy from "./Pages/Home/privacy";

const token = localStorage.getItem("token");
if (token) {
  authService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Check if current path matches /role/dashboard pattern
    if (
      currentPath.match(/\/(player|expert|sponsor|team|fan|admin)\/dashboard$/)
    ) {
      const role = currentPath.split("/")[1];
      const profilePath =
        role === "admin" ? "/admin/dashboard" : `/${role}/profile`;
      navigate(profilePath, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null; // This component doesn't render anything
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasToken = !!localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        dispatch(initializeFromLocalStorage());
        if (hasToken) {
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

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <img src={loader} alt="" height={700} width={350} />
      </div>
    );
  }

  const effectivelyAuthenticated = isAuthenticated || hasToken;

  // Helper function to get user role
  const getUserRole = () => {
    return user?.role || localStorage.getItem("role");
  };

  // Helper function to get profile redirect path
  const getProfileRedirectPath = () => {
    const role = getUserRole();
    switch (role) {
      case "player":
        return "/player/profile";
      case "expert":
        return "/expert/profile";
      case "sponsor":
        return "/sponsor/profile";
      case "team":
        return "/team/profile";
      case "fan":
      case "user":
        return "/fan/profile";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  function handleNav() {
    const role = localStorage.getItem("role");
    if (role === "player") {
      navigate("/player/profile");
    } else if (role === "expert") {
      navigate("/expert/profile");
    } else if (role === "sponsor") {
      navigate("/sponsor/profile");
    } else if (role === "team") {
      navigate("/team/profile");
    } else if (role === "fan") {
      navigate("/fan/profile");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  }

  return (
    <>
      <ScrollToTop />
      <DashboardRedirect />
      <Routes>
        {/* Root route - redirect authenticated users to their profile */}
        <Route
          path="/"
          element={
            effectivelyAuthenticated ? (
              <Navigate to={getProfileRedirectPath()} replace />
            ) : (
              <HomePage />
            )
          }
        />

        {/* Public routes */}
        <Route path="/emailverification" element={<EmailVerification />} />
        <Route
          path="/login"
          element={
            effectivelyAuthenticated ? (
              <Navigate to={getProfileRedirectPath()} replace />
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
              <Navigate to={getProfileRedirectPath()} replace />
            ) : (
              <SignUp />
            )
          }
        />
        <Route path="/reset-password/:id" element={<ResetPassword />} />

        {/* Player routes */}
        <Route
          path="/player"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <PlayerLayout />
            </CheckAuth>
          }
        >
          <Route path="matches" element={<Matches />} />
          <Route path="mybooking" element={<MyBooking />} />
          <Route path="AssessmentReport" element={<AssessmentReport />} />
          <Route path="viewexperts" element={<Expertspage />} />
          <Route path="exdetails" element={<Experts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="details-form" element={<Detailsform />} />
          <Route path="book" element={<BookingCalendar />} />
          <Route path="sponsors" element={<PlayerSponsors />} />
          <Route path="sponsorinfo" element={<PlayerSponsorInfo />} />
          <Route path="applications" element={<SponsorApplicationpage />} />
        </Route>

        {/* Expert routes */}
        <Route
          path="/expert"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <ExpertLayout />
            </CheckAuth>
          }
        >
          <Route path="matches" element={<ExpertMatches />} />
          <Route path="mybooking" element={<BookingExpertside />} />
          <Route path="viewplayers" element={<PlayersProfile />} />
          <Route path="sponsors" element={<Expertsponsors />} />
          <Route path="profile" element={<ExpertProfile />} />
          <Route path="playerinfo" element={<Playerview />} />
          <Route path="details-form" element={<Detailsform />} />
          <Route path="sponsorinfo" element={<SponsorInfo />} />
          <Route path="slots" element={<ExpertAvailabilityManager />} />
          <Route path="evaluation" element={<AssessmentEvaluationForm />} />
        </Route>

        {/* Sponsor routes */}
        <Route
          path="/sponsor"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <SponserLayout />
            </CheckAuth>
          }
        >
          <Route path="players" element={<Sponsorplayer />} />
          <Route path="experts" element={<Sponsorexperts />} />
          <Route path="application" element={<SponsorApplication />} />
          <Route path="profile" element={<Sponsorprofile />} />
          <Route path="details-form" element={<SponsorDetailsForm />} />
          <Route path="SponsorForm" element={<SponsorForm />} />
          <Route path="playerinfo" element={<SponsorPlayerInfo />} />
          <Route path="exdetails" element={<SponsorExperts />} />
        </Route>

        {/* Team routes */}
        <Route
          path="/team"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <TeamLayout />
            </CheckAuth>
          }
        >
          <Route path="players" element={<TeamPlayer />} />
          <Route path="experts" element={<TeamExpert />} />
          <Route path="sponsors" element={<TeamSponsor />} />
          <Route path="applications" element={<SponsorApplicationpage />} />
          <Route path="profile" element={<TeamProfile />} />
          <Route path="details-form" element={<TeamDetailsForm />} />
          <Route path="exdetails" element={<TeamExperts />} />
          <Route path="playerinfo" element={<TeamPlayerInfo />} />
          <Route path="sponsorinfo" element={<TeamSponsorInfo />} />
          <Route path="book" element={<BookingCalendar />} />
        </Route>

        {/* Fan routes */}
        <Route
          path="/fan"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <FanLayout />
            </CheckAuth>
          }
        >
          <Route path="players" element={<FanPlayers />} />
          <Route path="experts" element={<FanExperts />} />
          <Route path="profile" element={<Fanprofile />} />
          <Route path="details-form" element={<Fandetailsform />} />
          <Route path="exdetails" element={<Expertinfo />} />
          <Route path="playerinfo" element={<Playerinfo />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={effectivelyAuthenticated} user={user}>
              <AdminLayoutdefault />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<Dashboardadmin />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          {/* Player */}
          <Route path="player" element={<Player />} />
          <Route path="player/booking" element={<Booking />} />
          <Route
            path="player/sponsorshipapplication"
            element={<SponsorShipApplication />}
          />
          <Route path="player/media" element={<Media />} />
          <Route
            path="player/ServiceTransaction"
            element={<ServiceTransaction />}
          />

          {/* Expert */}
          <Route path="expert" element={<Expert />} />
          <Route path="expert/booking" element={<ExpertBooking />} />
          <Route path="expert/paymentclaims" element={<PaymentClaims />} />
          <Route path="expert/media" element={<ExpertMedia />} />

          <Route path="expert/services" element={<ExpertServices />} />

          {/* Sponsor */}
          <Route path="sponsor" element={<Sponsor />} />
          <Route path="sponsor/sponsormedia" element={<SponsorMedia />} />
          <Route path="sponsor/playersrequest" element={<Playersrequest />} />
          <Route
            path="sponsor/sponsorshipoffered"
            element={<SponsorshipOfferedTable />}
          />
          <Route
            path="sponsor/SponsorshipTransactions"
            element={<SponsorshipTransactions />}
          />

          {/* Team */}
          <Route path="team" element={<RegisteredTeams />} />
          <Route path="team/registeredclubs" element={<RegisteredClubs />} />
          <Route
            path="team/playersassociations"
            element={<PlayersAssociations />}
          />
          <Route path="team/reviews&comments" element={<ReviewsComments />} />
          <Route path="team/activities" element={<Activities />} />

          {/* Fans */}
          <Route path="fan" element={<Fans />} />
          <Route path="fan/reviews" element={<Reviews />} />
          <Route path="fan/interests" element={<Interests />} />
          <Route path="fan/comments" element={<Comments />} />
        </Route>

        {/* Utility routes */}
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

        <Route path="/plans" element={<PricingPlans />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/subscription/success" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
