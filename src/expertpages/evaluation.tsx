import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

interface Attribute {
  label: string;
  color: string;
  subskills: string[];
}

interface CategoryData {
  id: string;
  name: string;
  description: string;
}

type AttributeScore = {
  percentage: number;
  subskills: Record<string, number>;
};

interface FormState {
  attributes: Record<string, AttributeScore>;
  rating: number;
  strengths: string;
  improvement: string;
  verdict: string;
}

const attributes: Attribute[] = [
  {
    label: "Pace",
    color: "#E63946",
    subskills: ["Acceleration", "Sprint Speed"],
  },
  {
    label: "Shooting",
    color: "#D62828",
    subskills: [
      "Att.Positioning",
      "Finishing",
      "Long Shots",
      "Shot Power",
      "Penalties",
      "Volleys",
    ],
  },
  {
    label: "Passing",
    color: "#4CAF50",
    subskills: [
      "Short Passing",
      "Vision",
      "Long Passing",
      "FK. Accuracy",
      "Crossing",
      "Curve",
    ],
  },
  {
    label: "Dribbling",
    color: "#68A357",
    subskills: ["Dribbling", "Ball Control", "Agility", "Balance", "Reactions"],
  },
  {
    label: "Defending",
    color: "#2D6A4F",
    subskills: [
      "Marking",
      "Stand Tackle",
      "Interception",
      "Heading Accuracy",
      "Slide Tackle",
    ],
  },
  {
    label: "Physical",
    color: "#F4A261",
    subskills: ["Strength", "Stamina", "Aggression", "Jumping"],
  },
];

const initialAttributeState = () =>
  Object.fromEntries(
    attributes.map((attr) => [
      attr.label,
      {
        percentage: 0,
        subskills: Object.fromEntries(attr.subskills.map((s) => [s, 0])),
      },
    ])
  ) as Record<string, AttributeScore>;

