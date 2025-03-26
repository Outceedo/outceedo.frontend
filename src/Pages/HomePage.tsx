import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Background from "../assets/images/Background.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import Navbar from "./Navbar";
import About from "./About";
import Features from "./Features";
import Pricing from "./Pricing";
import Contact from "./Contact";
import User from "./user";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSignUpClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate("/signup");
  };

  return (
    <div>
      <Navbar />
      <div className="absolute inset-0 bg-black opacity-65"></div>
      <div className="relative h-screen w-full mb-16">
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-black/40 z-10"></div> */}

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="\src\assets\images\Hero.png"
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

      <div className="bg-[#011936] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-3xl font-bold">Logo</h2>
              <p className="text-sm mt-2 text-gray-400">
                Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold mb-2">Company</h2>
              <ul className="text-sm space-y-2 text-gray-400">
                <li
                  onClick={() => navigate("/")}
                  className="cursor-pointer hover:text-white"
                >
                  About Landio
                </li>
                <li
                  onClick={() => navigate("/features")}
                  className="cursor-pointer hover:text-white"
                >
                  Features
                </li>
                <li
                  onClick={() => navigate("/pricing")}
                  className="cursor-pointer hover:text-white"
                >
                  Pricing
                </li>
                <li
                  onClick={() => navigate("/contact")}
                  className="cursor-pointer hover:text-white"
                >
                  Contact & Support
                </li>
              </ul>
            </div>
            <div className="flex justify-center space-x-6 mt-6 md:mt-0">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 text-2xl"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 text-2xl"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 text-2xl"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600 text-2xl"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 text-center py-6 text-gray-400">
          <p className="text-sm">
            © {new Date().getFullYear()} All rights are reserved.
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md max-w-4xl w-full">
            <User isOpen={isModalOpen} onClose={handleModalClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
