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

      <div className="absolute inset-0 bg-black opacity-65"></div>

      <div className="relative h-screen w-full mb-42" id="home">
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-black/40 z-10"></div> */}
        <Navbar />
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={Hero}
            alt="Stadium background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col top-50 md:top-36">
          <div className="max-w-full md:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
              Outceedo
            </h1>
            <h4 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              Outdo your sport to <span className="">Succeed</span>
            </h4>
          </div>
          <div className="md:ml-24 flex flex-col justify-center md:justify-start mt-8">
            <p className="text-2xl md:text-4xl text-white/90 mb-8 font-bold w-1/3 hidden md:block">
              Where football players can enhance their opportunities
            </p>
            <div className="w-full flex justify-center md:justify-start">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md text-lg font-medium w-42 flex justify-center"
                onClick={handleSignUpClick}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <About />
      <Features />
      <Pricing />
      <Contact />

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <>
            <div className="absolute inset-0 bg-black opacity-65"></div>
          </>
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
