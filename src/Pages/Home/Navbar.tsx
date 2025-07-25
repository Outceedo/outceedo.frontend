import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import User from "./user";

const NAV_ITEMS = [
  { label: "Home", anchor: "home" },
  { label: "About", anchor: "about" },
  { label: "Team", anchor: "team" },
  { label: "Pricing", anchor: "pricing" },
  { label: "Contact Us", anchor: "contactus" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();

  // Only enable scroll effect on home page
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true); // Always scrolled (solid navbar) on other paths
    }
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => setModalOpen(true);

  // For scrolling to anchor & setting active nav
  const handleNavClick = (item: { label: string; anchor: string }) => {
    setActiveNav(item.label);

    if (item.label === "About") {
      navigate("/about");
      setMobileMenuOpen(false);
      return;
    }
    if (item.label === "Pricing" && !isHome) {
      navigate("/plans");
      setMobileMenuOpen(false);
      return;
    }
    if (item.label === "Team") {
      navigate("/teams");
      setMobileMenuOpen(false);
      return;
    }
    if (item.label === "Contact Us" && !isHome) {
      navigate("/contactus");
      setMobileMenuOpen(false);
      return;
    }
    if (item.label === "Home") {
      navigate("/");
      setMobileMenuOpen(false);
      return;
    }

    // For others, scroll to anchor
    const section = document.getElementById(item.anchor);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
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
            Outceedo
          </button>
          <div className="hidden lg:flex items-center flex-nowrap gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`
                  font-medium px-3 py-1 rounded transition-colors whitespace-nowrap
                  ${
                    activeNav === item.label
                      ? " text-red-500"
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
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }
                hover:text-red-500
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
