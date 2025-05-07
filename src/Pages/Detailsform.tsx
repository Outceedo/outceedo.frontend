import React, { ChangeEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
} from "../store/profile-slice";
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
  organization?: string; // Added organization field to match Certificate interface
  file?: File;
  uploadedDocId?: string; // To track uploaded document ID
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
  const profileData = useAppSelector((state) => state.profile.viewedProfile);
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); // Use Redux dispatch
  // Get profile data from Redux
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isExpert, setIsExpert] = useState(false);

  // State to keep track of existing profile image
  const [existingProfilePhoto, setExistingProfilePhoto] = useState<
    string | null
  >(null);
  const [profilePhotoChanged, setProfilePhotoChanged] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    photo: "",
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
    responseTime: "", // Added for expert role
    travelLimit: "", // Added for expert role
    certificationLevel: "", // New field for certification level
    skills: [] as string[], // New field for skills array
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
  const [skillInput, setSkillInput] = useState<string>("");

  // Country & city data
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] =
    useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };
  const username = localStorage.getItem("username");

  // Check if user is an expert
  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsExpert(role === "expert");
  }, []);

  // Fetch profile data when component mounts
  useEffect(() => {
    if (username) {
      dispatch(getProfile(username));
    } else {
      console.error("No username found in localStorage");
    }
  }, [dispatch, username]);

  // Populate form with profile data when available
  useEffect(() => {
    if (profileData) {
      console.log("Prefilling form with profile data:", profileData);

      // Save existing profile photo if available
      if (profileData.photo) {
        setExistingProfilePhoto(profileData.photo);
      }

      // Map the profile data to form data structure
      setFormData((prevData) => ({
        ...prevData,
        photo: profileData.photo || "",
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        profession: profileData.profession || "",
        subProfession: profileData.subProfession || "",
        age: profileData.age?.toString() || "",
        birthYear: profileData.birthYear?.toString() || "",
        gender: (profileData.gender as GenderType) || ("" as GenderType),
        languages: Array.isArray(profileData.language)
          ? profileData.language.join(", ")
          : "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        country: profileData.country || "",
        city: profileData.city || "",
        footballClub: profileData.company || "",
        bio: profileData.bio || "",

        // Handle expert-specific fields only if user is an expert
        responseTime: isExpert ? profileData.responseTime || "" : "",
        travelLimit: isExpert ? profileData.travelLimit?.toString() || "" : "",
        certificationLevel: isExpert
          ? profileData.certificationLevel || ""
          : "",

        // Fix for skills data
        skills: isExpert
          ? Array.isArray(profileData.skills)
            ? profileData.skills.map((skill: any) =>
                typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || skill
              )
            : []
          : [],

        // Handle social links
        linkedin: profileData.socialLinks?.linkedin || "",
        facebook: profileData.socialLinks?.facebook || "",
        instagram: profileData.socialLinks?.instagram || "",
        twitter: profileData.socialLinks?.twitter || "",
      }));

      // Set search terms for country and city
      if (profileData.country) {
        setSearchTerm(profileData.country);
        // Find and set the selected country object
        const country = countries.find(
          (c) => c.name.toLowerCase() === profileData.country?.toLowerCase()
        );
        if (country) {
          setSelectedCountry(country);
        }
      }

      if (profileData.city) {
        setCitySearchTerm(profileData.city);
      }

      // Check for existing certificates and awards in documents
      if (profileData.documents && Array.isArray(profileData.documents)) {
        // Extract certificates
        const existingCertificates = profileData.documents
          .filter((doc: any) => doc.type === "certificate")
          .map((cert: any, index: number) => ({
            id: index + 1,
            name: cert.title || "",
            organization: cert.issuedBy || "",
            uploadedDocId: cert.id || "",
          }));

        if (existingCertificates.length > 0) {
          setCertificates(existingCertificates);
        }

        // Extract awards
        const existingAwards = profileData.documents
          .filter((doc: any) => doc.type === "award")
          .map((award: any, index: number) => ({
            id: index + 1,
            name: award.title || "",
            organization: award.issuedBy || "", // Added organization mapping for awards
            uploadedDocId: award.id || "",
          }));

        if (existingAwards.length > 0) {
          setAwards(existingAwards);
        }
      }
    }
  }, [profileData, isExpert, countries]);

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

      // Validate expert-specific fields if user is an expert
      if (isExpert) {
        if (!formData.responseTime) {
          errors.responseTime = "Response time is required for experts";
        }
        if (!formData.travelLimit) {
          errors.travelLimit = "Travel limit is required for experts";
        }
      }
    } else if (step === 3) {
      // Validate certificates
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (cert.file && !cert.name) {
          errors[`certificate_${i}_name`] = "Certificate title is required";
        }
      }

      // Validate awards
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        if (award.file && !award.name) {
          errors[`award_${i}_name`] = "Award title is required";
        }
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

  // Handle file uploads
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "professional" | "certificate" | "award",
    id?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should not exceed 2MB.");
      return;
    }

    try {
      if (type === "profile") {
        // Store the file locally and mark that profile photo has changed
        setProfilePhoto(file);
        setProfilePhotoChanged(true);
      } else if (type === "professional") {
        setProfessionalPhoto(file);
        await uploadMediaFile(file, "professional");
      } else if (type === "certificate" && id !== undefined) {
        // Update certificate with file
        setCertificates((prev) =>
          prev.map((cert) => (cert.id === id ? { ...cert, file } : cert))
        );
      } else if (type === "award" && id !== undefined) {
        // Update award with file
        setAwards((prev) =>
          prev.map((award) => (award.id === id ? { ...award, file } : award))
        );
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
    issuedBy: string = "",
    type: "certificate" | "award",
    description: string = ""
  ): Promise<string | null> => {
    try {
      // Validate required fields
      if (!file) {
        throw new Error(`File is required for ${type} upload`);
      }

      if (!title || title.trim() === "") {
        throw new Error(`Title is required for ${type} upload`);
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("issuedBy", issuedBy.trim());

      // Add current date as issue date
      const today = new Date().toISOString().split("T")[0];
      formData.append("issuedDate", today);

      // Add description field
      formData.append("description", description || "");

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

      console.log(`${type} document uploaded:`, response.data);
      return response.data.id || null;
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      setError(
        `Failed to upload ${type}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  // Upload all certificates and awards
  const uploadAllDocuments = async (): Promise<boolean> => {
    try {
      // Upload certificates
      for (const cert of certificates) {
        if (cert.file && cert.name) {
          // Only upload if we have both a file and a name
          const docId = await uploadDocument(
            cert.file,
            cert.name,
            cert.organization || "",
            "certificate"
          );

          if (docId) {
            // Update certificate with uploaded ID
            setCertificates((prev) =>
              prev.map((c) =>
                c.id === cert.id ? { ...c, uploadedDocId: docId } : c
              )
            );
          }
        }
      }

      // Upload awards
      for (const award of awards) {
        if (award.file && award.name) {
          // Only upload if we have both a file and a name
          const docId = await uploadDocument(
            award.file,
            award.name,
            award.organization || "", // Use organization field for awards now
            "award"
          );

          if (docId) {
            // Update award with uploaded ID
            setAwards((prev) =>
              prev.map((a) =>
                a.id === award.id ? { ...a, uploadedDocId: docId } : a
              )
            );
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error uploading documents:", error);
      return false;
    }
  };

  // Add skill to the skills array
  const addSkill = () => {
    if (skillInput.trim() === "") return;

    // Add the skill only if it doesn't already exist in the array
    if (!formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
    }
    setSkillInput(""); // Clear input after adding
  };

  // Remove skill from the skills array
  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
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

    // Clear validation error for this certificate
    if (field === "name" && validationErrors[`certificate_${id}_name`]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[`certificate_${id}_name`];
        return updated;
      });
    }
  };

  // Award functions
  const addAward = () => {
    setAwards([...awards, { id: Date.now() }]);
  };

  const removeAward = async (id: number) => {
    if (awards.length <= 1) return;

    const award = awards.find((a) => a.id === id);

    // If the award was uploaded, delete it from the server
    if (award?.uploadedDocId) {
      try {
        const token = getAuthToken();
        await axios.delete(
          `${API_BASE_URL}/user/document/${award.uploadedDocId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`Deleted award ${id} from server`);
      } catch (error) {
        console.error(`Error deleting award ${id}:`, error);
      }
    }

    setAwards(awards.filter((award) => award.id !== id));
  };

  // Updated handleAwardChange to match handleCertificateChange
  const handleAwardChange = (
    id: number,
    field: "name" | "organization",
    value: string
  ) => {
    setAwards(
      awards.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      )
    );

    // Clear validation error for this award
    if (field === "name" && validationErrors[`award_${id}_name`]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[`award_${id}_name`];
        return updated;
      });
    }
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

  // Final submit function
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // First upload all certificates and awards
      const documentsUploaded = await uploadAllDocuments();

      if (!documentsUploaded) {
        throw new Error("Failed to upload some documents");
      }

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

      // Prepare the profile data to match the schema exactly
      const profileUpdateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        photo: professionalPhotoMedia?.id || formData.photo || null,
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

        // Include expert-specific fields only if user is an expert
        ...(isExpert && {
          certificationLevel: formData.certificationLevel || null,
          skills: Array.isArray(formData.skills)
            ? formData.skills.map((skill: any) =>
                typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || skill
              )
            : [],
          responseTime: formData.responseTime || null,
          travelLimit: formData.travelLimit ? formData.travelLimit : null,
        }),
      };

      console.log("Submitting profile data:", profileUpdateData);

      // Use the updateProfile thunk instead of direct API call
      const resultAction = await dispatch(updateProfile(profileUpdateData));

      if (updateProfile.fulfilled.match(resultAction)) {
        console.log("Profile updated successfully:", resultAction.payload);

        // After profile is updated, update the profile photo using the Redux thunk
        // Only upload new profile photo if it was changed
        if (profilePhoto && profilePhotoChanged) {
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
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      localStorage.setItem("Profilecomplete", "true");
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
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg">
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
            {existingProfilePhoto && !profilePhoto && (
              <div className="flex items-center">
                <img
                  src={existingProfilePhoto}
                  alt="Current profile"
                  className="h-10 w-10 object-cover rounded-full mr-2"
                />
                <span className="text-gray-700">Current profile photo</span>
              </div>
            )}
            <span
              className={`text-gray-500 ${
                existingProfilePhoto && !profilePhoto ? "hidden" : ""
              }`}
            >
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
        <div className="w-5xl">
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

          {/* Certification Level - Only for Experts */}
          {isExpert && (
            <div className="w-full mb-4">
              <label className="block text-black mb-1">
                Certification Level
              </label>
              <select
                name="certificationLevel"
                value={formData.certificationLevel}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Certification Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          )}

          {/* Skills Section - Only for Experts */}
          {isExpert && (
            <div className="w-full mb-4">
              <label className="block text-black mb-1">Skills</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="border p-2 flex-grow rounded-l"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-lightYellow text-white px-4 py-2 rounded-r bg-red-500"
                >
                  Add
                </button>
              </div>

              {/* Display added skills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Expert-specific fields */}
          {isExpert && (
            <div className="flex space-x-4 mb-4">
              <div className="w-1/2">
                <label className="block text-black mb-1">
                  Response Time (mins) *
                </label>
                <input
                  type="text"
                  name="responseTime"
                  placeholder="e.g., 30 mins"
                  value={formData.responseTime}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    validationErrors.responseTime ? "border-red-500" : ""
                  }`}
                  required={isExpert}
                />
                {validationErrors.responseTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.responseTime}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label className="block text-black mb-1">
                  Travel Limit (kms) *
                </label>
                <input
                  type="number"
                  name="travelLimit"
                  placeholder="e.g., 30"
                  value={formData.travelLimit}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    validationErrors.travelLimit ? "border-red-500" : ""
                  }`}
                  required={isExpert}
                />
                {validationErrors.travelLimit && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.travelLimit}
                  </p>
                )}
              </div>
            </div>
          )}

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
        <div className="w-5xl">
          <h2 className="text-xl font-semibold mb-4">Certification</h2>
          {certificates.map((cert, index) => (
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
              <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center flex-col justify-center">
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
                className={`border p-2 w-full rounded mb-2 ${
                  validationErrors[`certificate_${cert.id}_name`]
                    ? "border-red-500"
                    : ""
                }`}
              />
              {validationErrors[`certificate_${cert.id}_name`] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors[`certificate_${cert.id}_name`]}
                </p>
              )}
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
              className="relative mb-4 border p-4 rounded shadow"
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
                <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
                  <span className="text-gray-500">
                    {award.file ? award.file.name : "Upload award image here"}
                  </span>
                  <input
                    type="file"
                    id={`awardFileUpload-${award.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "award", award.id)}
                  />
                  <button
                    className="absolute right-2 bg-lightYellow text-black px-3 py-1 rounded text-sm font-semibold"
                    onClick={() =>
                      document
                        .getElementById(`awardFileUpload-${award.id}`)
                        ?.click()
                    }
                    type="button"
                  >
                    Browse
                  </button>
                </div>
                <label className="block text-black mb-1">Award Title*</label>
                <input
                  type="text"
                  placeholder="Award Title"
                  value={award.name || ""}
                  onChange={(e) =>
                    handleAwardChange(award.id, "name", e.target.value)
                  }
                  className={`border p-2 w-full rounded mb-2 ${
                    validationErrors[`award_${award.id}_name`]
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {validationErrors[`award_${award.id}_name`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors[`award_${award.id}_name`]}
                  </p>
                )}
                {/* Added Issued By field for awards to match certificates */}
                <label className="block text-black mb-1">Issued By</label>
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={award.organization || ""}
                  onChange={(e) =>
                    handleAwardChange(award.id, "organization", e.target.value)
                  }
                  className="border p-2 w-full rounded mb-2"
                />
                {award.uploadedDocId && (
                  <div className="text-green-600 text-sm mt-2">
                    ✓ Award uploaded successfully
                  </div>
                )}
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
        <div className="w-5xl">
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
            className="bg-yellow-300 text-black px-4 py-2 rounded"
            disabled={isSubmitting}
            type="button"
          >
            Save & Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`bg-red-500 text-white px-4 py-2 rounded ${
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
