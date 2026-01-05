import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "day";
  description: string;
  features: any[];
}

export default function Settings() {
  const dispatch = useAppDispatch();
  const {
    isActive,
    planName,
    expiryDate,
    planId: currentPlanId,
    loading: subLoading,
  } = useAppSelector((state) => state.subscription);

  // Local State
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<
    "month" | "year" | "day"
  >("month");
  const [portalLoading, setPortalLoading] = useState(false);

  const isPremiumUser = isActive && planName?.toLowerCase() !== "free";
  const API_PLANS = `${import.meta.env.VITE_PORT}/api/v1/subscription/plans`;

  // Fetch subscription status on mount
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  // Fetch Plans when modal opens
  useEffect(() => {
    if (showModal) {
      setLoadingPlans(true);
      const token = localStorage.getItem("token");
      axios
        .get(API_PLANS, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setPlans(res.data?.plans || []))
        .catch(() => setPlans([]))
        .finally(() => setLoadingPlans(false));
    }
  }, [showModal]);

  // --- Handlers ---

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const api = `${
        import.meta.env.VITE_PORT
      }/api/v1/subscription/create-portal-session`;
      const response = await axios.post(
        api,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Could not redirect to billing portal.");
      }
    } catch (error) {
      console.error("Portal Error:", error);
      alert("Failed to access billing settings.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      localStorage.setItem("planId", planId);
      const api = `${
        import.meta.env.VITE_PORT
      }/api/v1/subscription/subscribe/${planId}`;
      const token = localStorage.getItem("token");
      const response = await axios.post(
        api,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.url) {
        window.open(response.data.url, "_self");
      }
    } catch (error) {
      alert("Something went wrong processing the request.");
    }
  };

  // --- Plan Helpers ---
  const basicPlan = {
    name: "Basic",
    description: "Free plan with limitations.",
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

  const isCurrentPlanSelected =
    isPremiumUser && currentPlanId === selectedPremiumPlan?.id;

  if (subLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Subscription Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage your plan, billing details, and invoices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Current Plan</CardTitle>
              <CardDescription className="mt-1">
                You are currently on the{" "}
                <span className="font-semibold text-primary">
                  {planName || "Basic"}
                </span>{" "}
                plan.
              </CardDescription>
            </div>
            {isActive ? (
              <Badge
                variant="default"
                className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
              >
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Billing Status
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  {isActive ? "Good Standing" : "Free Plan"}
                </span>
              </div>
            </div>
            {expiryDate && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Next Renewal
                </div>
                <div className="font-medium">{expiryDate.split(" ")[0]}</div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          {isPremiumUser ? (
            <>
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="w-full sm:w-auto gap-2"
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage Billing & Cancel
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
              >
                Change Plan
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Upgrade to Premium  
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* --- PLAN SELECTION MODAL (Inline) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Select a Plan</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-5xl"
                >
                  &times;
                </button>
              </div>

              {loadingPlans ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin h-8 w-8" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Basic Card */}
                  <div
                    className={`border rounded-xl p-6 flex flex-col items-center justify-between h-full ${
                      basicPlan.isCurrent
                        ? "ring-2 ring-green-500 bg-green-50/10"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="text-xl font-bold">Basic</h4>
                      <p className="text-gray-500 mt-2">
                        {basicPlan.description}
                      </p>
                      <div className="text-3xl font-bold mt-4">Free</div>
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
                        ? "border-red-500"
                        : "border-red-500 shadow-lg"
                    }`}
                  >
                    {!isPremiumUser && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMMENDED
                      </div>
                    )}
                    <div className="text-center w-full">
                      <h4 className="text-xl font-bold">Premium</h4>

                      {/* Interval Toggle */}
                      <div className="flex bg-gray-100 p-1 rounded-lg mt-4 w-full">
                        {["day", "month", "year"].map((int) => (
                          <button
                            key={int}
                            onClick={() => setSelectedInterval(int as any)}
                            className={`flex-1 py-1 text-sm font-medium rounded-md capitalize transition-all ${
                              selectedInterval === int
                                ? "bg-white shadow text-black"
                                : "text-gray-500"
                            }`}
                          >
                            {int}
                          </button>
                        ))}
                      </div>

                      <div className="text-3xl font-bold mt-6">
                        {selectedPremiumPlan
                          ? `£${selectedPremiumPlan.price}`
                          : "N/A"}
                        <span className="text-base font-normal text-gray-500">
                          /{selectedInterval}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 bg-red-500 hover:bg-red-700 text-white"
                      disabled={isCurrentPlanSelected}
                      onClick={() =>
                        selectedPremiumPlan &&
                        handleSubscribe(selectedPremiumPlan.id)
                      }
                    >
                      {isCurrentPlanSelected
                        ? "Current Plan"
                        : "Select Premium"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
