import React, { ChangeEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch } from "../store/hooks";
import { updateProfile, updateProfilePhoto } from "../store/profile-slice";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Country {
  name: string;
  iso2: string;
  flag: string;
  dialCode: string;
}

interface CityResponse {
  data: { country: string; cities: string[] }[];
}

interface Certificate {
  id: number;
  name?: string;
  organization?: string;
  file?: File;
  uploadedDocId?: string; // To track uploaded document ID
}

interface Award {
  id: number;
  name?: string;
}

interface Media {
  id: string;
  title: string;
  url: string;
  type: string;
}

// Valid gender options as expected by the backend
type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

const Detailsform: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); // Use Redux dispatch
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    subProfession: "",
    age: "",
    birthYear: "",
    gender: "" as GenderType,
    languages: "",
    height: "",
    weight: "",
    country: "",
    city: "",
    footballClub: "",
    countryCode: "",
    phoneNumber: "",
    bio: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    twitter: "",
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Files
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [professionalPhoto, setProfessionalPhoto] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([{ id: 1 }]);
  const [awards, setAwards] = useState<Award[]>([{ id: 1 }]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);

  // Country & city data
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] =
    useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [showDialCodeDropdown, setShowDialCodeDropdown] =
    useState<boolean>(false);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };
  useEffect(() => {
    try {
      const savedProfileData = localStorage.getItem("profileData");

      if (savedProfileData) {
        const profileData = JSON.parse(savedProfileData);
        console.log("Prefilling form with saved profile data:", profileData);

        // Map the profile data to form data structure
        setFormData((prevData) => ({
          ...prevData,
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          profession: profileData.profession || "",
          subProfession: profileData.subProfession || "",
          age: profileData.age?.toString() || "",
          birthYear: profileData.birthYear?.toString() || "",
          gender: profileData.gender || "",
          languages: Array.isArray(profileData.language)
            ? profileData.language.join(", ")
            : "",
          height: profileData.height?.toString() || "",
          weight: profileData.weight?.toString() || "",
          country: profileData.country || "",
          city: profileData.city || "",

          bio: profileData.bio || "",

          // Handle social links
          linkedin: profileData.socialLinks?.linkedin || "",
          facebook: profileData.socialLinks?.facebook || "",
          instagram: profileData.socialLinks?.instagram || "",
          twitter: profileData.socialLinks?.twitter || "",
        }));

        // Set selected country if it exists
        if (profileData.country) {
          const country = countries.find((c) => c.name === profileData.country);
          if (country) {
            setSelectedCountry(country);
            setSearchTerm(country.name);
          }
        }

        // Set city search term
        if (profileData.city) {
          setCitySearchTerm(profileData.city);
        }

        // Handle certificates if available
        if (profileData.certificates && profileData.certificates.length > 0) {
          const formattedCerts = profileData.certificates.map(
            (cert: any, index: number) => ({
              id: Date.now() + index,
              name: cert.name,
              organization: cert.organization,
              uploadedDocId: cert.documentId,
            })
          );
          setCertificates(formattedCerts);
        }

        // Handle awards if available
        if (profileData.awards && profileData.awards.length > 0) {
          const formattedAwards = profileData.awards.map(
            (awardName: string, index: number) => ({
              id: Date.now() + index,
              name: awardName,
            })
          );
          setAwards(formattedAwards);
        }
      }
    } catch (error) {
      console.error("Error loading saved profile data:", error);
    }
  }, [countries]);
  // Depend on countries to ensure it's loaded before trying to use it

  // In the handleSubmit function, clean up the localStorage after successful submission:

  // Helper to create axios instance with auth header
  const createAuthAxios = () => {
    const token = getAuthToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  // Navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Validation for each step
  const validateCurrentStep = (): boolean => {
    setError(null);
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      }
      if (!formData.profession) {
        errors.profession = "Please select a profession";
      }
      if (!formData.gender) {
        errors.gender = "Please select a gender";
      }
    } else if (step === 2) {
      if (!formData.country) {
        errors.country = "Country is required";
      }
      if (!formData.city) {
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

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

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

  // Upload media file to server
  const uploadMediaFile = async (
    file: File,
    type: string
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `${type}_photo_${Date.now()}`);
      formData.append("type", type);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(`${type} photo uploaded:`, response.data);

      // Add to uploaded media
      if (response.data && response.data.id) {
        setUploadedMedia((prev) => [
          ...prev,
          {
            id: response.data.id,
            title: response.data.title,
            url: response.data.url,
            type: type,
          },
        ]);

        return response.data.id;
      }

      return null;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      throw error;
    }
  };

  // Upload document (certificate)
  // Handle file uploads
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "professional" | "certificate",
    certId?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should not exceed 2MB.");
      return;
    }

    try {
      if (type === "profile") {
        // Just store the file locally, don't upload yet
        setProfilePhoto(file);
      } else if (type === "professional") {
        setProfessionalPhoto(file);
        await uploadMediaFile(file, "professional");
      } else if (type === "certificate" && certId !== undefined) {
        // Update certificate with file
        setCertificates((prev) =>
          prev.map((cert) => (cert.id === certId ? { ...cert, file } : cert))
        );

        // Upload the document and save the document ID
        const docId = await uploadDocument(
          file,
          certificates.find((c) => c.id === certId)?.name ||
            `Certificate ${certId}`,
          certificates.find((c) => c.id === certId)?.organization || "",
          "certificate",
          certId
        );

        if (docId) {
          setCertificates((prev) =>
            prev.map((cert) =>
              cert.id === certId ? { ...cert, uploadedDocId: docId } : cert
            )
          );
        }
      }

      setError(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    }
  };

  // Upload document (certificate/award)

  const uploadDocument = async (
    file: File,
    title: string,
    issuedBy: string,
    type: "certificate" | "award",
    certId?: number
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("type", type);
      formData.append("issuedBy", issuedBy);

      // Add current date as issue date if not specified
      const today = new Date().toISOString().split("T")[0];
      formData.append("issuedDate", today);
      // Optional description
      formData.append("description", "");

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Document uploaded:", response.data);
      return response.data.id || null;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  // Certificate functions
  const addCertificate = () => {
    setCertificates([...certificates, { id: Date.now() }]);
  };

  const removeCertificate = async (id: number) => {
    if (certificates.length <= 1) return;

    const cert = certificates.find((c) => c.id === id);

    // If the certificate was uploaded, delete it from the server
    if (cert?.uploadedDocId) {
      try {
        const token = getAuthToken();
        await axios.delete(
          `${API_BASE_URL}/user/document/${cert.uploadedDocId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`Deleted certificate ${id} from server`);
      } catch (error) {
        console.error(`Error deleting certificate ${id}:`, error);
      }
    }

    setCertificates(certificates.filter((cert) => cert.id !== id));
  };

  const handleCertificateChange = (
    id: number,
    field: "name" | "organization",
    value: string
  ) => {
    setCertificates(
      certificates.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  // Award functions
  const addAward = () => {
    setAwards([...awards, { id: Date.now() }]);
  };

  const removeAward = (id: number) => {
    if (awards.length <= 1) return;
    setAwards(awards.filter((award) => award.id !== id));
  };

  const handleAwardChange = (id: number, value: string) => {
    setAwards(
      awards.map((award) =>
        award.id === id ? { ...award, name: value } : award
      )
    );
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.dialCode,
    }));
    setSearchTerm(country.name);
    setShowCountryDropdown(false);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setCitySearchTerm(city);
    setShowCityDropdown(false);
  };

  // Handle dial code selection

  // Map UI gender values to backend-expected values
  const mapGenderValue = (uiGender: string): GenderType => {
    switch (uiGender.toLowerCase()) {
      case "male":
        return "male";
      case "female":
        return "female";
      case "other":
        return "other";
      case "prefer not to say":
        return "prefer_not_to_say";
      default:
        return "prefer_not_to_say";
    }
  };

  // Final submit function
  // In the handleSubmit function, update the profileData object to match the schema:

  // In the handleSubmit function:

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Find professional photo ID
      const professionalPhotoMedia = uploadedMedia.find(
        (m) => m.type === "professional"
      );

      // Convert languages to array
      let languageArray: string[] = [];
      if (formData.languages && formData.languages.trim()) {
        // Split by comma and trim whitespace from each entry
        languageArray = formData.languages
          .split(",")
          .map((lang) => lang.trim());
      }

      // Format certificates and awards are handled through the document endpoints separately
      // They are already uploaded during the form process

      // Prepare the profile data to match the schema exactly
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobileNumber:
          formData.countryCode && formData.phoneNumber
            ? `${formData.countryCode} ${formData.phoneNumber}`
            : null,
        photo: professionalPhotoMedia?.id || null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        language: languageArray,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        skinColor: null,
        city: formData.city || null,
        country: formData.country || null,
        bio: formData.bio || null,
        socialLinks: {
          linkedin: formData.linkedin || "",
          facebook: formData.facebook || "",
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
        },
        interests: [], // Not collected in the form
        profession: formData.profession || null,
        subProfession: formData.subProfession || null,
        company: formData.footballClub || null,
        role: localStorage.getItem("role") || "player",
      };

      console.log("Submitting profile data:", profileData);

      // Use the updateProfile thunk instead of direct API call
      const resultAction = await dispatch(updateProfile(profileData));

      if (updateProfile.fulfilled.match(resultAction)) {
        console.log("Profile updated successfully:", resultAction.payload);

        // Clean up stored profile data
        localStorage.removeItem("profileData");

        // After profile is updated, update the profile photo using the Redux thunk
        if (profilePhoto) {
          try {
            // Dispatch the updateProfilePhoto action
            const photoResultAction = await dispatch(
              updateProfilePhoto(profilePhoto)
            );

            if (updateProfilePhoto.fulfilled.match(photoResultAction)) {
              console.log("Profile photo uploaded successfully");
            } else if (updateProfilePhoto.rejected.match(photoResultAction)) {
              console.error(
                "Failed to upload profile photo:",
                photoResultAction.error
              );
            }
          } catch (photoError) {
            console.error("Error uploading profile photo:", photoError);
            // Don't fail the whole process if photo upload fails
          }
        }

        setSuccess("Profile updated successfully!");

        // Redirect to appropriate dashboard based on user role
        setTimeout(() => {
          const userRole = localStorage.getItem("role");
          if (userRole === "player") {
            navigate("/player/dashboard");
          } else if (userRole === "expert") {
            navigate("/expert/dashboard");
          } else {
            navigate("/home");
          }
        }, 1500);
      } else if (updateProfile.rejected.match(resultAction)) {
        console.error("Failed to update profile:", resultAction.error);
        setError(
          resultAction.error?.message ||
            "Failed to update profile. Please try again."
        );

        // Handle structured validation errors if available
        if (resultAction.payload && typeof resultAction.payload === "object") {
          setValidationErrors(resultAction.payload as Record<string, string>);
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async (): Promise<void> => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        setCountries(
          data.map((country: any) => ({
            name: country.name.common,
            iso2: country.cca2,
            flag: country.flags.svg,
            dialCode: country.idd.root
              ? `${country.idd.root}${
                  country.idd.suffixes ? country.idd.suffixes[0] : ""
                }`
              : "+1",
          }))
        );
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country is selected
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchCities = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );
        if (!response.ok) throw new Error("Failed to fetch cities");

        const cityData: CityResponse = await response.json();
        const countryCities = cityData.data.find(
          (c) => c.country.toLowerCase() === selectedCountry.name.toLowerCase()
        );

        setCities(countryCities ? countryCities.cities : []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
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

      {/* Step progress */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex w-full max-w-lg items-center relative">
          {/* Step indicators */}
          {[1, 2, 3, 4].map((stepNum) => (
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

              {stepNum < 4 && (
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

        {/* Step labels */}
        <div className="flex w-full max-w-lg justify-between mt-2">
          <div className="w-1/4 text-center text-sm font-medium">
            Personal Details
          </div>
          <div className="w-1/4 text-center text-sm font-medium">
            More Details
          </div>
          <div className="w-1/4 text-center text-sm font-medium">
            Certification/Awards
          </div>
          <div className="w-1/4 text-center text-sm font-medium">Links</div>
        </div>
      </div>

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>

          <label className="block text-grey mb-1">Profile Picture</label>
          <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
            <span className="text-gray-500">
              {profilePhoto
                ? profilePhoto.name
                : "Upload a photo here, max size 2MB"}
            </span>
            <input
              type="file"
              id="profilePhotoUpload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "profile")}
            />
            <button
              className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold"
              onClick={() =>
                document.getElementById("profilePhotoUpload")?.click()
              }
            >
              Browse
            </button>
          </div>

          <div className="flex space-x-4 mb-2">
            <div className="w-1/2">
              <label className="block text-black mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.firstName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.firstName}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block text-black mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.lastName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mb-2">
            <div className="w-1/2">
              <label className="block text-black mb-1">Profession *</label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.profession ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select</option>
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="hockey">Hockey</option>
              </select>
              {validationErrors.profession && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.profession}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block text-black mb-1">Sub Profession</label>
              <select
                name="subProfession"
                value={formData.subProfession}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select</option>
                <option value="player">Player</option>
                <option value="coach">Coach</option>
                <option value="referee">Referee</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 mb-2">
            <div className="w-1/3">
              <label className="block text-black mb-1">Age</label>
              <input
                list="ageOptions"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                placeholder="Select or Type Age"
              />
              <datalist id="ageOptions">
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={i + 1} value={i + 1} />
                ))}
              </datalist>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Birth Year</label>
              <input
                list="yearOptions"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                placeholder="Select or Type Year"
              />
              <datalist id="yearOptions">
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year} />;
                })}
              </datalist>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  validationErrors.gender ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {validationErrors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.gender}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mb-2">
            <div className="w-1/3">
              <label className="block text-black mb-1">Languages</label>
              <input
                type="text"
                name="languages"
                placeholder="Language (comma separated)"
                value={formData.languages}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter multiple languages separated by commas (e.g., English,
                Spanish, French)
              </p>
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                placeholder="Height"
                value={formData.height}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-black mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                placeholder="Weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: More Details */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">More Details</h2>
          <label className="block text-grey mb-1">Professional Picture</label>
          <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
            <span className="text-gray-500">
              {professionalPhoto
                ? professionalPhoto.name
                : "Upload a photo here, max size 2MB"}
            </span>
            <input
              type="file"
              id="professionalPhotoUpload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "professional")}
            />
            <button
              className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold"
              onClick={() =>
                document.getElementById("professionalPhotoUpload")?.click()
              }
            >
              Browse
            </button>
          </div>

          <div className="flex space-x-4 mb-2">
            <div className="w-1/2 relative">
              <label className="block text-black mb-1">Country *</label>
              <input
                type="text"
                placeholder="Search Country"
                className={`border p-2 w-full rounded ${
                  validationErrors.country ? "border-red-500" : ""
                }`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                required
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
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-6 h-4 mr-2"
                        />
                        {country.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="w-1/2 relative">
              <label className="block text-black mb-1">City *</label>
              <input
                type="text"
                placeholder="Search City"
                className={`border p-2 w-full rounded ${
                  validationErrors.city ? "border-red-500" : ""
                }`}
                value={citySearchTerm}
                onChange={(e) => {
                  setCitySearchTerm(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                required
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
                      city.toLowerCase().includes(citySearchTerm.toLowerCase())
                    )
                    .map((city, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(city)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {city}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="relative w-full">
            <label className="block text-black mb-1">Bio Data</label>
            <textarea
              name="bio"
              placeholder="Enter your Bio Data"
              className="border p-2 w-full rounded resize-none"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
            <span className="absolute right-4 bottom-2 text-gray-500 text-sm">
              {formData.bio.trim()
                ? formData.bio.trim().split(/\s+/).length
                : 0}
              /250
            </span>
          </div>
        </div>
      )}

      {/* Step 3: Certificates and Awards */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Certification</h2>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="relative mb-4 border p-4 rounded shadow"
            >
              {certificates.length > 1 && (
                <button
                  className="absolute -top-2 right-2 text-red-500 text-lg"
                  onClick={() => removeCertificate(cert.id)}
                  type="button"
                >
                  ×
                </button>
              )}
              <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
                <span className="text-gray-500">
                  {cert.file ? cert.file.name : "Upload certificate here"}
                </span>
                <input
                  type="file"
                  id={`fileUpload-${cert.id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "certificate", cert.id)}
                />
                <button
                  className="absolute right-2 bg-lightYellow text-black px-3 py-1 rounded text-sm font-semibold"
                  onClick={() =>
                    document.getElementById(`fileUpload-${cert.id}`)?.click()
                  }
                  type="button"
                >
                  Browse
                </button>
              </div>
              <label className="block text-black mb-1">
                Certificate Title*
              </label>
              <input
                type="text"
                placeholder="Certificate Title"
                value={cert.name || ""}
                onChange={(e) =>
                  handleCertificateChange(cert.id, "name", e.target.value)
                }
                className="border p-2 w-full rounded mb-2"
              />
              <label className="block text-black mb-1">Issued By</label>
              <input
                type="text"
                placeholder="Organization Name"
                value={cert.organization || ""}
                onChange={(e) =>
                  handleCertificateChange(
                    cert.id,
                    "organization",
                    e.target.value
                  )
                }
                className="border p-2 w-full rounded mb-2"
              />
              {cert.uploadedDocId && (
                <div className="text-green-600 text-sm mt-2">
                  ✓ Certificate uploaded successfully
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addCertificate}
              className="bg-lightYellow text-black px-3 py-1 rounded font-semibold"
              type="button"
            >
              + Add Certificate
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-4">Awards</h2>
          {awards.map((award) => (
            <div
              key={award.id}
              className="relative mb-2 border p-4 rounded shadow"
            >
              {awards.length > 1 && (
                <button
                  className="absolute -top-2 right-2 text-red-500 text-lg"
                  onClick={() => removeAward(award.id)}
                  type="button"
                >
                  ×
                </button>
              )}
              <div className="flex flex-col">
                <label className="block text-black mb-1">Award Title*</label>
                <input
                  type="text"
                  placeholder="Award Title"
                  value={award.name || ""}
                  onChange={(e) => handleAwardChange(award.id, e.target.value)}
                  className="border p-2 w-full rounded mb-2"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addAward}
              className="bg-lightYellow text-black px-3 py-1 rounded font-semibold"
              type="button"
            >
              + Add Award
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Social Media Links */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>

          <div className="flex items-center w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faLinkedin}
              className="text-blue-600 text-3xl me-3 cursor-pointer"
            />
            <input
              type="text"
              name="linkedin"
              placeholder="LinkedIn"
              value={formData.linkedin}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex items-center w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faFacebook}
              className="text-blue-800 text-3xl mr-3 cursor-pointer"
            />
            <input
              type="text"
              name="facebook"
              placeholder="Facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex items-center w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faInstagram}
              className="text-pink-600 text-3xl mr-3 cursor-pointer"
            />
            <input
              type="text"
              name="instagram"
              placeholder="Instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>

          <div className="flex items-center w-1/2 mb-2">
            <FontAwesomeIcon
              icon={faTwitter}
              className="text-blue-600 text-3xl mr-3 cursor-pointer"
            />
            <input
              type="text"
              name="twitter"
              placeholder="Twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              className="border p-2 w-full rounded outline-none"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-end mt-6 space-x-4">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="border border-customGrey text-black px-4 py-2 rounded"
            disabled={isSubmitting}
            type="button"
          >
            Back
          </button>
        )}

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="bg-customYellow text-black px-4 py-2 rounded"
            disabled={isSubmitting}
            type="button"
          >
            Save & Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`bg-customYellow text-black px-4 py-2 rounded ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Detailsform;
