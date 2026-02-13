import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import User from "./user";
import logo from "../../assets/images/logosmall.png";
import outceedo from "@/assets/images/outceedologo.png";

const NAV_ITEMS = [
  { label: "Home", anchor: "home", path: "/" },
  { label: "About", anchor: "about", path: "/about" },
  // { label: "Team", anchor: "team", path: "/teams" },
  { label: "Pricing", anchor: "pricing", path: "/plans" },
  { label: "Contact Us", anchor: "contactus", path: "/contactus" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHome]);

  useEffect(() => {
    const currentItem = NAV_ITEMS.find(
      (item) => item.path === location.pathname,
    );
    if (currentItem) {
      setActiveNav(currentItem.label);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => setModalOpen(true);

  const handleNavClick = (item: (typeof NAV_ITEMS)[0]) => {
    setActiveNav(item.label);
    setMobileMenuOpen(false);

    if (!isHome && item.path === "/") {
      navigate("/");
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md py-4 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2"
        >
          <div className="w-56 h-10 rounded-lg flex items-center justify-center">
            <img src={outceedo} alt="Outceedo" className="w-56" />
          </div>
          {/* <span className="text-2xl font-black tracking-tighter text-slate-900">
            OUTCEEDO
          </span> */}
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`text-md font-bold transition-colors ${
                activeNav === item.label
                  ? "text-red-500"
                  : "text-slate-600 hover:text-red-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => handleNavigate("/login")}
            className="text-sm font-bold text-slate-900 hover:text-red-500 transition-colors"
          >
            Login
          </button>
          <button
            onClick={handleSignUpClick}
            className="bg-red-500 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu
            className={`h-7 w-7 ${isScrolled ? "text-slate-900" : "text-black"}`}
          />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md lg:hidden max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Outceedo" className="w-10 h-10" />
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                OUTCEEDO
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="h-7 w-7 text-slate-900" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="flex flex-col justify-center items-center mt-12">
            <nav className="flex flex-col items-center justify-center space-y-6 p-4 w-full">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className={`text-xl font-bold px-6 py-3 rounded-xl w-full max-w-xs transition-all ${
                    activeNav === item.label
                      ? "bg-red-500 text-white"
                      : "text-slate-900 hover:bg-slate-100"
                  }`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col space-y-4 w-full max-w-xs pt-8">
                <button
                  className="w-full px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-900 hover:border-slate-300 transition-colors"
                  onClick={() => handleNavigate("/login")}
                >
                  Log In
                </button>
                <button
                  className="w-full px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  onClick={handleSignUpClick}
                >
                  Get Started <ArrowRight size={16} />
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-lg z-10"
            >
              <X size={18} />
            </button>
            <User />
          </div>
        </div>
      )}
    </nav>
  );
}