export default function AssessmentEvaluationForm({
  onSubmit,
  onBack,
}: {
  onSubmit?: (data: FormState) => void;
  onBack?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    attributes: initialAttributeState(),
    rating: 0,
    strengths: "",
    improvement: "",
    verdict: "",
  });

  const [playerName, setPlayerName] = useState<string>("");
  const [playerPhoto, setPlayerPhoto] = useState<string>("");
  const [serviceName, setServiceName] = useState<string>("");

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, string>>(
    {}
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const totalSteps = attributes.length + 2;

  useEffect(() => {
    setPlayerName(localStorage.getItem("playerName") || "");
    setPlayerPhoto(localStorage.getItem("playerPhoto") || "");
    setServiceName(localStorage.getItem("serviceName") || "");
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/api/v1/user/reports/categories/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        const result = response.data;

        if (result.data && Array.isArray(result.data)) {
          setCategories(result.data);

          const mapping: Record<string, string> = {};

          result.data.forEach((cat: CategoryData) => {
            mapping[cat.name] = cat.id;
          });

          setCategoryIdMap(mapping);
          setCategoriesLoaded(true);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
      }
    }
  };

  const calculateAverage = (subskills: Record<string, number>) => {
    const scores = Object.values(subskills).map((n) => (isNaN(n) ? 0 : n));
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / scores.length);
  };

  useEffect(() => {
    setForm((prev) => {
      const updatedAttributes: Record<string, AttributeScore> = {
        ...prev.attributes,
      };
      attributes.forEach((attr) => {
        const avg = calculateAverage(prev.attributes[attr.label].subskills);
        updatedAttributes[attr.label] = {
          ...updatedAttributes[attr.label],
          percentage: avg,
        };
      });
      return { ...prev, attributes: updatedAttributes };
    });
  }, [step]);

  const handleSubskillChange = (attr: string, sub: string, val: number) => {
    setForm((prev) => {
      const newSubskills = {
        ...prev.attributes[attr].subskills,
        [sub]: isNaN(val) ? 0 : val,
      };
      const avg = calculateAverage(newSubskills);
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: {
            ...prev.attributes[attr],
            subskills: newSubskills,
            percentage: avg,
          },
        },
      };
    });
  };

  const handleText = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep = () => {
    if (step < attributes.length) {
      const attr = attributes[step];
      for (const sub of attr.subskills) {
        const subScore = form.attributes[attr.label].subskills[sub];
        if (subScore < 0 || subScore > 100 || isNaN(subScore)) return false;
      }
      return true;
    }
    if (step === attributes.length) {
      return form.rating >= 0 && form.rating <= 5;
    }
    if (step === attributes.length + 1) {
      return (
        form.strengths.trim().length > 0 &&
        form.improvement.trim().length > 0 &&
        form.verdict.trim().length > 0
      );
    }
    return true;
  };

  const getCategoryId = (attrLabel: string): string | null => {
    const categoryId = categoryIdMap[attrLabel];

    if (categoryId) {
      return categoryId;
    }

    const matchingCategory = categories.find((cat) => cat.name === attrLabel);
    if (matchingCategory) {
      return matchingCategory.id;
    }

    return null;
  };

  const postAttributeStep = async (attrLabel: string) => {
    const playerId = localStorage.getItem("playerId");
    const bookingId = localStorage.getItem("bookingId");
    const token = localStorage.getItem("token");

    if (!categoriesLoaded || categories.length === 0) {
      alert(
        "Categories are still loading. Please wait a moment and try again."
      );
      return false;
    }

    const categoryId = getCategoryId(attrLabel);

    if (!playerId || !bookingId || !categoryId || !token) {
      alert(`Missing required data. Please check:
        - Player ID: ${playerId ? "✓ Found" : "✗ Missing"}
        - Booking ID: ${bookingId ? "✓ Found" : "✗ Missing"}
        - Category ID for ${attrLabel}: ${categoryId ? "✓ Found" : "✗ Missing"}
        - Auth Token: ${token ? "✓ Found" : "✗ Missing"}
        
        ${
          !categoryId
            ? `Available categories: ${categories
                .map((c) => c.name)
                .join(", ")}`
            : ""
        }`);
      return false;
    }

    const formattedAttributes = form.attributes[attrLabel].subskills;
    const overallScore = form.attributes[attrLabel].percentage;

    const payload = {
      playerId,
      bookingId,
      categoryId,
      attributes: formattedAttributes,
      overallScore: overallScore,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_PORT}/api/v1/user/reports`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`API Error: ${errorMessage}`);
      } else {
        alert(
          `Network error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
      return false;
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      alert("Please fill in all required fields with valid values (0-100).");
      return;
    }

    if (!categoriesLoaded && step < attributes.length) {
      alert("Categories are still loading. Please wait a moment.");
      return;
    }

    if (step < attributes.length) {
      setPendingStep(step + 1);
      setShowConfirm(true);
    } else {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (pendingStep !== null && step < attributes.length) {
      const attrLabel = attributes[step].label;
      const success = await postAttributeStep(attrLabel);

      if (success) {
        setStep(pendingStep);
        setShowConfirm(false);
        setPendingStep(null);
      } else {
        setShowConfirm(false);
        setPendingStep(null);
      }
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingStep(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitLoading(true);

    try {
      const playerId = localStorage.getItem("playerId");
      const bookingId = localStorage.getItem("bookingId");
      const token = localStorage.getItem("token");

      if (!playerId || !bookingId || !token) {
        alert("Missing required data for final submission.");
        setSubmitLoading(false);
        return;
      }

      const payload = {
        playerId,
        bookingId,
        strengths: form.strengths,
        improvements: form.improvement,
        verdict: form.verdict,
        rating: form.rating,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_PORT}/api/v1/user/reports/review`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSubmit?.(form);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Failed to submit evaluation: ${errorMessage}`);
      } else {
        alert("Failed to submit evaluation. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
      Swal.fire({
        icon: "success",
        title: "Assessment Report submitter successfully",
        timer: 2000,
      });
      window.location.reload();
    }
  };

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-xl font-bold mb-4 text-gray-900">
              Confirm Step Submission
            </div>
            <p className="mb-6 text-gray-600">
              Once submitted, this attribute step cannot be edited. Are you sure
              you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {loading ? "Submitting..." : "Submit Step"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-4xl mx-auto px-10 py-5 bg-white rounded-xl shadow-lg max-h-screen overflow-y-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          {playerPhoto ? (
            <img
              src={playerPhoto}
              alt={playerName}
              className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl text-gray-500">
              <span>👤</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-gray-900">
              {playerName || "Player"}
            </span>
            <span className="text-sm text-gray-500">
              {serviceName ? serviceName : "Player Assessment Report"}
            </span>
          </div>
        </div>

        {!categoriesLoaded && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
            Loading categories... Please wait before proceeding.
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Step {step + 1} of {totalSteps}
            </span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={((step + 1) / totalSteps) * 100} className="h-2" />
        </div>

        <div className="flex justify-between items-center mb-3 overflow-x-auto">
          {attributes.map((attr, idx) => (
            <div
              key={attr.label}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors ${
                  step === idx
                    ? "bg-red-500"
                    : step > idx
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                {idx + 1}
              </div>
              <span className="mt-2 text-xs text-center truncate w-full">
                {attr.label}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors ${
                step === attributes.length
                  ? "bg-red-500"
                  : step > attributes.length
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {attributes.length + 1}
            </div>
            <span className="mt-2 text-xs">Rating</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors ${
                step === attributes.length + 1 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              {attributes.length + 2}
            </div>
            <span className="mt-2 text-xs">Review</span>
          </div>
        </div>

        {step < attributes.length && (
          <Card className="px-6 -mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {attributes[step].label}
            </h2>

            <div className="">
              <Label className="text-md font-semibold mb-2 block">
                Overall {attributes[step].label} Score
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress
                    value={form.attributes[attributes[step].label].percentage}
                    className="h-3"
                  />
                </div>
                <span
                  className="text-md font-bold min-w-[60px] text-center"
                  style={{ color: attributes[step].color }}
                >
                  {form.attributes[attributes[step].label].percentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {attributes[step].subskills.map((sub) => (
                <div key={sub} className="space-y-2">
                  <Label className="text-sm font-medium">{sub}</Label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      form.attributes[attributes[step].label].subskills[sub] ||
                      ""
                    }
                    onChange={(e) =>
                      handleSubskillChange(
                        attributes[step].label,
                        sub,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0-100"
                    required
                  />
                  <Progress
                    value={
                      form.attributes[attributes[step].label].subskills[sub] ||
                      0
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === attributes.length && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Overall Rating
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Label className="text-lg font-medium">Rate the Player:</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm((prev) => ({ ...prev, rating: i }))}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star
                      fill={i <= form.rating ? "#FACC15" : "none"}
                      stroke="#FACC15"
                      className="w-10 h-10"
                    />
                  </button>
                ))}
                <span className="ml-4 text-2xl font-bold text-gray-900">
                  {form.rating} / 5
                </span>
              </div>
            </div>
          </Card>
        )}

        {step === attributes.length + 1 && (
          <Card className="px-6 py-2">
            <h2 className="text-lg font-bold text-gray-900">
              Assessment Review
            </h2>
            <div className="space-y-2">
              <div>
                <Label className="text-md font-medium mb-2 block">
                  Strengths
                </Label>
                <Textarea
                  name="strengths"
                  value={form.strengths}
                  onChange={handleText}
                  required
                  className="w-full min-h-[50px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Describe the player's key strengths and standout qualities..."
                />
              </div>
              <div>
                <Label className="text-md font-medium mb-2 block">
                  Areas for Improvement
                </Label>
                <Textarea
                  name="improvement"
                  value={form.improvement}
                  onChange={handleText}
                  required
                  className="w-full min-h-[50px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Identify specific areas where the player can improve..."
                />
              </div>
              <div>
                <Label className="text-md font-medium mb-2 block">
                  Final Verdict
                </Label>
                <Textarea
                  name="verdict"
                  value={form.verdict}
                  onChange={handleText}
                  required
                  className="w-full min-h-[90px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Provide your overall assessment and recommendations..."
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-between items-center mt-8 mb-6">
          <Button
            type="button"
            onClick={onBack || prevStep}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Exit" : "Back"}
          </Button>

          {step < totalSteps - 1 && (
            <Button
              type="button"
              onClick={nextStep}
              disabled={
                !validateStep() ||
                loading ||
                (!categoriesLoaded && step < attributes.length)
              }
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white hover:bg-red-600"
            >
              {loading ? "Saving..." : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === totalSteps - 1 && (
            <Button
              type="submit"
              disabled={!validateStep() || submitLoading}
              className="px-6 py-3 bg-green-600 text-white hover:bg-green-700"
            >
              {submitLoading ? "Submitting..." : "Submit Evaluation"}
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
