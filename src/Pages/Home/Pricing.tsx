import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Check,
  X,
  Zap,
  ShieldCheck,
  Crown,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

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
  features: any[];
}

const planComparisonData = [
  {
    label: "Subscription Fee",
    free: "Free",
    pro: "dynamic",
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

export default function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
    "month"
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  const API = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptionStatus());
    }
    fetchPlans();
  }, [dispatch, isAuthenticated]);

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
      console.error("Failed to fetch plans:", error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const monthlyPlan = plans.find((p) => p.interval === "month");
  const yearlyPlan = plans.find((p) => p.interval === "year");
  const selectedProPlan =
    selectedInterval === "month" ? monthlyPlan : yearlyPlan;

  const isUserOnProPlan =
    isAuthenticated && isActive && planName?.toLowerCase() !== "free";
  const currentPlanLabel = isUserOnProPlan ? "Premium" : "Basic";

  const handleSubscribe = async (planId: string | undefined) => {
    if (!isAuthenticated) {
      navigate("/login");
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
  };

  const showGoBack = location.pathname === "/plans";

  return (
    <>
      {showGoBack && <Navbar />}

      <section
        className="relative bg-white min-h-screen pt-32 pb-20 overflow-hidden"
        id="pricing"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#ef4444_1px,_transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Go Back Button */}
          {showGoBack && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-slate-600 hover:text-red-500 font-bold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </motion.button>
          )}

          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-8 bg-red-500"></span>
              Subscription Plans
              <span className="h-[2px] w-8 bg-red-500"></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic"
            >
              CHOOSE YOUR <span className="text-red-500">LEVEL.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-gray-500 max-w-xl mx-auto font-medium"
            >
              Players choose a plan that's right for you. Start free or unlock
              the full tactical ecosystem.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto mb-20">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8 }}
              className={`group relative flex flex-col rounded-[2.5rem] border-2 ${
                currentPlanLabel === "Basic"
                  ? "border-green-500"
                  : "border-gray-100"
              } bg-white p-10 transition-all duration-500 hover:border-gray-200 hover:shadow-2xl`}
            >
              {currentPlanLabel === "Basic" && (
                <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg">
                  <Check size={12} /> Current Plan
                </div>
              )}

              <div className="mb-10 flex justify-between items-start">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:text-red-500 transition-colors">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                    Basic
                  </h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
                    The Foundation
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="text-5xl font-black tracking-tighter text-gray-900">
                      £0
                    </span>
                    <span className="text-sm font-bold text-gray-400 ml-1 italic">
                      /mo
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-widest">
                    Free Forever
                  </p>
                </div>
              </div>

              <p className="text-gray-500 font-medium mb-8">
                Get started with our core features. Perfect for players just
                beginning their journey.
              </p>

              <button
                onClick={handleFreePlanClick}
                disabled={currentPlanLabel === "Basic"}
                className={`w-full h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
                  currentPlanLabel === "Basic"
                    ? "border-green-500 bg-green-50 text-green-600 cursor-default"
                    : "border-black bg-transparent text-black hover:bg-black hover:text-white"
                }`}
              >
                {currentPlanLabel === "Basic" ? (
                  <>
                    <Check size={16} /> Current Plan
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -8 }}
              className={`group relative flex flex-col rounded-[2.5rem] bg-white border-2 ${
                currentPlanLabel === "Premium"
                  ? "border-green-500"
                  : "border-red-500"
              } p-10 overflow-hidden transition-all duration-500 shadow-2xl shadow-red-500/10`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] rounded-full" />

              {currentPlanLabel === "Premium" ? (
                <div className="absolute -top-3 right-8 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg">
                  <Check size={12} /> Current Plan
                </div>
              ) : (
                <div className="absolute top-2 right-8 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-500/20">
                  <Crown size={12} /> Popular
                </div>
              )}

              <div className="relative z-10 mb-10 flex justify-between items-start">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-red-500/30">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                    Premium
                  </h3>
                  <p className="text-red-500 font-black text-xs uppercase tracking-widest mt-1">
                    Accelerated Path
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="text-5xl font-black tracking-tighter text-gray-900">
                      {loadingPlans
                        ? "..."
                        : selectedProPlan
                        ? `£${selectedProPlan.price}`
                        : "£10"}
                    </span>
                    <span className="text-sm font-bold text-gray-400 ml-1 italic">
                      /{selectedInterval === "month" ? "mo" : "yr"}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={selectedInterval}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-black text-red-500 mt-1 uppercase tracking-widest"
                    >
                      {selectedInterval === "year"
                        ? "Save 20% Annually"
                        : "Billed Monthly"}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Interval Toggle */}
              <div className="relative z-10 flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedInterval("month")}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    selectedInterval === "month"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval("year")}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    selectedInterval === "year"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Yearly
                </button>
              </div>

              <p className="relative z-10 text-gray-500 font-medium mb-8">
                Unlock the full tactical ecosystem to accelerate your
                professional career.
              </p>

              <button
                onClick={() => handleSubscribe(selectedProPlan?.id)}
                disabled={
                  currentPlanLabel === "Premium" ||
                  subscriptionLoading ||
                  loadingPlans ||
                  !selectedProPlan
                }
                className={`relative z-10 w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  currentPlanLabel === "Premium"
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20"
                }`}
              >
                {currentPlanLabel === "Premium" ? (
                  <>
                    <Check size={16} /> Current Plan
                  </>
                ) : (
                  <>
                    Upgrade to Premium <Crown size={16} />
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-8">
              Feature Comparison
            </h3>

            <div className="rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      Features
                    </th>
                    <th className="p-6 text-center text-xs font-black text-gray-900 uppercase tracking-widest border-l border-gray-100">
                      Basic
                    </th>
                    <th className="p-6 text-center text-xs font-black text-red-500 uppercase tracking-widest border-l border-gray-100">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planComparisonData.map((row, idx) => (
                    <tr
                      key={row.label}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="p-5 text-gray-700 font-medium border-t border-gray-100">
                        {row.label}
                      </td>
                      <td className="p-5 text-center border-t border-l border-gray-100">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center border-t border-l border-gray-100 bg-red-50/30">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : row.pro === "dynamic" ? (
                          <span className="text-sm text-gray-900 font-bold">
                            {loadingPlans
                              ? "Loading..."
                              : monthlyPlan && yearlyPlan
                              ? `£${monthlyPlan.price}/mo or £${yearlyPlan.price}/yr`
                              : "Contact us"}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-900 font-bold">
                            {row.pro}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
              Have more specific needs?
            </p>
            <button
              onClick={() => navigate("/contactus")}
              className="text-gray-900 font-black uppercase text-sm border-b-2 border-red-500 pb-1 hover:text-red-500 transition-colors"
            >
              Contact Enterprise Scouting
            </button>
          </motion.div>
        </div>
      </section>

      {showGoBack && <FooterSection />}
    </>
  );
}
