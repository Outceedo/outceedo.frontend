import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './user';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle the menu visibility
  const [navbarBg, setNavbarBg] = useState<string>('transparent'); // Track background color on scroll
  const [isModalOpen, setIsModalOpen] = useState(false);
   const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };
 const navigate=useNavigate();
  // Change navbar background color on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition >= 100) {
        setNavbarBg('bg-[#011936]'); // When scrolled, set navbar background to black
      } else {
        setNavbarBg('bg-transparent'); // At the top, set navbar background to transparent
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full p-4 flex justify-between items-center text-white shadow-lg z-50 ${navbarBg}`}>
      {/* Left side - Logo */}
      <div className="text-3xl font-bold ml-2">
        <h1>Logo</h1>
      </div>

      {/* Centered Links for larger screens */}
      <div className="hidden md:flex justify-center space-x-12 ml-96">
        <a href="#home" className="font-Raleway font-semibold text-2xl hover:text-[#FE221E] transition">
          Home
        </a>
        <a href="#about" className="font-Raleway font-semibold text-2xl hover:text-[#FE221E] transition">
          About
        </a>
        <a href="#features" className="font-Raleway font-semibold text-2xl hover:text-[#FE221E] transition">
          Features
        </a>
        <a href="#pricing" className="font-Raleway font-semibold text-2xl hover:text-[#FE221E] transition">
          Pricing
        </a>
        <a href="#contact" className="font-Raleway font-semibold text-2xl hover:text-[#FE221E] transition">
          Contact Us
        </a>
      </div>

      {/* Right side - Login and Sign Up */}
      <div className="space-x-6 ml-auto  hidden md:flex">
      <button
      onClick={() => navigate("/login")}
      className="font-Raleway font-semibold text-2xl border-2 px-6 py-3 rounded-xl hover:text-[#FE221E] hover:bg-white transition cursor-pointer"
    >
      Login
    </button>
        <button
        onClick={() => setIsModalOpen(true)}
        className="font-Raleway font-semibold text-xl sm:text-2xl bg-[#FE221E] hover:bg-red-500 transition cursor-pointer text-white px-6 py-3 rounded-xl"
      >
        Sign Up
      </button>

      {isModalOpen && (
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative" >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>

            <User /> {/* Render the Signup component inside the modal */}
          </div>
        </div>
      )} 
      </div>

      {/* Hamburger Icon or "X" Icon for small screens */}
      <div className="md:hidden flex items-center cursor-pointer relative" onClick={toggleMenu}>
        {isMenuOpen ? (
          <i className="fas fa-times text-4xl text-white absolute top-4 right-4"></i> // "X" icon in top-right when menu is open
        ) : (
          <i className="fas fa-bars text-3xl text-white"></i> // Hamburger icon when menu is closed
        )}
      </div>

      {/* Mobile Menu (visible when the menu is open) */}
      <div
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} absolute top-0 right-0 w-full bg-[#011936] rounded-2xl p-6 z-40`}
      >
        {/* Close "X" icon inside the mobile menu */}
        {isMenuOpen && (
          <i className="fas fa-times text-4xl text-white absolute  cursor-pointer  top-4 right-4" onClick={toggleMenu}></i>
        )}

        <div className="flex flex-col items-center space-y-6">
          <a href="#home" className="font-Raleway font-semibold text-xl text-white hover:text-[#FE221E] transition" onClick={() => setIsMenuOpen(false)}>
            Home
            
          </a>
          <a href="#about" className="font-Raleway font-semibold text-xl text-white hover:text-[#FE221E] transition" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="#features" className="font-Raleway font-semibold text-xl text-white hover:text-[#FE221E] transition" onClick={() => setIsMenuOpen(false)}>
            Features
          </a>
          <a href="#pricing" className="font-Raleway font-semibold text-xl text-white hover:text-[#FE221E] transition" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </a>
          <a href="#contact" className="font-Raleway font-semibold text-xl text-white hover:text-[#FE221E] transition" onClick={() => setIsMenuOpen(false)}>
            Contact Us
          </a>
          <div className="flex space-x-4">
          <button
      onClick={() => navigate("/login")}
      className="font-Raleway font-semibold text-2xl border-2 px-6 py-3 rounded-xl hover:text-[#FE221E] hover:bg-white transition cursor-pointer"
    >
      Login
    </button>
    <button
        onClick={() => setIsModalOpen(true)}
        className="font-Raleway font-semibold text-xl sm:text-2xl bg-[#FE221E] hover:bg-red-500 transition cursor-pointer text-white px-6 py-3 rounded-xl"
      >
        Sign Up
      </button>
          </div>
        </div>
    </div>
    </nav>
  );
};

export default Navbar;