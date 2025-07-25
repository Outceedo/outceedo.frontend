import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faFacebookF,
  faInstagram,
  faGithub,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const OutceedoFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#002149] w-full text-white pt-12 pb-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 items-center text-center md:text-left">
          {/* Left - Logo and tagline */}
          <div className="md:w-1/3 mb-8 md:mb-0 flex flex-col items-center md:items-start">
            <h2 className="font-bold text-3xl mb-2 text-red-500 ">Outceedo</h2>
            <p className="text-base text-[#e3e9f1]">
              Outdo your sport to <span className="text-red-500">Succeed</span>
            </p>
          </div>
          {/* Center - Links */}
          <div className="flex flex-1 flex-col md:flex-row justify-around gap-10 items-center md:items-start">
            <div className="flex flex-col items-center md:items-start ">
              <h3 className="font-bold mb-2 text-lg text-red-500">Resources</h3>
              <ul className="space-y-1 text-[#e3e9f1]">
                <li>
                  <button
                    onClick={() => navigate("/about")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/team")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    Team
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/plans")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/contactus")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
              <h3 className="font-bold mt-6 mb-2 text-lg text-red-500">
                Legal
              </h3>
              <ul className="space-y-1 text-[#e3e9f1]">
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    Terms of Usage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:underline bg-transparent text-[#e3e9f1]"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div className="min-w-[220px] flex flex-col items-center md:items-start">
              <h3 className="font-bold mb-2 text-lg text-red-500">
                Contact Address
              </h3>
              <p
                className="mb-5 text-[#e3e9f1] w-96 cursor-pointer hover:underline"
                onClick={() =>
                  window.open(
                    "https://www.google.com/maps/search/?api=1&query=82+Berryden+Gardens,+Aberdeen,+Scotland,+UK,+AB25+3RW",
                    "_blank"
                  )
                }
              >
                82 Berryden Gardens, Aberdeen, Scotland, UK, AB25 3RW
              </p>
              <h3 className="font-bold mb-2 text-lg text-red-500">
                Reach Out to Us
              </h3>
              <p className="text-[#e3e9f1]">
                Email:{" "}
                <a href="mailto:info@outceedo.com" className="hover:underline">
                  info@outceedo.com
                </a>
              </p>
              <p className="text-[#e3e9f1]">
                Phone:{" "}
                <a href="tel:+447707201236" className="hover:underline">
                  +44-7707201236
                </a>
              </p>
            </div>
          </div>
          {/* Right - Social */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold mb-2 text-lg text-center primary">
              Get Socials
            </h3>
            <div className="flex md:grid md:grid-cols-2 gap-4 mt-2 justify-center">
              <a
                href="#"
                aria-label="Twitter"
                className="bg-[#0e2541] hover:bg-[#1d3860] rounded-full p-2 transition-colors"
              >
                <FontAwesomeIcon icon={faXTwitter} size="lg" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="bg-[#0e2541] hover:bg-[#1d3860] rounded-full p-2 transition-colors"
              >
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="bg-[#0e2541] hover:bg-[#1d3860] rounded-full p-2 transition-colors"
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a
                href="#"
                aria-label="Github"
                className="bg-[#0e2541] hover:bg-[#1d3860] rounded-full p-2 transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="mt-10 mb-2 border-t border-[#223a54] w-full" />
        {/* Copyright */}
        <div className="text-center text-[#e3e9f1] text-sm mt-2">
          © Copyright 2025, All Rights are Reserved
        </div>
      </div>
    </footer>
  );
};

export default OutceedoFooter;
