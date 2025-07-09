import { AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faGem,
  faMoon,
  faSun,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
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

const freeFeatures = [
  { name: "Upload Video Limit", value: "1", desc: "Limited to 1 video" },
  { name: "Upload Photo Limit", value: "2", desc: "Limited to 2 photos" },
  { name: "Expert Bookings", value: "1", desc: "Limited to 1 booking" },
  { name: "Basic Support", value: "", desc: "Basic support" },
];
const proFeatures = [
  {
    name: "Upload Video Limit",
    value: "Unlimited",
    desc: "Unlimited video uploads",
  },
  {
    name: "Upload Photo Limit",
    value: "Unlimited",
    desc: "Unlimited photo uploads",
  },
  { name: "Expert Bookings", value: "Unlimited", desc: "Unlimited bookings" },
  { name: "Priority Support", value: "", desc: "Priority support" },
  { name: "Access All Features", value: "", desc: "All premium features" },
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

  // Free plan is always a local one (not subscribable, no price)
  const freePlan = {
    id: "free-plan",
    name: "Free",
    price: 0,
    interval: "month",
    description: "The essential features to get started.",
    stripePriceId: "",
    stripeProductId: "",
    createdAt: "",
    updatedAt: "",
    features: [],
  };

  // The first (and only) plan from API is the pro plan
  const proPlan = plans[0];

  // Subscribe to pro plan (always use the only plan's id)
  const handleSubscribePro = async () => {
    if (!proPlan) {
      alert("Pro plan not available yet. Please contact support.");
      return;
    }
    try {
      const id = currentProfile?.id;
      if (!id) return;
      localStorage.setItem("planId", proPlan.id);
      const api = `${import.meta.env.VITE_PORT}/api/v1/subscription/${
        proPlan.id
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
      console.error(error);
      alert("Something went wrong during upgrade.");
    }
  };

  const handleUpgrade = () => setShowModal(true);

  // Modal UI
  const modal = showModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute inset-0" onClick={() => setShowModal(false)} />
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl w-[95vw] max-w-2xl flex flex-col md:flex-row gap-6 items-stretch">
        {/* Free Plan */}
        <div className="relative flex-1 border rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 flex flex-col">
          <div className="absolute right-4 top-4">
            <span className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow">
              Current
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGem} className="text-gray-400 text-xl" />
            <span className="font-bold text-lg text-gray-700 dark:text-gray-200">
              Free Plan
            </span>
          </div>
          <div className="text-2xl font-extrabold mb-1 text-gray-700 dark:text-gray-200">
            $0
            <span className="text-base font-normal text-gray-500 ml-1">
              /month
            </span>
          </div>
          <div className="mb-3 text-gray-500 dark:text-gray-300 text-xs">
            {freePlan.description}
          </div>
          <ul className="mb-6 space-y-2">
            {freeFeatures.map((f) => (
              <li key={f.name} className="flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span>
                  <span className="font-semibold">{f.name}:</span> {f.desc}
                </span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full bg-gray-200 text-gray-500 cursor-not-allowed"
            disabled
          >
            Current Plan
          </Button>
        </div>
        {/* Pro Plan */}
        {proPlan && (
          <div className="relative flex-1 border-2 border-blue-400 rounded-2xl bg-blue-50 dark:bg-blue-950 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faGem} className="text-blue-500 text-xl" />
              <span className="font-bold text-lg text-blue-700 dark:text-blue-300">
                Pro Plan
              </span>
            </div>
            <div className="text-2xl font-extrabold mb-1 text-blue-700 dark:text-blue-200">
              ${proPlan.price}
              <span className="text-base font-normal text-blue-500 ml-1">
                /{proPlan.interval}
              </span>
            </div>
            <div className="mb-3 text-blue-600 dark:text-blue-300 text-xs">
              {proPlan.description || "Unlock all premium features."}
            </div>
            <ul className="mb-6 space-y-2">
              {proPlan.features && proPlan.features.length > 0
                ? proPlan.features.map((f) => (
                    <li key={f.feature.id} className="flex gap-2 items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-blue-500"
                      />
                      <span>
                        <span className="font-semibold">
                          {f.feature.name}
                          {f.value ? ` (${f.value})` : ""}:
                        </span>{" "}
                        {f.feature.description}
                      </span>
                    </li>
                  ))
                : proFeatures.map((f) => (
                    <li key={f.name} className="flex gap-2 items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-blue-500"
                      />
                      <span>
                        <span className="font-semibold">{f.name}:</span>{" "}
                        {f.desc}
                      </span>
                    </li>
                  ))}
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleSubscribePro}
            >
              Subscribe Pro
            </Button>
          </div>
        )}
        {/* Close button */}
        <button
          className="absolute top-2 right-2 bg-white border rounded-full w-8 h-8 flex items-center justify-center text-gray-500 shadow hover:bg-gray-100 z-20"
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
            className="h-10 px-2 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors"
            onClick={handleUpgrade}
          >
            <FontAwesomeIcon
              icon={faGem}
              className="text-blue-700 dark:text-blue-400 text-lg sm:text-xl"
            />
            <p className="text-gray-800 font-Opensans dark:text-white text-lg md:block hidden xs:inline">
              Upgrade to Premium
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
