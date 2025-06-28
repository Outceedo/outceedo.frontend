import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    teamName: "",
    email: "",
    phone: "",
    countryCode: "+91",
    reason: "",
    uniqueFactor: "",
    sponsorshipProduct: false,
    sponsorshipMoney: false,
    website: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const sponsorId = localStorage.getItem("sponsorid");
  const API_BASE_URL = `${
    import.meta.env.VITE_PORT
  }/api/v1/user/applications/sponsor`;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.reason.trim())
      newErrors.reason = "Sponsorship reason is required.";
    if (!formData.uniqueFactor.trim())
      newErrors.uniqueFactor = "This field is required.";
    if (!formData.website.trim())
      newErrors.website = "Profile link is required.";
    if (!formData.sponsorshipProduct && !formData.sponsorshipMoney) {
      newErrors.sponsorship = "At least one sponsorship type must be selected.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Determine sponsorshipType string (money, product, or both)
    let sponsorshipType = "";
    if (formData.sponsorshipProduct && formData.sponsorshipMoney) {
      sponsorshipType = "product, money";
    } else if (formData.sponsorshipProduct) {
      sponsorshipType = "product";
    } else if (formData.sponsorshipMoney) {
      sponsorshipType = "money";
    }

    const payload = {
      reason: formData.reason,
      uniqueFactor: formData.uniqueFactor,
      website: formData.website,
      sponsorshipType: sponsorshipType,
      additionalInfo: formData.additionalInfo,
    };
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/${sponsorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit application");
      }

      await Swal.fire({
        icon: "success",
        title: "Application Submitted",
        text: "Your sponsorship application has been submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      localStorage.getItem("role") === "player"
        ? navigate("/player/applications")
        : navigate("/team/applications");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: err.message || "An error occurred while submitting the form.",
      });
    }
  };

  const inputClass = (field: string) =>
    `mt-2 w-full ${
      errors[field] ? "border-red-500 border" : "border-gray-300"
    } rounded px-2 py-2`;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-md dark:bg-gray-900">
      <h1 className="text-center text-3xl mt-6 mb-6 font-bold">Sports App</h1>
      <h1 className="text-2xl font-semibold">
        Athlete/Team Sponsorship Application
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Please fill in the required information below.
      </p>
      <hr className="my-6" />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <div className="grid grid-cols-2 gap-4 mt-2"></div>
        </div>

        {/* Reason */}
        <div>
          <Label>Why do you require sponsorship?</Label>
          <Textarea
            placeholder="Explain your need for sponsorship..."
            className={inputClass("reason")}
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
          )}
        </div>

        {/* Unique Factor */}
        <div>
          <Label>What makes you stand out from the other athletes/Teams?</Label>
          <Textarea
            placeholder="Describe your unique qualities..."
            className={inputClass("uniqueFactor")}
            value={formData.uniqueFactor}
            onChange={(e) => handleChange("uniqueFactor", e.target.value)}
          />
          {errors.uniqueFactor && (
            <p className="text-red-500 text-sm mt-1">{errors.uniqueFactor}</p>
          )}
        </div>

        {/* Sponsorship Type */}
        <div>
          <Label>What kind of sponsorship do you prefer?</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={formData.sponsorshipProduct}
                onCheckedChange={(checked) =>
                  handleChange("sponsorshipProduct", Boolean(checked))
                }
              />
              <span>Product</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={formData.sponsorshipMoney}
                onCheckedChange={(checked) =>
                  handleChange("sponsorshipMoney", Boolean(checked))
                }
              />
              <span>Money (Cash/Gift Card/Professional Fees)</span>
            </label>
          </div>
          {errors.sponsorship && (
            <p className="text-red-500 text-sm mt-1">{errors.sponsorship}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <Label>Your website or social media profile:</Label>
          <Input
            placeholder="https://yourprofile.com"
            className={inputClass("website")}
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website}</p>
          )}
        </div>

        {/* Other Info */}
        <div>
          <Label>Other Useful Information:</Label>
          <Textarea
            placeholder="Any additional information..."
            className="mt-2"
            value={formData.additionalInfo}
            onChange={(e) => handleChange("additionalInfo", e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded cursor-pointer"
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
