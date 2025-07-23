import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
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

// Table configuration: Rows, keys, and how each plan answers
const planComparisonData = [
  {
    label: "Subscription Fee",
    key: "price",
    free: "Free",
    pro: "£10/month or £100/year",
  },
  {
    label: "Features",
    key: "features",
    free: "Limited Use",
    pro: "Unlimited Use",
  },
  {
    label: "Cloud Storage",
    key: "cloudStorage",
    free: "2 Photos & 2 Videos",
    pro: "10 Photos & 5 Videos",
  },
  {
    label: "Reports",
    key: "reports",
    free: "Limited Access (7 days)",
    pro: "Unlimited Access",
  },
  {
    label: "Video Conference Recordings",
    key: "videoConference",
    free: "Limited Access (7 days)",
    pro: "Unlimited Access",
  },
  {
    label: "Experts Search",
    key: "expertsSearch",
    free: "Limited (Local)",
    pro: "Unlimited (Worldwide)",
  },
  {
    label: "Reports Download & Share",
    key: "reportsDownload",
    free: false,
    pro: true,
  },
  {
    label: "Bookings (Expert Services)",
    key: "bookings",
    free: "Recorded Video Assessment Only",
    pro: "All Available Services",
  },
  {
    label: "Building Fans/Followers",
    key: "fansFollowers",
    free: false,
    pro: true,
  },
  {
    label: "Promotions (Social Media, Newsletters, Front Page)",
    key: "promotions",
    free: false,
    pro: true,
  },
  {
    label: "Sponsorship Applications",
    key: "sponsorship",
    free: false,
    pro: true,
  },
  {
    label: "AI Features (coming soon)",
    key: "aiFeatures",
    free: false,
    pro: true,
  },
];

export default function PricingPlans() {
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

  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
    fetchPlans();
    // eslint-disable-next-line
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
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Plans info, fallback if API fails
  const freePlan = {
    id: "free-plan",
    name: "Basic",
    price: 0,
    interval: "month",
    description: "",
    stripePriceId: "",
    stripeProductId: "",
    createdAt: "",
    updatedAt: "",
    features: [],
  };

  const proPlan = plans[0]
    ? {
        ...plans[0],
        name: "Premium",
        description: "",
      }
    : {
        id: "pro-plan",
        name: "Premium",
        price: 10,
        interval: "month",
        description:
          "Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.",
        stripePriceId: "",
        stripeProductId: "",
        createdAt: "",
        updatedAt: "",
        features: [],
      };

  // Subscription state
  const isUserOnProPlan =
    isActive && planName && planName.toLowerCase() !== "free";
  const currentPlanName = isUserOnProPlan ? proPlan.name : freePlan.name;

  // Handle subscribe
  const handleSubscribePro = async () => {
    if (!proPlan) {
      alert("Premium plan not available yet. Please contact support.");
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
      alert("Something went wrong during upgrade.");
    }
  };

  // Table values for free & pro
  const tableData = planComparisonData.map((row) => ({
    label: row.label,
    free: row.free,
    pro: row.pro,
  }));

  return (
    <div className="w-full flex flex-col items-center py-14 px-2 md:px-0 bg-[#f7fafb] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start w-full max-w-6xl gap-12">
        {/* Left: Title */}
        <div className="flex-1 md:max-w-xs flex flex-col items-start justify-start mt-2 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-left leading-tight">
            Choose a plan
            <br />
            that's right for you
          </h2>
        </div>
        {/* Right: Plan Cards */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 w-full md:w-auto justify-end">
          {/* Basic Plan Card */}
          <div
            className={`relative border border-gray-300 bg-white rounded-xl p-8 flex-1 max-w-md min-w-[280px] flex flex-col items-center ${
              currentPlanName === freePlan.name ? "ring-2 ring-green-300" : ""
            }`}
          >
            <div className="w-full flex flex-col items-center">
              <div className="font-bold text-2xl mb-2">{freePlan.name}</div>
              <div className="text-gray-500 mb-4 text-center">
                {freePlan.description}
              </div>
              <Button
                className="bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black w-full shadow-none text-lg font-bold rounded-lg py-2 mt-2"
                disabled={currentPlanName === freePlan.name}
              >
                {currentPlanName === freePlan.name
                  ? "Current Plan"
                  : "Get Started"}
              </Button>
            </div>
          </div>
          {/* Premium Plan Card */}
          <div
            className={`relative border-[4px] ${
              currentPlanName === proPlan.name
                ? "border-red-500"
                : "border-gray-300"
            } bg-white rounded-xl p-8 flex-1 max-w-md min-w-[280px] flex flex-col items-center`}
          >
            {/* Popular badge */}
            <div className="absolute -top-5 left-0 right-0 flex justify-center">
              <span className="bg-red-500 text-white text-xs font-bold py-1 px-5 rounded-full shadow">
                Popular
              </span>
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="font-bold text-2xl mb-2">{proPlan.name}</div>
              <div className="text-gray-500 mb-4 text-center">
                {proPlan.description}
              </div>
              <Button
                className="bg-[#ffe07f] hover:bg-[#ffe07f]/90 text-black w-full shadow-none text-lg font-bold rounded-lg py-2 mt-2"
                onClick={handleSubscribePro}
                disabled={
                  currentPlanName === proPlan.name || subscriptionLoading
                }
              >
                {currentPlanName === proPlan.name
                  ? "Current Plan"
                  : subscriptionLoading
                  ? "Processing..."
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
                &nbsp;
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
            {tableData.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 === 0 ? "bg-[#f8f5e8]" : "bg-white"}
              >
                {/* Row label */}
                <td className="p-4 text-gray-700 font-medium border-t border-gray-200">
                  {row.label}
                </td>
                {/* Free value */}
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
                {/* Pro value */}
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
  );
}
