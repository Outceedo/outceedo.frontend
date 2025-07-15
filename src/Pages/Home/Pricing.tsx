import { useState, useEffect } from "react";
import { CheckCircle, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";

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

// Default features for free plan (if not provided by API)
const defaultFreeFeatures = [
  { name: "Cloud Storage", description: "2 photos & 2 videos" },
  { name: "Reports", description: "Limited Access - 7 days only" },
  { name: "Experts Search", description: "Local experts only" },
  { name: "Bookings", description: "Recorded Video Assessment only" },
];

// Default features for pro plan (if not provided by API)
const defaultProFeatures = [
  { name: "Cloud Storage", description: "10 photos & 5 videos" },
  { name: "Reports", description: "Unlimited Access" },
  { name: "Experts Search", description: "Worldwide expert access" },
  { name: "Bookings", description: "Access to all expert services" },
  { name: "AI Features", description: "Access to AI features (coming soon)" },
];

export default function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const dispatch = useAppDispatch();
  const { currentProfile } = useAppSelector((state) => state.profile);
  const {
    isActive,
    planName,
    expiryDate,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  const API = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  // Fetch subscription status and plans on component mount
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
    fetchPlans();
  }, [dispatch]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setPlans(response.data?.plans || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Create free plan object
  const freePlan: Plan = {
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

  // Get pro plan (first plan from API)
  const proPlan = plans[0];

  // Check if user is on pro plan
  const isUserOnProPlan =
    isActive && planName && planName.toLowerCase() !== "free";
  const currentPlanName = isUserOnProPlan ? planName : "Free";

  // Handle subscription to pro plan
  const handleSubscribePro = async () => {
    if (!proPlan) {
      alert("Pro plan not available yet. Please contact support.");
      return;
    }

    try {
      const id = currentProfile?.id;
      if (!id) {
        alert("Please login to subscribe to a plan.");
        return;
      }

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
      console.error("Subscription error:", error);
      alert("Something went wrong during upgrade.");
    }
  };

  // Format expiry date
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

  // Create array of all plans to display
  const allPlans = [freePlan, ...(proPlan ? [proPlan] : [])];

  if (loadingPlans) {
    return (
      <div
        className="flex flex-col items-center py-10 px-4 md:px-10 mt-10"
        id="pricing"
      >
        <div className="text-center">
          <p className="text-lg">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center px-4 md:px-10 mt-12"
      id="pricing"
    >
      {/* Current subscription info */}
      {isUserOnProPlan && (
        <div className="w-full max-w-4xl mb-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-yellow-300 h-6 w-6" />
            <span className="font-bold text-lg">Current Plan: {planName}</span>
          </div>
          <p className="text-blue-100">
            {expiryDate && `Expires on ${formatExpiryDate(expiryDate)}`}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8 justify-start mb-12 w-full max-w-6xl">
        {allPlans.map((plan, index) => {
          const isCurrentPlan =
            plan.name.toLowerCase() === currentPlanName?.toLowerCase();
          const isFree = plan.name.toLowerCase() === "free";
          const isPro = !isFree;
          const features =
            plan.features && plan.features.length > 0
              ? plan.features
              : isFree
              ? defaultFreeFeatures.map((f) => ({
                  feature: {
                    id: f.name,
                    name: f.name,
                    key: f.name,
                    description: f.description,
                  },
                  id: f.name,
                  value: "",
                }))
              : defaultProFeatures.map((f) => ({
                  feature: {
                    id: f.name,
                    name: f.name,
                    key: f.name,
                    description: f.description,
                  },
                  id: f.name,
                  value: "",
                }));

          return (
            <div
              key={plan.id || index}
              className={`relative border-2 p-6 rounded-lg transition-all w-full text-left ${
                isPro ? "border-blue-500" : "border-gray-300"
              } ${isCurrentPlan ? "ring-2 ring-green-400" : ""}`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {/* Popular badge for pro plan */}
              {isPro && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white py-2 text-center rounded-t-lg mb-8">
                  Recommended
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute top-2 right-2">
                  <span className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow">
                    Current
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2 mt-6">
                {isFree ? (
                  <Gem className="text-gray-400 h-6 w-6" />
                ) : (
                  <Crown className="text-blue-500 h-6 w-6" />
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-extrabold">${plan.price}</span>
                <span className="text-gray-500 ml-1">/{plan.interval}</span>
              </div>

              <p className="text-gray-600 mb-6">{plan.description}</p>

              {/* Action Button */}
              {isFree ? (
                <Button
                  className="bg-gray-200 text-gray-500 w-full cursor-not-allowed mb-6"
                  disabled
                >
                  {isCurrentPlan ? "Current Plan" : "Free Plan"}
                </Button>
              ) : isCurrentPlan ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full cursor-not-allowed mb-6"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full mb-6"
                  onClick={handleSubscribePro}
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? "Processing..." : "Upgrade to Pro"}
                </Button>
              )}

              <div className="bg-gray-300 h-0.5 mb-4" />

              {/* Features List */}
              <ul className="text-gray-600 space-y-4">
                {features.map((feature, featureIndex) => (
                  <div key={feature.feature.id || featureIndex}>
                    <li className="flex gap-4 items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">
                          {feature.feature.name}
                        </span>
                        {feature.value && (
                          <span className="text-sm"> ({feature.value})</span>
                        )}
                        <p className="text-sm text-gray-500">
                          {feature.feature.description}
                        </p>
                      </div>
                    </li>
                    {featureIndex < features.length - 1 && (
                      <div className="bg-gray-300 h-0.5 my-4" />
                    )}
                  </div>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
