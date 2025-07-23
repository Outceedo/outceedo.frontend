import { AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faGem,
  faMoon,
  faSun,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";

interface PlayerHeaderProps {
  setOpen: (open: boolean) => void;
}

interface PlanFeature {
  feature: {
    id: string;
    name: string;
    key: string;
    description: string;
  };
  id: string;
  value: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  createdAt: string;
  updatedAt: string;
  features: PlanFeature[];
}

const menuItems = [
  { path: "/player/details-form", name: "Edit Profile" },
  { path: "/player/dashboard", name: "Dashboard" },
  { path: "/player/viewexperts", name: "Experts" },
  { path: "/player/matches", name: "Matches" },
  { path: "/player/mybooking", name: "My Bookings" },
  { path: "/player/sponsors", name: "Sponsors" },
  { path: "/player/profile", name: "Profile" },
  { path: "/player/exdetails", name: "Expert Profile" },
  { path: "/player/sponsorinfo", name: "Sponsor Profile" },
  { path: "/player/applications", name: "Sponsor Applications" },
];

function PlayerHeader({ setOpen }: PlayerHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currentProfile } = useAppSelector((state) => state.profile);

  const location = useLocation();
  const currentTitle =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.name ??
    "Dashboard";
  const API = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const dispatch = useAppDispatch();
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  // Fetch subscription status on component mount
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    }
  };

  // Fetch plans when modal opens
  useEffect(() => {
    if (showModal && !loadingPlans) {
      setLoadingPlans(true);
      const token = localStorage.getItem("token");
      axios
        .get(API, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setPlans(res.data?.plans || []);
        })
        .catch(() => setPlans([]))
        .finally(() => setLoadingPlans(false));
    }
  }, [showModal]);

  // Free/Basic plan local config
  const basicPlan = {
    name: "Basic",
    description: "",
    price: "Free",
    isCurrent: !(isActive && planName && planName.toLowerCase() !== "free"),
    button: "Get Started",
  };

  // Premium plan config (from API if available)
  const proPlanObj = plans[0];
  const premiumPlan = {
    name: "Premium",
    description: "",
    price: "£10/month or £100/year",
    isCurrent: isActive && planName && planName.toLowerCase() !== "free",
    button:
      isActive && planName && planName.toLowerCase() !== "free"
        ? "Current Plan"
        : "Get Started",
    popular: true,
  };

  // Subscribe to pro plan (always use the only plan's id)
  const handleSubscribePro = async () => {
    if (!proPlanObj) {
      alert("Pro plan not available yet. Please contact support.");
      return;
    }
    try {
      const id = currentProfile?.id;
      if (!id) return;
      localStorage.setItem("planId", proPlanObj.id);
      const api = `${import.meta.env.VITE_PORT}/api/v1/subscription/subscribe/${
        proPlanObj.id
      }`;
      const token = localStorage.getItem("token");
      const response = await axios.post(
        api,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("No payment URL returned.");
      }
    } catch (error) {
      alert("Something went wrong during upgrade.");
    }
  };

  const handleUpgrade = () => setShowModal(true);

  // Modal UI (plan card selector only, as per your design)
  const modal = showModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute inset-0" onClick={() => setShowModal(false)} />
      <div className="relative z-10 bg-[#f7fafb] rounded-2xl p-8 shadow-xl w-[95vw] max-w-3xl flex flex-col items-center">
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          {/* Basic Card */}
          <div
            className={`relative border border-gray-300 bg-white rounded-xl p-8 flex-1 max-w-md min-w-[260px] flex flex-col items-center ${
              basicPlan.isCurrent ? "ring-2 ring-green-400" : ""
            }`}
          >
            <div className="font-bold text-2xl mb-2">{basicPlan.name}</div>
            <div className="text-gray-500 mb-4 text-center">
              {basicPlan.description}
            </div>
            <button
              className={`w-full bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black text-lg font-bold rounded-lg py-2 mt-2 shadow-none ${
                basicPlan.isCurrent ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={basicPlan.isCurrent}
            >
              {basicPlan.button}
            </button>
            <div className="text-2xl font-extrabold mt-6 mb-2 text-gray-800">
              {basicPlan.price}
            </div>
          </div>
          {/* Premium Card */}
          <div
            className={`relative border-4 ${
              premiumPlan.isCurrent ? "border-red-500" : "border-gray-300"
            } bg-white rounded-xl p-8 flex-1 max-w-md min-w-[260px] flex flex-col items-center`}
          >
            {/* Popular badge */}
            <div className="absolute -top-5 left-0 right-0 flex justify-center">
              <span className="bg-red-500 text-white text-xs font-bold py-1 px-5 rounded-full shadow">
                Popular
              </span>
            </div>
            <div className="font-bold text-2xl mb-2">{premiumPlan.name}</div>
            <div className="text-gray-500 mb-4 text-center">
              {premiumPlan.description}
            </div>
            <button
              className={`w-full bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black text-lg font-bold rounded-lg py-2 mt-2 shadow-none ${
                premiumPlan.isCurrent ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={premiumPlan.isCurrent}
              onClick={premiumPlan.isCurrent ? undefined : handleSubscribePro}
            >
              {premiumPlan.button}
            </button>
            <div className="text-2xl font-extrabold mt-6 mb-2 text-gray-800">
              {premiumPlan.price}
            </div>
          </div>
        </div>
        {/* Close button */}
        <button
          className="absolute top-2 right-2 bg-white w-8 h-8 flex items-center justify-center text-gray-500 shadow hover:bg-gray-100 z-20 cursor-pointer"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-background dark:bg-slate-950">
        {/* Left Section: Menu Button + Page Title */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setOpen(true)}
            className="lg:hidden bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600 p-2"
            size="sm"
          >
            <AlignJustify className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {currentTitle}
          </h2>
        </div>
        {/* Right Section: Premium Button, Notifications, Theme Toggle */}
        <div className="flex flex-nowrap justify-end gap-2 items-center">
          <Button
            className={`h-10 px-2 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
              premiumPlan.isCurrent
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600"
            }`}
            onClick={handleUpgrade}
            disabled={subscriptionLoading}
          >
            <FontAwesomeIcon
              icon={premiumPlan.isCurrent ? faCrown : faGem}
              className={`text-lg sm:text-xl ${
                premiumPlan.isCurrent
                  ? "text-yellow-300"
                  : "text-blue-700 dark:text-blue-400"
              }`}
            />
            <p
              className={`font-Opensans text-lg md:block hidden xs:inline ${
                premiumPlan.isCurrent
                  ? "text-white"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {subscriptionLoading
                ? "Loading..."
                : premiumPlan.isCurrent
                ? "Premium Plan"
                : "Upgrade to Premium"}
            </p>
          </Button>
          <Button
            className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 dark:text-white transition-colors p-2 sm:p-3 h-10 w-10"
            size="sm"
          >
            <FontAwesomeIcon
              icon={faBell}
              className="text-black dark:text-white text-lg sm:text-xl"
            />
          </Button>
          <Button
            onClick={toggleTheme}
            className="p-2 sm:p-3 rounded-full dark:bg-slate-950 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 w-10"
            size="sm"
          >
            <FontAwesomeIcon
              icon={isDarkMode ? faMoon : faSun}
              className="text-gray-600 dark:text-white text-lg sm:text-xl"
            />
          </Button>
        </div>
      </header>
      {modal}
    </>
  );
}

export default PlayerHeader;
