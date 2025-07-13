import { AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faGem,
  faMoon,
  faSun,
  faCheckCircle,
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

const freeFeatures = [
  { name: "Subscription Fee", value: "Free", desc: "No monthly charges" },
  {
    name: "Features",
    value: "Limited",
    desc: "Limited use of platform features",
  },
  {
    name: "Cloud Storage",
    value: "2 photos & 2 videos",
    desc: "Limited storage capacity",
  },
  { name: "Reports", value: "Limited Access", desc: "7 days access only" },
  {
    name: "Video Conference Recordings",
    value: "Limited Access",
    desc: "7 days access only",
  },
  { name: "Experts Search", value: "Limited", desc: "Local experts only" },
  { name: "Reports Download & Share", value: "NO", desc: "Not available" },
  {
    name: "Bookings",
    value: "Limited",
    desc: "Recorded Video Assessment only",
  },
  { name: "Building Fans/Followers", value: "NO", desc: "Not available" },
  {
    name: "Promotions",
    value: "NO",
    desc: "Social Media, Newsletters, Front Page not available",
  },
  { name: "Sponsorship Applications", value: "NO", desc: "Not available" },
  { name: "AI Features", value: "NO", desc: "Coming soon - Premium only" },
];

const proFeatures = [
  {
    name: "Subscription Fee",
    value: "£10/month or £100/year",
    desc: "Flexible payment options",
  },
  {
    name: "Features",
    value: "Unlimited",
    desc: "Unlimited use of all platform features",
  },
  {
    name: "Cloud Storage",
    value: "10 photos & 5 videos",
    desc: "Enhanced storage capacity",
  },
  {
    name: "Reports",
    value: "Unlimited Access",
    desc: "Access all reports anytime",
  },
  {
    name: "Video Conference Recordings",
    value: "Unlimited Access",
    desc: "Access all recordings anytime",
  },
  {
    name: "Experts Search",
    value: "Unlimited",
    desc: "Worldwide expert access",
  },
  {
    name: "Reports Download & Share",
    value: "YES",
    desc: "Download and share reports",
  },
  {
    name: "Bookings",
    value: "All Services",
    desc: "Access to all expert services",
  },
  { name: "Building Fans/Followers", value: "YES", desc: "Build your fanbase" },
  {
    name: "Promotions",
    value: "YES",
    desc: "Social Media, Newsletters, Front Page promotions",
  },
  {
    name: "Sponsorship Applications",
    value: "YES",
    desc: "Apply for sponsorship opportunities",
  },
  {
    name: "AI Features",
    value: "YES",
    desc: "Access to AI features (coming soon)",
  },
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
    expiryDate,
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

  // Check if user's current plan is pro (active subscription)
  const isUserOnProPlan =
    isActive && planName && planName.toLowerCase() !== "free";

  // Format expiry date for display
  const formatExpiryDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
      const api = `${import.meta.env.VITE_PORT}/api/v1/subscription/subscribe/${
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
        {/* Show current plan info if user is on pro plan */}
        {isUserOnProPlan && (
          <div className="w-full mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon
                icon={faCrown}
                className="text-yellow-300 text-xl"
              />
              <span className="font-bold text-lg">
                Current Plan: {planName}
              </span>
            </div>
            <p className="text-blue-100">
              {expiryDate && `Expires on ${formatExpiryDate(expiryDate)}`}
            </p>
          </div>
        )}

        {/* Free Plan - Only show if user is not on pro plan */}
        {!isUserOnProPlan && (
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
        )}

        {/* Pro Plan */}
        {proPlan && (
          <div
            className={`relative flex-1 border-2 rounded-2xl p-6 flex flex-col ${
              isUserOnProPlan
                ? "border-green-400 bg-green-50 dark:bg-green-950"
                : "border-blue-400 bg-blue-50 dark:bg-blue-950"
            }`}
          >
            {isUserOnProPlan && (
              <div className="absolute right-4 top-4">
                <span className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow">
                  Active
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon
                icon={isUserOnProPlan ? faCrown : faGem}
                className={`text-xl ${
                  isUserOnProPlan ? "text-green-500" : "text-blue-500"
                }`}
              />
              <span
                className={`font-bold text-lg ${
                  isUserOnProPlan
                    ? "text-green-700 dark:text-green-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                Pro Plan
              </span>
            </div>
            <div
              className={`text-2xl font-extrabold mb-1 ${
                isUserOnProPlan
                  ? "text-green-700 dark:text-green-200"
                  : "text-blue-700 dark:text-blue-200"
              }`}
            >
              ${proPlan.price}
              <span
                className={`text-base font-normal ml-1 ${
                  isUserOnProPlan ? "text-green-500" : "text-blue-500"
                }`}
              >
                /{proPlan.interval}
              </span>
            </div>
            <div
              className={`mb-3 text-xs ${
                isUserOnProPlan
                  ? "text-green-600 dark:text-green-300"
                  : "text-blue-600 dark:text-blue-300"
              }`}
            >
              {proPlan.description || "Unlock all premium features."}
            </div>
            <ul className="mb-6 space-y-2">
              {proPlan.features && proPlan.features.length > 0
                ? proPlan.features.map((f) => (
                    <li key={f.feature.id} className="flex gap-2 items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className={
                          isUserOnProPlan ? "text-green-500" : "text-blue-500"
                        }
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
                        className={
                          isUserOnProPlan ? "text-green-500" : "text-blue-500"
                        }
                      />
                      <span>
                        <span className="font-semibold">{f.name}:</span>{" "}
                        {f.desc}
                      </span>
                    </li>
                  ))}
            </ul>
            {isUserOnProPlan ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold cursor-not-allowed"
                disabled
              >
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleSubscribePro}
              >
                Subscribe Pro
              </Button>
            )}
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
            className={`h-10 px-2 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
              isUserOnProPlan
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600"
            }`}
            onClick={handleUpgrade}
            disabled={subscriptionLoading}
          >
            <FontAwesomeIcon
              icon={isUserOnProPlan ? faCrown : faGem}
              className={`text-lg sm:text-xl ${
                isUserOnProPlan
                  ? "text-yellow-300"
                  : "text-blue-700 dark:text-blue-400"
              }`}
            />
            <p
              className={`font-Opensans text-lg md:block hidden xs:inline ${
                isUserOnProPlan ? "text-white" : "text-gray-800 dark:text-white"
              }`}
            >
              {subscriptionLoading
                ? "Loading..."
                : isUserOnProPlan
                ? `${planName} Plan`
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
