import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";
import Navbar from "./Navbar";
import OutceedoFooter from "./Footer";

// Interface for the structure of a subscription plan from the API
interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  createdAt: string;
  updatedAt: string;
  features: any[]; // Kept as 'any' for flexibility
}

export default function PricingPlans() {
  // State for storing plans, loading status, and selected billing interval
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
    "month"
  );

  // Redux and Router hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Selecting state from the Redux store
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  // API endpoint for fetching plans
  const API = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  // Effect to fetch user's subscription status and plan details on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptionStatus());
    }
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAuthenticated]);

  // Async function to fetch available plans from the backend
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API, {
        headers: {
          "Content-Type": "application/json",
          // Authorization header is needed if the endpoint is protected
          Authorization: `Bearer ${token}`,
        },
      });
      setPlans(response.data?.plans || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setPlans([]); // Set to empty array on failure
    } finally {
      setLoadingPlans(false);
    }
  };

  // Find the monthly and yearly plans from the fetched data
  const monthlyPlan = plans.find((p) => p.interval === "month");
  const yearlyPlan = plans.find((p) => p.interval === "year");

  // Determine which premium plan is currently selected by the user
  const selectedProPlan =
    selectedInterval === "month" ? monthlyPlan : yearlyPlan;

  // Determine the user's current subscription status
  const isUserOnProPlan =
    isAuthenticated && isActive && planName?.toLowerCase() !== "free";
  const currentPlanLabel = isUserOnProPlan ? "Premium" : "Basic";

  // Function to handle the subscription process
  const handleSubscribe = async (planId: string | undefined) => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }
    if (!planId) {
      alert("Selected plan is not available. Please contact support.");
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
        {}, // Empty body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Redirect to Stripe checkout page
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("No payment URL returned from the server.");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Something went wrong during the upgrade process.");
    }
  };

  const handleFreePlanClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    // No action needed if user is already on the basic plan
  };

  // Data for the feature comparison table, updated with dynamic prices
  const planComparisonData = [
    {
      label: "Subscription Fee",
      free: "Free",
      pro: loadingPlans
        ? "Loading..."
        : monthlyPlan && yearlyPlan
        ? `£${monthlyPlan.price}/month or £${yearlyPlan.price}/year`
        : "N/A",
    },
    { label: "Features", free: "Limited Use", pro: "Unlimited Use" },
    {
      label: "Cloud Storage",
      free: "2 Photos & 2 Videos",
      pro: "10 Photos & 5 Videos",
    },
    {
      label: "Reports",
      free: "Limited Access (7 days)",
      pro: "Unlimited Access",
    },
    {
      label: "Video Conference Recordings",
      free: "Limited Access (7 days)",
      pro: "Unlimited Access",
    },
    {
      label: "Experts Search",
      free: "Limited (Local)",
      pro: "Unlimited (Worldwide)",
    },
    { label: "Reports Download & Share", free: false, pro: true },
    {
      label: "Bookings (Expert Services)",
      free: "Recorded Video Assessment Only",
      pro: "All Available Services",
    },
    { label: "Building Fans/Followers", free: false, pro: true },
    {
      label: "Promotions (Social Media, Newsletters, Front Page)",
      free: false,
      pro: true,
    },
    { label: "Sponsorship Applications", free: false, pro: true },
    { label: "AI Features (coming soon)", free: false, pro: true },
  ];

  const showGoBack = location.pathname === "/plans";

  return (
    <>
      {showGoBack && <Navbar />}
      <div
        className="w-full flex flex-col items-center py-14 px-2 md:px-0 bg-[#f7fafb] min-h-screen mt-16"
        id="pricing"
      >
        <div className="flex flex-col md:flex-row md:items-start w-full max-w-6xl gap-12">
          {/* Left Section: Title and Go Back button */}
          <div className="flex-1 md:max-w-xs flex flex-col items-start justify-start mt-2 mb-8 md:mb-0">
            {showGoBack && (
              <button
                className="mb-4 flex items-center gap-2 text-gray-800 hover:text-red-500 font-medium"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
                Go Back
              </button>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left leading-tight px-3">
               Players choose a plan that's right for you
            </h2>
          </div>
          {/* Right Section: Plan Cards */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 w-full md:w-auto justify-end">
            {/* Basic Plan Card */}
            <div
              className={`relative border border-gray-300 bg-white rounded-xl p-8 flex-1 max-w-md min-w-[280px] flex flex-col items-center ${
                currentPlanLabel === "Basic" ? "ring-2 ring-green-300" : ""
              }`}
            >
              <div className="w-full flex flex-col items-center">
                <div className="font-bold text-2xl mb-2">Basic</div>
                <div className="text-gray-500 mb-4 text-center">
                  Get started with our core features.
                </div>
                <div className="text-gray-500 mb-4 text-center">Free Plan</div>
                <Button
                  className="bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black w-full shadow-none text-lg font-bold rounded-lg py-2 mt-2"
                  disabled={currentPlanLabel === "Basic"}
                  onClick={handleFreePlanClick}
                >
                  {currentPlanLabel === "Basic" && "Get Started"}
                </Button>
              </div>
            </div>
            {/* Premium Plan Card */}
            <div
              className={`relative border-[4px] ${
                currentPlanLabel === "Premium"
                  ? "border-red-500"
                  : "border-gray-300"
              } bg-white rounded-xl p-8 flex-1 max-w-md min-w-[280px] flex flex-col items-center`}
            >
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                <span className="bg-red-500 text-white text-xs font-bold py-1 px-5 rounded-full shadow">
                  Popular
                </span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="font-bold text-2xl mb-2">Premium</div>
                {/* Monthly/Yearly Toggle */}
                <div className="bg-gray-200 rounded-full p-1 flex w-full max-w-xs mb-4">
                  <button
                    onClick={() => setSelectedInterval("month")}
                    className={`flex-1 py-1 rounded-full font-semibold transition-colors ${
                      selectedInterval === "month"
                        ? "bg-white shadow"
                        : "text-gray-600"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedInterval("year")}
                    className={`flex-1 py-1 rounded-full font-semibold transition-colors ${
                      selectedInterval === "year"
                        ? "bg-white shadow"
                        : "text-gray-600"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
                <div className="text-gray-800 font-mono h-6 mb-4">
                  {loadingPlans
                    ? "Loading..."
                    : selectedProPlan
                    ? `£${selectedProPlan.price}/${selectedProPlan.interval}`
                    : "Not available"}
                </div>
                <Button
                  className="bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black w-full shadow-none text-lg font-bold rounded-lg py-2 mt-2"
                  onClick={() => handleSubscribe(selectedProPlan?.id)}
                  disabled={
                    currentPlanLabel === "Premium" ||
                    subscriptionLoading ||
                    loadingPlans ||
                    !selectedProPlan
                  }
                >
                  {currentPlanLabel === "Premium"
                    ? "Current Plan"
                    : "Get Started"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Plan Comparison Table */}
        <div className="overflow-x-auto w-full mt-12 max-w-4xl rounded-xl shadow border border-gray-200">
          <table className="w-full text-left bg-[#fcfbf6]">
            <thead>
              <tr>
                <th className="w-1/2 md:w-1/3 p-4 bg-[#f7fafb] text-base font-semibold text-gray-800">
                  Features
                </th>
                <th className="p-4 bg-[#f7fafb] text-lg font-bold text-gray-800 border-l border-gray-200">
                  Basic
                </th>
                <th className="p-4 bg-[#f7fafb] text-lg font-bold text-gray-800 border-l border-gray-200">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {planComparisonData.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 0 ? "bg-[#f8f5e8]" : "bg-white"}
                >
                  <td className="p-4 text-gray-700 font-medium border-t border-gray-200">
                    {row.label}
                  </td>
                  <td className="p-4 border-t border-l border-gray-200 text-gray-700 text-base">
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="p-4 border-t border-l border-gray-200 text-gray-700 text-base">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )
                    ) : (
                      row.pro
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showGoBack && <OutceedoFooter />}
    </>
  );
}
