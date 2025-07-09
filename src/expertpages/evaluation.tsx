import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Attributes and subskills config
interface Attribute {
  label: string;
  color: string;
  subskills: string[];
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
  // Step: 0 = first attribute, ... last attribute, then rating/review
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    attributes: initialAttributeState(),
    rating: 0,
    strengths: "",
    improvement: "",
    verdict: "",
  });

  // Player info
  const [playerName, setPlayerName] = useState<string>("");
  const [playerPhoto, setPlayerPhoto] = useState<string>("");

  useEffect(() => {
    // Try to get from localStorage, else fallback to empty
    setPlayerName(localStorage.getItem("playerName") || "");
    setPlayerPhoto(localStorage.getItem("playerPhoto") || "");
  }, []);

  // Stepper: All attributes + 2 (rating, review)
  const totalSteps = attributes.length + 2;

  // Handle main attribute value change
  const handleAttributeChange = (attr: string, val: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: {
          ...prev.attributes[attr],
          percentage: isNaN(val) ? 0 : val,
        },
      },
    }));
  };

  // Handle subskill value change
  const handleSubskillChange = (attr: string, sub: string, val: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: {
          ...prev.attributes[attr],
          subskills: {
            ...prev.attributes[attr].subskills,
            [sub]: isNaN(val) ? 0 : val,
          },
        },
      },
    }));
  };

  // Handle textareas/inputs for review
  const handleText = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Step validation
  const validateStep = () => {
    // Steps 0..attributes.length-1: main attribute + subskills
    if (step < attributes.length) {
      const attr = attributes[step];
      const mainScore = form.attributes[attr.label].percentage;
      if (mainScore < 0 || mainScore > 100 || isNaN(mainScore)) return false;
      for (const sub of attr.subskills) {
        const subScore = form.attributes[attr.label].subskills[sub];
        if (subScore < 0 || subScore > 100 || isNaN(subScore)) return false;
      }
      return true;
    }
    // Step for rating (0-5 stars, can be 0)
    if (step === attributes.length) {
      return form.rating >= 0 && form.rating <= 5;
    }
    // Step for review
    if (step === attributes.length + 1) {
      return (
        form.strengths.trim().length > 0 &&
        form.improvement.trim().length > 0 &&
        form.verdict.trim().length > 0
      );
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) onSubmit?.(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-5xl mx-auto p-6 bg-white rounded-xl shadow"
    >
      {/* Player display */}
      <div className="flex items-center gap-4 mb-8">
        {playerPhoto ? (
          <img
            src={playerPhoto}
            alt={playerName}
            className="w-14 h-14 object-cover rounded-full border"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl text-gray-500">
            <span>👤</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{playerName || "Player"}</span>
          <span className="text-sm text-gray-500">Player Assessment Report</span>
        </div>
      </div>
      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {attributes.map((attr, idx) => (
          <div key={attr.label} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                step === idx
                  ? "bg-red-500"
                  : step > idx
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {idx + 1}
            </div>
            <span className="mt-2 text-xs">{attr.label}</span>
            
          </div>
        ))}
        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              step === attributes.length + 1 ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            {attributes.length + 2}
          </div>
          <span className="mt-2 text-xs">Review</span>
          
          {/* No trailing bar */}
        </div>
      </div>

      {/* Attribute + Subskills (steps 0 ... attributes.length-1) */}
      {step < attributes.length && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">{attributes[step].label}</h2>
          <Label className="font-semibold">{attributes[step].label} %</Label>
          <div className="flex items-center gap-4 mt-2 mb-6">
            <input
              type="range"
              min={0}
              max={100}
              value={form.attributes[attributes[step].label].percentage}
              onChange={(e) =>
                handleAttributeChange(
                  attributes[step].label,
                  parseInt(e.target.value)
                )
              }
              className="flex-1"
            />
            <span
              className="w-12 text-center font-bold"
              style={{ color: attributes[step].color }}
            >
              {form.attributes[attributes[step].label].percentage}%
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {attributes[step].subskills.map((sub) => (
              <div key={sub}>
                <label className="text-sm">{sub}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.attributes[attributes[step].label].subskills[sub]}
                  onChange={(e) =>
                    handleSubskillChange(
                      attributes[step].label,
                      sub,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full border rounded p-2 mt-1"
                  placeholder="Score (%)"
                  required
                />
                <Progress
                  value={form.attributes[attributes[step].label].subskills[sub]}
                  className="h-1 bg-gray-200 [&>div]:bg-green-500"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overall Rating */}
      {step === attributes.length && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Overall Rating</h2>
          <div className="flex items-center gap-4">
            <Label className="text-lg">Rate the Player (0-5):</Label>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setForm((prev) => ({ ...prev, rating: i }))}
                className="focus:outline-none"
              >
                <Star
                  fill={i <= form.rating ? "#FACC15" : "none"}
                  stroke="#FACC15"
                  className="w-8 h-8"
                />
              </button>
            ))}
            <span className="ml-3 text-xl font-bold">{form.rating} / 5</span>
          </div>
        </Card>
      )}

      {/* Review */}
      {step === attributes.length + 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Assessment Review</h2>
          <div className="mb-4">
            <Label>Strengths</Label>
            <Textarea
              name="strengths"
              value={form.strengths}
              onChange={handleText}
              required
              className="w-full mt-1"
              placeholder="Describe player's strengths"
            />
          </div>
          <div className="mb-4">
            <Label>Areas for Improvement</Label>
            <Textarea
              name="improvement"
              value={form.improvement}
              onChange={handleText}
              required
              className="w-full mt-1"
              placeholder="Describe areas for improvement"
            />
          </div>
          <div className="mb-4">
            <Label>Verdict</Label>
            <Textarea
              name="verdict"
              value={form.verdict}
              onChange={handleText}
              required
              className="w-full mt-1"
              placeholder="Final verdict"
            />
          </div>
        </Card>
      )}

      {/* Stepper Controls */}
      <div className="flex justify-between mt-8">
        <Button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeft /> Back
        </Button>
        {step < totalSteps - 1 && (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!validateStep()}
            className="flex items-center gap-2"
          >
            Next <ChevronRight />
          </Button>
        )}
        {step === totalSteps - 1 && (
          <Button type="submit" className="bg-red-500 text-white">
            Submit Evaluation
          </Button>
        )}
      </div>
    </form>
  );
}