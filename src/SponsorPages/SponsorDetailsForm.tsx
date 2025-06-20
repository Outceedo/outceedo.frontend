import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { updateProfile, updateProfilePhoto } from "@/store/profile-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import axios from "axios";

interface FormData {
  sponsorType: string;
  sportInterest: string;
  type: string;
  fullName: string;
  lastName: string;
  companyName: string;
  companyLink: string;
  city: string;
  country: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  CompanyLink: string;
  BudegetRange: string;
  SponsorshipType: string;
  SponsorshipCountryPreferred: string;
  bio: string;
  socialLinks: {
    instagram: string;
    linkedin: string;
    facebook: string;
    twitter: string;
  };
}

interface UserData {
  email: string;
  id: string;
  mobileNumber: string;
  username: string;
}

interface Country {
  name: string;
  iso2: string;
}

interface City {
  name: string;
  country: string;
}

export default function SponsorDetailsForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [existingProfilePhoto, setExistingProfilePhoto] = useState<
    string | null
  >(null);
  const [profilePhotoChanged, setProfilePhotoChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] =
    useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile);
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    sponsorType: "",
    sportInterest: "",
    type: "",
    fullName: "",
    lastName: "",
    companyName: "",
    companyLink: "",
    city: "",
    country: "",
    address: "",
    countryCode: "",
    phone: "",
    email: "",
    CompanyLink: "",
    BudegetRange: "",
    SponsorshipType: "",
    SponsorshipCountryPreferred: "",
    bio: "",
    socialLinks: {
      instagram: "",
      linkedin: "",
      facebook: "",
      twitter: "",
    },
  });

  useEffect(() => {
    const fetchCountries = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/flag/images"
        );
        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        if (data.error === false && data.data) {
          const formattedCountries = data.data.map((country: any) => ({
            name: country.name,
            iso2: country.iso2 || "",
          }));
          setCountries(formattedCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);

        const fallbackCountries = [
          { name: "United States", iso2: "US" },
          { name: "United Kingdom", iso2: "GB" },
          { name: "Canada", iso2: "CA" },
          { name: "Australia", iso2: "AU" },
          { name: "Germany", iso2: "DE" },
          { name: "France", iso2: "FR" },
          { name: "India", iso2: "IN" },
          { name: "Japan", iso2: "JP" },
          { name: "China", iso2: "CN" },
          { name: "Brazil", iso2: "BR" },
        ];
        setCountries(fallbackCountries);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchCities = async () => {
      try {
        const response = await fetch(
          `https://countriesnow.space/api/v0.1/countries/cities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: selectedCountry.name,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch cities");

        const cityData = await response.json();
        if (cityData.error === false && cityData.data) {
          const cityList = cityData.data.map((city: string) => ({
            name: city,
            country: selectedCountry.name,
          }));
          setCities(cityList);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);

        const fallbackCities = [
          { name: "New York", country: selectedCountry.name },
          { name: "Los Angeles", country: selectedCountry.name },
          { name: "Chicago", country: selectedCountry.name },
          { name: "Houston", country: selectedCountry.name },
          { name: "Phoenix", country: selectedCountry.name },
        ];
        setCities(fallbackCities);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setForm((prev) => ({
      ...prev,
      country: country.name,
    }));
    setSearchTerm(country.name);
    setShowCountryDropdown(false);
  };

  const handleCitySelect = (city: string) => {
    setForm((prev) => ({ ...prev, city }));
    setCitySearchTerm(city);
    setShowCityDropdown(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");

        if (!username) throw new Error("Username not found in localStorage");

        const response = await axios.get(
          `${API_BASE_URL}/auth/user/${username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        setUserData(data);

        if (data.mobileNumber) {
          const parts = data.mobileNumber.split(" ");
          if (parts.length === 2) {
            setForm((prev) => ({
              ...prev,
              countryCode: parts[0],
              phone: parts[1],
            }));
          } else {
            setForm((prev) => ({
              ...prev,
              phone: data.mobileNumber,
            }));
          }
        }

        setForm((prev) => ({
          ...prev,
          email: data.email || "",
        }));

        setIsLoading(false);
      } catch (error) {
        setError("Failed to fetch user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (profileState.status === "failed" && profileState.error) {
      setError(profileState.error);
      setIsSubmitting(false);
    } else if (profileState.status === "succeeded") {
      if (profileState.currentProfile) {
        const profile = profileState.currentProfile;
        if (profile.photo) setExistingProfilePhoto(profile.photo);

        if (profile.country) {
          setSearchTerm(profile.country);
          const country = countries.find(
            (c) => c.name.toLowerCase() === profile.country?.toLowerCase()
          );
          if (country) {
            setSelectedCountry(country);
          }
        }

        if (profile.city) {
          setCitySearchTerm(profile.city);
        }

        setForm({
          sponsorType: profile.sponsorType
            ? profile.sponsorType.toLowerCase()
            : "",
          sportInterest: profile.profession
            ? profile.profession.toLowerCase()
            : "",
          type: profile.role ? profile.role.toLowerCase() : "",
          fullName: profile.firstName || "",
          lastName: profile.lastName || "",
          companyName: profile.company || "",
          companyLink: profile.companyLink || "",
          city: profile.city || "",
          country: profile.country || "",
          address: profile.address || "",
          countryCode: profile.countryCode || "",
          phone: profile.phone || "",
          email: userData?.email || profile.email || "",
          CompanyLink: profile.companyLink || "",
          BudegetRange: profile.budgetRange || "",
          SponsorshipType: profile.sponsorshipType
            ? profile.sponsorshipType.toLowerCase()
            : "",
          SponsorshipCountryPreferred:
            profile.sponsorshipCountryPreferred || "",
          bio: profile.bio || "",
          socialLinks: {
            instagram: profile.socialLinks?.instagram || "",
            linkedin: profile.socialLinks?.linkedin || "",
            facebook: profile.socialLinks?.facebook || "",
            twitter: profile.socialLinks?.twitter || "",
          },
        });
      }
    }
  }, [
    profileState.status,
    profileState.error,
    profileState.currentProfile,
    userData,
    countries,
  ]);

  const validateCurrentStep = (): boolean => {
    setError(null);
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) errors.fullName = "Full name is required";
      if (!form.lastName.trim()) errors.lastName = "Last name is required";
      if (!form.sponsorType)
        errors.sponsorType = "Please select a sponsor type";
      if (!form.country) errors.country = "Country is required";
      if (!form.city) errors.city = "City is required";
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields");
      return false;
    }
    return true;
  };

  const handleSocialMedia = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should not exceed 2MB.");
      return;
    }

    setProfilePhoto(file);
    setProfilePhotoChanged(true);
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "sponsorType" ||
        name === "sportInterest" ||
        name === "type" ||
        name === "SponsorshipType"
          ? value.toLowerCase()
          : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 2));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const goBack = () => navigate(-1);

  const submitForm = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let photoUrl = existingProfilePhoto;

      if (profilePhoto && profilePhotoChanged) {
        try {
          const resultAction = await dispatch(updateProfilePhoto(profilePhoto));
          if (updateProfilePhoto.fulfilled.match(resultAction)) {
            const updatedProfile = resultAction.payload;
            photoUrl = updatedProfile.photo || photoUrl;
          } else if (updateProfilePhoto.rejected.match(resultAction)) {
            throw new Error("Failed to upload profile photo.");
          }
        } catch (error) {
          setError("Failed to upload profile photo. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      const sponsorData = {
        sponsorType: form.sponsorType,
        profession: form.sportInterest
          ? form.sportInterest.charAt(0).toUpperCase() +
            form.sportInterest.slice(1)
          : "",
        firstName: form.fullName
          ? form.fullName.charAt(0).toUpperCase() + form.fullName.slice(1)
          : "",
        lastName: form.lastName
          ? form.lastName.charAt(0).toUpperCase() + form.lastName.slice(1)
          : "",
        company: form.companyName
          ? form.companyName.charAt(0).toUpperCase() + form.companyName.slice(1)
          : "",
        companyLink: form.companyLink,
        city: form.city,
        country: form.country,
        address: form.address,
        budgetRange: form.BudegetRange,
        sponsorshipType:
          form.SponsorshipType.charAt(0).toUpperCase() + form.SponsorshipType,
        sponsorshipCountryPreferred: form.SponsorshipCountryPreferred
          ? form.SponsorshipCountryPreferred.charAt(0).toUpperCase() +
            form.SponsorshipCountryPreferred.slice(1)
          : "",
        bio: form.bio,
        photo: photoUrl,
        socialLinks: {
          instagram: form.socialLinks.instagram || "",
          linkedin: form.socialLinks.linkedin || "",
          facebook: form.socialLinks.facebook || "",
          twitter: form.socialLinks.twitter || "",
        },
      };

      const updateProfileResult = await dispatch(updateProfile(sponsorData));
      if (updateProfile.fulfilled.match(updateProfileResult)) {
        setSuccess("Sponsor details saved successfully!");
        setTimeout(() => {
          navigate("/sponsor/dashboard");
        }, 1500);
      } else if (updateProfile.rejected.match(updateProfileResult)) {
        throw new Error("Failed to update profile.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key].message || apiErrors[key];
        });
        setValidationErrors(formattedErrors);
        setError("Please correct the errors in the form.");
      } else {
        setError(
          error.message || "Failed to save sponsor details. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="ml-2 text-lg">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-20 mx-auto dark:bg-gray-900">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          {Object.keys(validationErrors).length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p className="font-semibold">Success</p>
          <p>{success}</p>
        </div>
      )}
      <button
        onClick={goBack}
        className="flex items-center text-gray-700 hover:text-black text-sm font-medium mb-4 dark:text-white cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
      </button>
      <div className="flex flex-col items-center mb-12">
        <div className="flex w-full max-w-lg items-center relative">
          {[1, 2].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className="relative flex flex-col items-center w-1/4">
                <div
                  className={`w-8 h-8 ${
                    step >= stepNum ? "bg-red-500" : "bg-gray-300"
                  } rounded-full flex items-center justify-center text-white font-bold text-sm`}
                >
                  {stepNum}
                </div>
              </div>
              {stepNum < 2 && (
                <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
                  <div
                    className={`absolute top-0 left-0 h-1 rounded-full ${
                      step > stepNum ? "bg-red-500 w-full" : "w-0"
                    } transition-all duration-500`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex w-full max-w-lg justify-between mt-2 ">
          <div className="w-1/4 text-center text-sm font-medium">
            Profile Details
          </div>
          <div className="w-1/4 text-center text-sm font-medium">
            More Details
          </div>
        </div>
      </div>
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
          <Label className="text-sm text-gray-400 mb-1">PROFILE PICTURE</Label>
          <Card className="border-dashed border border-gray-300 p-4 w-5/6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {existingProfilePhoto && !profilePhoto && (
                <img
                  src={existingProfilePhoto}
                  alt="Current profile"
                  className="h-10 w-10 object-cover rounded-full"
                />
              )}
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xl">🖼️</span>
              </div>
              <span className="text-sm text-gray-700">
                {profilePhoto
                  ? profilePhoto.name
                  : existingProfilePhoto
                  ? "Current profile photo"
                  : "Upload a profile picture. Max size 2MB"}
              </span>
              <label className="cursor-pointer px-4 py-2 bg-gray-100 border rounded text-sm text-gray-700 hover:bg-gray-200">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                First Name
                {validationErrors.fullName && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={validationErrors.fullName ? "border-red-500" : ""}
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.fullName}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Last Name
                {validationErrors.lastName && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <Input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={validationErrors.lastName ? "border-red-500" : ""}
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.lastName}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <Input
                name="email"
                value={userData?.email || ""}
                className="bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Sponsor Type
                {validationErrors.sponsorType && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <select
                name="sponsorType"
                value={form.sponsorType}
                onChange={handleChange}
                className={`border p-2 rounded text-sm text-gray-700 w-full ${
                  validationErrors.sponsorType ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a Sponsor</option>
                <option value="corporate">Corporate</option>
                <option value="individual">Individual</option>
                <option value="institution">Institution</option>
              </select>
              {validationErrors.sponsorType && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.sponsorType}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Sport Interest
              </label>
              <select
                name="sportInterest"
                value={form.sportInterest}
                onChange={handleChange}
                className="border p-2 rounded text-sm text-gray-700 w-full"
              >
                <option value="">Select a sport</option>
                <option value="football">Football</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Phone Number
              </label>
              <div className="flex w-full">
                <Input
                  value={userData?.mobileNumber}
                  className="w-full bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Company Name
              </label>
              <Input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Company Link
              </label>
              <Input
                name="companyLink"
                value={form.companyLink}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Country
                {validationErrors.country && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <Input
                name="country"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                placeholder="Search country"
                className={validationErrors.country ? "border-red-500" : ""}
              />
              {validationErrors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.country}
                </p>
              )}
              {showCountryDropdown && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
                  {countries
                    .filter((country) =>
                      country.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((country, index) => (
                      <li
                        key={index}
                        onClick={() => handleCountrySelect(country)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                      >
                        {country.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                City
                {validationErrors.city && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <Input
                name="city"
                value={citySearchTerm}
                onChange={(e) => {
                  setCitySearchTerm(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search city"
                className={validationErrors.city ? "border-red-500" : ""}
              />
              {validationErrors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.city}
                </p>
              )}
              {showCityDropdown && selectedCountry && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
                  {cities
                    .filter((city) =>
                      city.name
                        .toLowerCase()
                        .includes(citySearchTerm.toLowerCase())
                    )
                    .map((city, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(city.name)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {city.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Address
              </label>
              <Input
                name="address"
                placeholder="Street no."
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="text-right mt-6">
            <Button
              onClick={nextStep}
              className="bg-yellow-400 text-white hover:bg-amber-500 cursor-pointer"
            >
              Save & Next
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            More Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="w-full">
              <label className="text-sm font-medium text-gray-900 mb-1 block dark:text-white">
                Budget Range
              </label>
              <Input
                name="BudegetRange"
                placeholder="$"
                value={form.BudegetRange}
                onChange={handleChange}
                className="w-full md:w-60"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-900 mb-1 block dark:text-white">
                Sponsorship Type
              </label>
              <select
                name="SponsorshipType"
                value={form.SponsorshipType}
                onChange={handleChange}
                className="border p-2 rounded text-sm text-gray-700 w-full md:w-60"
              >
                <option value="">Select type</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gift">Gift</option>
                <option value="professional fee">Professional Fee</option>
              </select>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-900 mb-1 block dark:text-white">
                Sponsorship Country Preferred
              </label>
              <Input
                name="SponsorshipCountryPreferred"
                value={form.SponsorshipCountryPreferred}
                onChange={handleChange}
                className="w-full md:w-60"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Bio Data
            </label>
            <Textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="mb-6 mt-2"
              placeholder="Bio data"
              maxLength={500}
            />
          </div>
          <Label className="text-md font-semibold mb-2 dark:text-white">
            Social Media Links
          </Label>
          <div className="space-y-4 mt-4 w-1/3">
            {[
              {
                icon: faInstagram,
                name: "instagram",
                bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
              },
              {
                icon: faLinkedinIn,
                name: "linkedin",
                bg: "bg-blue-700",
              },
              {
                icon: faFacebookF,
                name: "facebook",
                bg: "bg-blue-600",
              },
              {
                icon: faXTwitter,
                name: "twitter",
                bg: "bg-black",
              },
            ].map((social) => (
              <div key={social.name} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center border rounded ${social.bg}`}
                >
                  <FontAwesomeIcon
                    icon={social.icon}
                    className="w-6 h-6 text-white"
                  />
                </div>
                <Input
                  name={`socialLinks.${social.name}`}
                  value={
                    form.socialLinks[
                      social.name as keyof typeof form.socialLinks
                    ]
                  }
                  onChange={handleSocialMedia}
                  className="w-full px-4 py-2"
                  placeholder={`Your ${social.name} link`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={prevStep}
              className="border border-gray-400 text-black bg-amber-50 hover:bg-amber-50 rounded mr-9 cursor-pointer"
              disabled={isSubmitting}
              type="button"
            >
              Back
            </Button>
            <Button
              onClick={submitForm}
              className="bg-yellow-400 text-white hover:bg-yellow-500 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
