import {
  AlignJustify,
  ChevronDown,
  CreditCard,
  Settings,
  Loader2,
} from "lucide-react"; // Added Loader2
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faGem,
  faMoon,
  faSun,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";

interface PlayerHeaderProps {
  setOpen: (open: boolean) => void;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "day";
  description: string;
  features: any[];
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
  { path: "/player/referral", name: "Referral Program" },
];

function PlayerHeader({ setOpen }: PlayerHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();
  const currentTitle =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.name ??
    "Dashboard";
  const API_PLANS = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  // Modal and Plans state
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<
    "month" | "year" | "day"
  >("month");

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  // Redux Selectors
  const {
    isActive,
    planName,
    planId: currentPlanId,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  // Determine if the user has any premium plan
  const isPremiumUser = isActive && planName?.toLowerCase() !== "free";

  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    if (showModal) {
      setLoadingPlans(true);
      const token = localStorage.getItem("token");
      axios
        .get(API_PLANS, {
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

  const handleSubscribe = async (planId: string) => {
    if (!planId) {
      alert("Selected plan is not available.");
      return;
    }
    try {
      localStorage.setItem("planId", planId);
      const api = `${
        import.meta.env.VITE_PORT
      }/api/v1/subscription/subscribe/${planId}`;
      const token = localStorage.getItem("token");
      const response = await axios.post(
        api,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data?.url) {
        window.open(response.data.url, "_self");
      } else {
        alert("No payment URL returned.");
      }
    } catch (error) {
      alert("Something went wrong during upgrade.");
    }
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem("token");
      const api = `${
        import.meta.env.VITE_PORT
      }/api/v1/subscription/create-portal-session`;

      const response = await axios.post(
        api,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Could not retrieve billing portal.");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to access billing settings.");
    }
  };

  const handleUpgradeClick = () => {
    if (isPremiumUser) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setShowModal(true);
    }
  };

  // --- Plan Helpers ---
  const basicPlan = {
    name: "Basic",
    description: "Your current free plan.",
    price: "Free",
    isCurrent: !isPremiumUser,
  };
  const dailyPlan = plans.find((p) => p.interval === "day");
  const monthlyPlan = plans.find((p) => p.interval === "month");
  const yearlyPlan = plans.find((p) => p.interval === "year");

  const selectedPremiumPlan =
    selectedInterval === "month"
      ? monthlyPlan
      : selectedInterval === "year"
        ? yearlyPlan
        : dailyPlan;

  // Check if the selected card matches the user's actual plan
  const isCurrentPlanSelected =
    isPremiumUser && currentPlanId === selectedPremiumPlan?.id;

  // --- NEW MODAL UI (Matches Settings.tsx) ---
  const modal = showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select a Plan
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-4xl"
            >
              &times;
            </button>
          </div>

          {loadingPlans ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-red-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Card */}
              <div
                className={`border rounded-xl p-6 flex flex-col items-center justify-between h-full ${
                  basicPlan.isCurrent
                    ? "ring-2 ring-green-500 bg-green-50/10 dark:bg-green-900/10"
                    : "bg-gray-50 dark:bg-slate-900"
                }`}
              >
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Basic
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {basicPlan.description}
                  </p>
                  <div className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">
                    Free
                  </div>
                </div>
                <Button
                  onClick={() => isPremiumUser && handleManageBilling()}
                  disabled={!isPremiumUser}
                  variant={isPremiumUser ? "outline" : "secondary"}
                  className="w-full mt-6"
                >
                  {isPremiumUser ? "Downgrade to Free" : "Current Plan"}
                </Button>
              </div>

              {/* Premium Card */}
              <div
                className={`border-2 rounded-xl p-6 flex flex-col items-center justify-between h-full relative ${
                  isPremiumUser
                    ? "border-red-400 dark:border-red-500"
                    : "border-red-500 shadow-lg bg-white dark:bg-slate-900"
                }`}
              >
                {!isPremiumUser && (
                  <div className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}
                <div className="text-center w-full">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Premium
                  </h4>

                  {/* Interval Toggle */}
                  <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mt-4 w-full">
                    {["day", "month", "year"].map((int) => (
                      <button
                        key={int}
                        onClick={() => setSelectedInterval(int as any)}
                        className={`flex-1 py-1 text-sm font-medium rounded-md capitalize transition-all ${
                          selectedInterval === int
                            ? "bg-white dark:bg-slate-700 shadow text-black dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {int}
                      </button>
                    ))}
                  </div>

                  <div className="text-3xl font-bold mt-6 text-gray-900 dark:text-white">
                    {selectedPremiumPlan
                      ? `£${selectedPremiumPlan.price}`
                      : "N/A"}
                    <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                      /{selectedInterval}
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full mt-6 ${
                    isCurrentPlanSelected
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  disabled={isCurrentPlanSelected}
                  onClick={() =>
                    selectedPremiumPlan &&
                    handleSubscribe(selectedPremiumPlan.id)
                  }
                >
                  {isCurrentPlanSelected
                    ? "Current Plan"
                    : isPremiumUser
                      ? "Switch Plan"
                      : "Select Premium"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="flex flex-nowrap items-center justify-between gap-2 px-3 py-3 bg-background dark:bg-slate-950 w-full relative">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            onClick={() => setOpen(true)}
            className="lg:hidden bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600 p-2"
            size="sm"
          >
            <AlignJustify className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[120px] sm:max-w-xs md:max-w-md">
            {currentTitle}
          </h2>
        </div>
        <div className="flex flex-nowrap justify-end gap-2 items-center flex-shrink-0">
          <div className="relative" ref={dropdownRef}>
            <Button
              className={`h-10 px-2 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
                isPremiumUser
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600"
              }`}
              onClick={handleUpgradeClick}
              disabled={subscriptionLoading}
            >
              <FontAwesomeIcon
                icon={isPremiumUser ? faCrown : faGem}
                className={`text-lg sm:text-xl ${
                  isPremiumUser
                    ? "text-yellow-300"
                    : "text-blue-700 dark:text-blue-400"
                }`}
              />
              <p
                className={`font-Opensans text-lg md:block hidden xs:inline ${
                  isPremiumUser ? "text-white" : "text-gray-800 dark:text-white"
                }`}
              >
                {subscriptionLoading
                  ? "Loading..."
                  : isPremiumUser
                    ? "Premium Plan"
                    : "Upgrade to Premium"}
              </p>
              {isPremiumUser && (
                <ChevronDown className="h-4 w-4 ml-1 text-white opacity-80" />
              )}
            </Button>

            {isDropdownOpen && isPremiumUser && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 focus:outline-none z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowModal(true);
                    }}
                    className="flex w-full items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <CreditCard className="mr-3 h-4 w-4" />
                    Change Plan
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleManageBilling();
                    }}
                    className="flex w-full items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Manage Billing & Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

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
