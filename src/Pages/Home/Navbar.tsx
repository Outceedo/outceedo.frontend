import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import User from "./user";
import logo from "../../assets/images/outceedologo.png";

const NAV_ITEMS = [
  { label: "Home", anchor: "home", path: "/" },
  { label: "About", anchor: "about", path: "/about" },
  { label: "Team", anchor: "team", path: "/teams" },
  { label: "Pricing", anchor: "pricing", path: "/plans" },
  { label: "Contact Us", anchor: "contactus", path: "/contactus" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  // Effect to handle navbar background on scroll
  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [isHome]);

  // Effect to set active nav based on URL path
  useEffect(() => {
    const currentItem = NAV_ITEMS.find(
      (item) => item.path === location.pathname
    );
    if (currentItem) {
      setActiveNav(currentItem.label);
    }
  }, [location.pathname]);

  // Effect to disable body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => setModalOpen(true);

  // For navigating or scrolling to anchor
  const handleNavClick = (item: (typeof NAV_ITEMS)[0]) => {
    setActiveNav(item.label);
    setMobileMenuOpen(false);

    // If on a different page, navigate first, then scroll on the home page.
    if (!isHome && item.path === "/") {
      navigate("/");
      // Use timeout to allow page to render before scrolling
      setTimeout(() => {
        const section = document.getElementById(item.anchor);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (isHome && item.path === "/") {
      const section = document.getElementById(item.anchor);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            onClick={() => handleNavigate("/")}
            className={`font-bold text-lg lg:text-xl px-4 transition-colors ${
              scrolled ? "text-red-600" : "text-white"
            }`}
          >
            <img src={logo} className="w-56" alt="Outceed Logo" />
          </button>
          <div className="hidden lg:flex items-center flex-nowrap gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`
                  font-medium px-3 py-1 rounded transition-colors whitespace-nowrap
                  ${
                    activeNav === item.label
                      ? "bg-red-500 text-white"
                      : scrolled
                      ? "text-gray-800"
                      : "text-white"
                  }
                  hover:bg-red-500 hover:text-white cursor-pointer
                `}
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </button>
            ))}
            <button
              className={`
                px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap
                ${
                  scrolled
                    ? "text-gray-800 hover:bg-red-600"
                    : "text-white hover:bg-red-600"
                }
                hover:text-white
              `}
              onClick={() => handleNavigate("/login")}
            >
              Log In
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
              onClick={handleSignUpClick}
            >
              Sign Up
            </button>
          </div>
          {/* Mobile menu button */}
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu
              className={`h-7 w-7 ${scrolled ? "text-gray-800" : "text-white"}`}
            />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm lg:hidden max-h-screen overflow-y-auto">
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-800" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="flex flex-col justify-center items-center mt-18">
            <nav className="flex flex-col items-center justify-center space-y-6 p-4 w-full">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className={`
                    text-xl font-medium px-3 py-2 rounded w-full
                    ${
                      activeNav === item.label
                        ? "bg-red-500 text-white"
                        : "text-gray-800"
                    }
                    hover:bg-red-500 hover:text-white
                  `}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </button>
              ))}
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
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-3xl"
            >
              &times;
            </button>
            <User />
          </div>
        </div>
      )}
    </header>
  );
}
