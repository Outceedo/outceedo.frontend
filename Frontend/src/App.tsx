import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import EmailVerification from './Pages/EmailVerification';
import Login from './Pages/Login'; // Adjust path as per your folder structure
import ForgotPassword from './Pages/ForgotPassword';
import Detailsform from './Pages/Detailsform';
import SignUp from './Pages/Signup';
import ResetPassword from './Pages/Resetpassword';

import Profile from './ProfilePage/Profile';
import Reviews from './ProfilePage/reviews';
import Media from './ProfilePage/media';
import MediaUpload from './ProfilePage/MediaUpload';
import Dashboard from './ProfilePage/dashboard';
import Matches from './ProfilePage/matches';
import MyBooking from './ProfilePage/mybooking';
import Experts from './ProfilePage/experts';
import Expertspage from './ProfilePage/expertspage';
import SideNavbar from './ProfilePage/sideNavbar';

import ExpertMedia from './expertpages/expertmedia';
import ExpertData from "./expertpages/expertdata";
import ExpertNavbar from './expertpages/expertNavbar';
import PlayerPage from './expertpages/playerpage';
import Player from './expertpages/player';
import PlayerMedia from './expertpages/playermedia';
import PlayerReviews from './expertpages/playerreviews';
import PlayerHeader from './ProfilePage/playerheader';



const App: React.FC = () => {
  return (
    <BrowserRouter> {/* Ensure that your app is wrapped inside BrowserRouter */}
      <Routes>
        {/* Define routes for the Home, Login, and other pages */}
        <Route path="/" element={<HomePage />} /> {/* Home page route */}
        <Route path="/emailverification" element={<EmailVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/detailsform" element={<Detailsform />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Profile pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/media" element={<Media />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/playerheader" element={<PlayerHeader />} />
        
        


        {/* Pass onClose and onMediaUpdate to MediaUpload */}
        <Route
          path="/mediaUpload"
          element={
            <MediaUpload
              onClose={() => {
                console.log('Close button clicked');
              }}
              onMediaUpdate={() => {
                console.log('Media updated');
              }}
            />
          }
        />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/mybooking" element={<MyBooking />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/experts" element={<Experts />} />
        <Route path='/sideNavbar' element={<SideNavbar />} />


           {/* experts pages */}
           <Route path="/exprtmedia" element={<ExpertMedia />} />
           <Route path="/expertData" element={<ExpertData />} />
           <Route path='/expertspage' element={<Expertspage />} />
           <Route path='/expertNavbar' element={<ExpertNavbar />} />
           <Route path='/playerpage' element={<PlayerPage />} />
           <Route path='/player' element={<Player />} />
           <Route path='/playermedia' element={<PlayerMedia />} />
           <Route path='/playerreviews' element={<PlayerReviews />} />
           



           

     

      </Routes>

    </BrowserRouter>
  );
};

export default App;
