import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface Country {
  name: {
    common: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
}

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    teamName: "",
    email: "",
    phone: "",
    countryCode: "",
    reason: "",
    uniqueFactor: "",
    sponsorshipProduct: false,
    sponsorshipMoney: false,
    website: "",
    otherInfo: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const formatted = data.map((country: Country) => {
          return {
            name: country.name.common,
            dialCode: country.idd?.root + (country.idd?.suffixes?.[0] || "")
          };
        }).filter(c => c.dialCode);
        setCountries(formatted);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.profession.trim()) newErrors.profession = "Profession is required.";
    if (!formData.teamName.trim()) newErrors.teamName = "Team/Club name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.reason.trim()) newErrors.reason = "Sponsorship reason is required.";
    if (!formData.uniqueFactor.trim()) newErrors.uniqueFactor = "This field is required.";
    if (!formData.website.trim()) newErrors.website = "Profile link is required.";
    if (!formData.sponsorshipProduct && !formData.sponsorshipMoney) {
      newErrors.sponsorship = "At least one sponsorship type must be selected.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("Form submitted successfully!");
    }
  };

  const inputClass = (field: string) =>
    `mt-2 w-full ${errors[field] ? "border-red-500 border" : "border-gray-300"} rounded px-2 py-2`;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-md dark:bg-gray-900">
      <h1 className="text-center text-3xl mt-6 mb-6 font-bold">Sports App</h1>
      <h1 className="text-2xl font-semibold">Athlete/Team Sponsorship Application</h1>
      <p className="text-sm text-gray-600 mt-1">Please fill in the required information below.</p>
      <hr className="my-6" />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="firstName" className="text-sm">First Name</Label>
              <Input id="firstName" placeholder="First" className={inputClass("firstName")} value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm">Last Name</Label>
              <Input id="lastName" placeholder="Last" className={inputClass("lastName")} value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Profession:</Label>
            <Input placeholder="Your profession" className={inputClass("profession")} value={formData.profession} onChange={(e) => handleChange("profession", e.target.value)} />
            {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession}</p>}
          </div>
          <div>
            <Label>Team/Club Name:</Label>
            <Input placeholder="Team or club name" className={inputClass("teamName")} value={formData.teamName} onChange={(e) => handleChange("teamName", e.target.value)} />
            {errors.teamName && <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>E-mail:</Label>
            <Input placeholder="your@email.com" className={inputClass("email")} value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label>Phone Number:</Label>
            <div className="grid grid-cols-3 gap-2">
              <select
                className="border rounded p-2"
                value={formData.countryCode}
                onChange={(e) => handleChange("countryCode", e.target.value)}
              >
                {countries.map((country, idx) => (
                  <option key={idx} value={country.dialCode}>
                    {country.dialCode} ({country.name})
                  </option>
                ))}
              </select>
              <div className="col-span-2">
                <Input placeholder="Phone number" className={inputClass("phone")} value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label>Why do you require sponsorship?</Label>
          <Textarea placeholder="Explain your need for sponsorship..." className={inputClass("reason")} value={formData.reason} onChange={(e) => handleChange("reason", e.target.value)} />
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
        </div>

        <div>
          <Label>What makes you stand out from the other athletes/Teams?</Label>
          <Textarea placeholder="Describe your unique qualities..." className={inputClass("uniqueFactor")} value={formData.uniqueFactor} onChange={(e) => handleChange("uniqueFactor", e.target.value)} />
          {errors.uniqueFactor && <p className="text-red-500 text-sm mt-1">{errors.uniqueFactor}</p>}
        </div>

        <div>
          <Label>What kind of sponsorship do you prefer?</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <Checkbox checked={formData.sponsorshipProduct} onCheckedChange={(checked) => handleChange("sponsorshipProduct", Boolean(checked))} />
              <span>Product</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox checked={formData.sponsorshipMoney} onCheckedChange={(checked) => handleChange("sponsorshipMoney", Boolean(checked))} />
              <span>Money (Cash/Gift Card/Professional Fees)</span>
            </label>
          </div>
          {errors.sponsorship && <p className="text-red-500 text-sm mt-1">{errors.sponsorship}</p>}
        </div>

        <div>
          <Label>Your website or social media profile:</Label>
          <Input placeholder="https://yourprofile.com" className={inputClass("website")} value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
          {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
        </div>

        <div>
          <Label>Other Useful Information:</Label>
          <Textarea placeholder="Any additional information..." className="mt-2" value={formData.otherInfo} onChange={(e) => handleChange("otherInfo", e.target.value)} />
        </div>

        <div className="text-center">
          <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded cursor-pointer">
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
