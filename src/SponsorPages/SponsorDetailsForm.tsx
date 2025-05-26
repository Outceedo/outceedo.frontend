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

interface CountryData {
  name: string;
  code: string;
  dialCode: string;
  cities: string[];
}

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

export default function SponsorDetailsForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<string[]>([]);
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

  // User data from API
  const [userData, setUserData] = useState<UserData | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };
  const username = localStorage.getItem("username");

  // Redux hooks
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        const username = localStorage.getItem("username");

        if (!username) {
          throw new Error("Username not found in localStorage");
        }

        const response = await axios.get(
          `${API_BASE_URL}/auth/user/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Extract data from response
        const data = response.data;
        setUserData(data);

        // Parse mobile number to extract country code and number
        if (data.mobileNumber) {
          // Extract country code - assuming format like "+91 6302445751"
          const parts = data.mobileNumber.split(" ");
          if (parts.length === 2) {
            setCountryCode(parts[0]); // "+91"
            setPhoneNumber(parts[1]); // "6302445751"
          } else {
            // If format is different, store full number as is
            setPhoneNumber(data.mobileNumber);
          }
        }

        // Pre-fill the email field
        setForm((prev) => ({
          ...prev,
          email: data.email || "",
        }));

        console.log("User data fetched successfully:", data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [API_BASE_URL]);

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

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // goes to previous page
  };

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

  // Watch for changes in profileState status
  useEffect(() => {
    if (profileState.status === "failed" && profileState.error) {
      setError(profileState.error);
      setIsSubmitting(false);
    } else if (profileState.status === "succeeded") {
      // If profile data was loaded successfully, you might want to pre-fill the form
      if (profileState.currentProfile) {
        const profile = profileState.currentProfile;

        // Set existing profile photo if available
        if (profile.photo) {
          setExistingProfilePhoto(profile.photo);
        }

        // Map profile data to form state
        setForm({
          sponsorType: profile.profession || "",
          sportInterest: profile.subProfession || "",
          type: profile.role || "",
          fullName: profile.firstName || "",
          lastName: profile.lastName || "",
          companyName: profile.company || "",
          companyLink: profile.companyLink || "",
          city: profile.city || "",
          country: profile.country || "",
          address: profile.address || "",
          countryCode: profile.countryCode || "",
          phone: profile.phone || "",
          email: userData?.email || profile.email || "", // Prioritize userData email
          CompanyLink: profile.companyLink || "",
          BudegetRange: profile.budgetRange || "",
          SponsorshipType: profile.sponsorshipType || "",
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
  ]);

  // Validation for each step
  const validateCurrentStep = (): boolean => {
    setError(null);
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) {
        errors.fullName = "Full name is required";
      }
      if (!form.lastName.trim()) {
        errors.lastName = "Last name is required";
      }
      // Skip email validation since it's now read-only
      if (!form.sponsorType) {
        errors.sponsorType = "Please select a sponsor type";
      }
      if (!form.country) {
        errors.country = "Country is required";
      }
      if (!form.city) {
        errors.city = "City is required";
      }
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
    // Handling nested socialLinks
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

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should not exceed 2MB.");
      return;
    }

    // Store the file locally and mark that profile photo has changed
    setProfilePhoto(file);
    setProfilePhotoChanged(true);
    setError(null);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryRes = await fetch("https://restcountries.com/v3.1/all");
        const data = await countryRes.json();
        const countryList: CountryData[] = data
          .map((item: any) => ({
            name: item.name.common,
            code: item.cca2,
            dialCode: item.idd.root
              ? `${item.idd.root}${
                  item.idd.suffixes ? item.idd.suffixes[0] : ""
                }`
              : "",
            cities: [],
          }))
          .sort((a: CountryData, b: CountryData) =>
            a.name.localeCompare(b.name)
          );
        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError("Failed to load countries. Please try again.");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!form.country) return;

      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );
        const data = await res.json();
        const countryData = data.data.find(
          (item: any) =>
            item.country.toLowerCase() === form.country.toLowerCase()
        );
        if (countryData) {
          setCities(countryData.cities);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load cities. Please try again.");
      }
    };

    if (form.country) fetchCities();
  }, [form.country]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" && {
        countryCode: countries.find((c) => c.name === value)?.dialCode || "",
        city: "",
      }),
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const submitForm = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // First upload profile photo if it's changed
      let photoUrl = existingProfilePhoto;

      if (profilePhoto && profilePhotoChanged) {
        try {
          // Dispatch updateProfilePhoto action and wait for the result
          const resultAction = await dispatch(updateProfilePhoto(profilePhoto));

          // Check if the action was fulfilled
          if (updateProfilePhoto.fulfilled.match(resultAction)) {
            // Extract the updated profile from the action payload
            const updatedProfile = resultAction.payload;
            // Get the photo URL from the updated profile
            photoUrl = updatedProfile.photo || photoUrl;
          } else if (updateProfilePhoto.rejected.match(resultAction)) {
            throw new Error("Failed to upload profile photo.");
          }
        } catch (error) {
          console.error("Error uploading profile photo:", error);
          setError("Failed to upload profile photo. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare the data for API submission with the correct field mappings for Redux
      const sponsorData = {
        sponsorType: form.sponsorType, // Map sponsorType to profession
        profession: form.sportInterest, // Map sportInterest to subProfession
        firstName: form.fullName,
        lastName: form.lastName,
        company: form.companyName, // Map companyName to company
        companyLink: form.companyLink,
        city: form.city,
        country: form.country,
        address: form.address,

        budgetRange: form.BudegetRange, // Map BudegetRange to budgetRange
        sponsorshipType: form.SponsorshipType, // Map SponsorshipType to sponsorshipType
        sponsorshipCountryPreferred: form.SponsorshipCountryPreferred, // Map SponsorshipCountryPreferred to sponsorshipCountryPreferred
        bio: form.bio,
        photo: photoUrl,

        socialLinks: {
          instagram: form.socialLinks.instagram || "",
          linkedin: form.socialLinks.linkedin || "",
          facebook: form.socialLinks.facebook || "",
          twitter: form.socialLinks.twitter || "",
        },
      };

      // Update profile using Redux action
      const updateProfileResult = await dispatch(updateProfile(sponsorData));

      if (updateProfile.fulfilled.match(updateProfileResult)) {
        setSuccess("Sponsor details saved successfully!");

        // Redirect to appropriate page after submission
        setTimeout(() => {
          navigate("/sponsor/dashboard"); // Adjust navigation path as needed
        }, 1500);
      } else if (updateProfile.rejected.match(updateProfileResult)) {
        throw new Error("Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Error submitting sponsor data:", error);

      // Handle API error responses
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
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

  // Display loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="ml-2 text-lg">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-20 mx-auto dark:bg-gray-900">
      {/* Status messages */}
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

      {/* Step Indicator */}
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

      {/* Step 1: Profile Details */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
          <Label className="text-sm text-gray-400 mb-1">PROFILE PICTURE</Label>
          <Card className="border-dashed border border-gray-300 p-4 w-5/6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Display existing profile photo if available */}
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
                {/* <Input
                  value={countryCode}
                  className="w-1/4 bg-gray-100 cursor-not-allowed"
                  readOnly
                /> */}
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

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Country
                {validationErrors.country && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className={`border p-2 rounded text-sm text-gray-700 w-full ${
                  validationErrors.country ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {validationErrors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.country}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                City
                {validationErrors.city && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className={`border p-2 rounded text-sm text-gray-700 w-full ${
                  validationErrors.city ? "border-red-500" : ""
                }`}
              >
                <option value="">Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {validationErrors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.city}
                </p>
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

      {/* Step 2: More Details */}
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
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Gift">Gift</option>
                <option value="Professional Fee">Professional Fee</option>
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

          {/* Navigation Buttons */}
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
