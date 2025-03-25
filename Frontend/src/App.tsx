import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import EmailVerification from './Pages/EmailVerification';
import Login from './Pages/Login'; // Adjust path as per your folder structure
import ForgotPassword from './Pages/ForgotPassword';
import Detailsform from './Pages/Detailsform';
import SignUp from './Pages/Signup';
import ResetPassword from './Pages/Resetpassword';
import Profile from './Playerpages/playerprofile';
import Dashboard from './Playerpages/dashboard';
import Matches from './Playerpages/matches';
import MyBooking from './Playerpages/mybooking';
import Experts from './Playerpages/experts';
import Expertspage from './Playerpages/expertspage';
import ExpertMedia from './expertpages/expertmedia';
import ExpertData from "./expertpages/expertdata";
import PlayerPage from './expertpages/playerpage';
import Player from './expertpages/player';

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
   

        {/* Player pages */}
        <Route path="/profile" element={<Profile />} />             
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/mybooking" element={<MyBooking />} />
        <Route path="/experts" element={<Experts />} />
     
           {/* experts pages */}
           <Route path="/exprtmedia" element={<ExpertMedia />} />
           <Route path="/expertData" element={<ExpertData />} />
           <Route path='/expertspage' element={<Expertspage />} />
           <Route path='/playerpage' element={<PlayerPage />} />
           <Route path='/player' element={<Player />} />  
  
      </Routes>
    </BrowserRouter>
  );
};

export default App;
