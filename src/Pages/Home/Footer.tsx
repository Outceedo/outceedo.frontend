import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faFacebookF,
  faInstagram,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const OutceedoFooter: React.FC = () => (
  <footer className="bg-[#002149] w-full text-white pt-12 pb-4">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 items-center text-center md:text-left">
        {/* Left - Logo and tagline */}
        <div className="md:w-1/3 mb-8 md:mb-0 flex flex-col items-center md:items-start">
          <h2 className="font-bold text-2xl mb-2">Outceedo</h2>
          <p className="text-base text-[#e3e9f1]">
            Outdo your sport to succeed
          </p>
        </div>
        {/* Center - Links */}
        <div className="flex flex-1 flex-col md:flex-row justify-around gap-10 items-center md:items-start">
          <div className="flex flex-col items-center md:items-start ">
            <h3 className="font-bold mb-2 text-lg">Resources</h3>
            <ul className="space-y-1 text-[#e3e9f1]">
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact Us
                </a>
              </li>
            </ul>
            <h3 className="font-bold mt-6 mb-2 text-lg">Legal</h3>
            <ul className="space-y-1 text-[#e3e9f1]">
              <li>
                <a href="#" className="hover:underline">
                  Terms of Usage
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Risk Warning
                </a>
              </li>
            </ul>
          </div>
          <div className="min-w-[220px] flex flex-col items-center md:items-start">
            <h3 className="font-bold mb-2 text-lg">Contact Address</h3>
            <p className="mb-5 text-[#e3e9f1]">Address</p>
            <h3 className="font-bold mb-2 text-lg">Reach Out to Us</h3>
            <p className="text-[#e3e9f1]">
              Email:{" "}
              <a href="mailto:anbdc@outceedo.com" className="hover:underline">
                anbdc@outceedo.com
              </a>
            </p>
            <p className="text-[#e3e9f1]">
              Phone:{" "}
              <a href="tel:+441234567890" className="hover:underline">
                +44-1234567890
              </a>
            </p>
          </div>
        </div>
        {/* Right - Social */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-bold mb-2 text-lg text-center">Get Social</h3>
          <div className="flex md:grid md:grid-cols-2 gap-4 mt-2 justify-center">
            <a
              href="#"
              aria-label="Twitter"
              className="bg-[#0e2541] hover:bg-[#1d3860] rounded-full p-2 transition-colors"
            >
              <FontAwesomeIcon icon={faTwitter} size="lg" />
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

export default OutceedoFooter;
