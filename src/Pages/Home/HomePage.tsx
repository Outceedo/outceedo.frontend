import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Hero from "../../assets/images/Main.png";

import Navbar from "./Navbar";
import About from "./About";
import Features from "./Features";
import Pricing from "./Pricing";
import Contact from "./Contact";
import User from "./user";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import OutceedoFooter from "./Footer";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { isAuthenticated, user, tokenValidationInProgress } = useAppSelector(
    (state) => state.auth
  );
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSignUpClick = () => {
    setModalOpen(true);
  };

  return (
    <div>
      {isAuthenticated && (
        <>
          <Navigate
            to={
              user?.role === "expert"
                ? "/expert/dashboard"
                : "/player/dashboard"
            }
          />
        </>
      )}
      {isModalOpen && (
        <>
          <div className="absolute inset-0 bg-black opacity-65"></div>
          <div className="absolute inset-0 bg-black opacity-65"></div>
        </>
      )}
      <Navbar />
      <div className="absolute inset-0 bg-black opacity-65"></div>

      <div className="relative h-screen w-full mb-42" id="home">
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-black/40 z-10"></div> */}

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={Hero}
            alt="Stadium background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-lg md:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Where Artists Can Enhance Opportunities
            </h1>
            <p className="text-2xl text-white/90 mb-8">
              Connect with experts in the entertainment industry and assess your
              skills and performances
            </p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md text-lg font-medium"
              onClick={handleSignUpClick}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <About />
      <Features />
      <Pricing />
      <Contact />

      <OutceedoFooter />

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <User />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
