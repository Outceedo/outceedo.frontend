import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import User from "./user"; // Assuming this is the modal component

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate("/signup");
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => handleNavigate("/")}
            className={`font-bold text-lg px-8 lg:px-24 ${
              scrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Logo
          </button>
          <div className="w-1/2 flex justify-between">
            <nav className="hidden md:flex items-center space-x-12">
              {["Home", "About", "Features", "Pricing", "Contact Us"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    className={`font-medium ${
                      scrolled ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {item}
                  </a>
                )
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                className={`hidden md:inline-flex px-4 py-2 rounded-md font-medium ${
                  scrolled
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => handleNavigate("/login")}
              >
                Log In
              </button>
              <button
                className="ml-24 md:ml-0 px-4 py-2 rounded-md font-medium bg-red-500 hover:bg-red-600 text-white"
                onClick={handleSignUpClick}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu
                className={`h-6 w-6 ${
                  scrolled ? "text-gray-800" : "text-white"
                }`}
              />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm md:hidden max-h-screen overflow-y-auto">
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-800" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="flex flex-col justify-center items-center mt-18">
            <nav className="flex flex-col items-center justify-center space-y-6 p-4">
              {["Home", "About", "Features", "Pricing", "Contact Us"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    className="text-xl font-medium text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                )
              )}

              <div className="flex flex-col space-y-4 w-full max-w-xs pt-6">
                <button
                  className="w-full px-4 py-2 rounded-md border border-gray-300 font-medium text-gray-800"
                  onClick={() => handleNavigate("/login")}
                >
                  Log In
                </button>
                <button
                  className="w-full px-4 py-2 rounded-md font-medium bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-70 z-50">
          <div className="absolute inset-0 bg-black opacity-65"></div>
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-3xl"
            >
              &times;
            </button>
            <User /> {/* Render the Signup component inside the modal */}
          </div>
        </div>
      )}
    </header>
  );
}
