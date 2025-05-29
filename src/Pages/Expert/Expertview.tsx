import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import profile from "../../assets/images/avatar.png";

import {
  faStar,
  faUpload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";
import { MoveLeft } from "lucide-react";

import Mediaview from "@/Pages/Media/MediaView";
import Reviewview from "../Reviews/Reviewview";

// REMOVED the useState hooks that were here outside the component

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "https://www.linkedin.com" },
  { icon: faFacebook, color: "#3b5998", link: "https://www.facebook.com" },
  { icon: faInstagram, color: "#E1306C", link: "https://www.instagram.com" },
  { icon: faXTwitter, color: "#1DA1F2", link: "https://www.twitter.com" },
];

interface MediaItem {
  id: number | string;
  type: "photo" | "video";
  url: string;
  src: string;
  title: string;
}

interface Review {
  id: number | string;
  name: string;
  date: string;
  comment: string;
}

interface Service {
  id: number | string;
  serviceId?: string;
  name: string;
  description?: string;
  additionalDetails?: string;
  price: string | number;
  isActive?: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type: string;
  description?: string;
}

interface MediaUploadResponse {
  id: string;
  title: string;
  url: string;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = "details" | "media" | "reviews" | "services";

const ExpertProfileView = () => {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const tabs: TabType[] = ["details", "media", "reviews"];
  const [readMore, setReadMore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">(
    "all"
  );
  // Added the state here instead of outside the component
  const [showButton, setShowButton] = useState(false);

  // Certificate preview state
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isCertificatePreviewOpen, setIsCertificatePreviewOpen] =
    useState(false);

  // Video Upload Modal state (for RECORDED VIDEO ASSESSMENT)
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // On Ground Assessment Modal state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationDescription, setLocationDescription] = useState("");

  // Redux state
  const dispatch = useAppDispatch();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

  // API endpoints

  const API_BOOKING_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Fetch expert profile on component mount
  useEffect(() => {
    const expertUsername = localStorage.getItem("viewexpertusername");
    if (expertUsername) {
      dispatch(getProfile(expertUsername));
    } else {
      console.error("No expert username found in localStorage");
    }
  }, [dispatch]);

  // Get certificates and awards from documents
  const certificates = viewedProfile?.documents
    ? viewedProfile.documents
        .filter((doc: any) => doc.type === "certificate")
        .map((cert: any) => ({
          id: cert.id,
          title: cert.title,
          issuedBy: cert.issuedBy || "",
          issuedDate: cert.issuedDate || "",
          imageUrl: cert.imageUrl || "",
          type: cert.type,
          description: cert.description || "",
        }))
    : [];

  const awards = viewedProfile?.documents
    ? viewedProfile.documents
        .filter((doc: any) => doc.type === "award")
        .map((award: any) => ({
          id: award.id,
          title: award.title,
          issuedBy: award.issuedBy || "",
          issuedDate: award.issuedDate || "",
          imageUrl: award.imageUrl || "",
          type: award.type,
          description: award.description || "",
        }))
    : [];

  // Prepare data for display once profile is loaded
  const expertData = viewedProfile
    ? {
        id: viewedProfile.id,
        username: viewedProfile.username,
        name:
          `${viewedProfile.firstName || ""} ${
            viewedProfile.lastName || ""
          }`.trim() || viewedProfile.username,
        profession: viewedProfile.profession || "Coach",
        subProfession: viewedProfile.subProfession || "",
        location:
          viewedProfile.city && viewedProfile.country
            ? `${viewedProfile.city}, ${viewedProfile.country}`
            : viewedProfile.city ||
              viewedProfile.country ||
              "Location Not Specified",
        responseTime: viewedProfile.responseTime || "40 mins",
        travelLimit: viewedProfile.travelLimit || "30 kms",
        certificationLevel: viewedProfile.certificationLevel || "3rd highest",
        reviews: Math.floor(Math.random() * 150) + 50, // Random number for demo
        followers: Math.floor(Math.random() * 200) + 50, // Random number for demo
        assessments: Math.floor(Math.random() * 150) + 50, // Random number for demo
        profileImage: viewedProfile.photo || null,
        socialLinks: viewedProfile.socialLinks || {},
        about:
          viewedProfile.bio ||
          "Experienced soccer coach with a strong background in player development and strategy.",
        skills: viewedProfile.skills ||
          viewedProfile.interests || [
            "Leadership",
            "Tactical Analysis",
            "Team Management",
          ],
        certificates: certificates,
        awards: awards,
        services: viewedProfile.services || [],
        reviewsReceived: viewedProfile.reviewsReceived,
        language: viewedProfile.language,
      }
    : {
        name: "N/A",
        profession: "N/A",
        location: "N/A",
        responseTime: "N/A",
        travelLimit: "N/A",
        certificationLevel: "3rd highest",
        reviews: 120,
        followers: 110,
        assessments: 100,
        profileImage: "N/A",
        about: "N/A",
        skills: [],
        certificates: [],
        awards: [],
        services: [],
      };
  localStorage.setItem("expertid", expertData?.id);
  localStorage.setItem("serviceid", expertData?.services.id);

  // Determine if text should be clamped
  useEffect(() => {
    // Rough estimate: average ~40-50 chars per line depending on font/width
    // For 3 lines, ~120-150 chars would be reasonable
    const charThreshold = 150;
    setShowButton(expertData.about?.length > charThreshold);
  }, [expertData.about]);

  // Media, reviews, and services
  const mediaItems =
    viewedProfile?.uploads?.map((upload: any) => ({
      id: upload.id,
      type: upload.url?.match(/\.(mp4|mov|avi|webm)$/i) ? "video" : "photo",
      url: upload.url,
      src: upload.url,
      title: upload.title || "Untitled",
    })) || [];

  const reviews = [
    {
      id: 1,
      name: "John Doe",
      date: "2024-02-15",
      comment: "Great service! Highly recommend.",
    },
    {
      id: 2,
      name: "Alice Johnson",
      date: "2024-02-10",
      comment: "The experience was amazing. Will come again!",
    },
    {
      id: 3,
      name: "Michael Smith",
      date: "2024-01-25",
      comment: "Good quality, but the waiting time was a bit long.",
    },
  ];
  const SERVICE_NAME_MAP: Record<string, string> = {
    "1": "RECORDED VIDEO ASSESSMENT",
    "2": "ONLINE TRAINING",
    "3": "ON GROUND ASSESSMENT",
    "4": "ONLINE ASSESSMENT",
  };

  // Helper function to get service name from ID
  const getServiceNameById = (
    serviceId: string | number | undefined
  ): string => {
    if (!serviceId) return "Unknown Service";

    const id = String(serviceId);
    return SERVICE_NAME_MAP[id] || "Custom Service";
  };

  // Format service description
  const formatServiceDescription = (description: any): string => {
    if (!description) return "No description available";

    if (typeof description === "string") {
      return description;
    }

    if (typeof description === "object") {
      // Handle case where description is an object
      if (description.description) {
        return description.description;
      }

      // Try to create a readable string from the object
      try {
        const entries = Object.entries(description);
        if (entries.length === 0) return "No description available";

        return entries
          .map(([key, value]) => {
            // Skip rendering duration in the description text
            if (key === "duration") return null;
            return `${key}: ${value}`;
          })
          .filter(Boolean) // Remove null values
          .join(", ");
      } catch (e) {
        return "No description available";
      }
    }

    return "No description available";
  };

  // Map services with correct names
  const services =
    expertData.services?.map((service: any) => {
      // Get service name from ID mapping
      const serviceName = getServiceNameById(service.serviceId);

      // Format additionalDetails for display
      let displayDescription;
      if (typeof service.additionalDetails === "object") {
        // If additionalDetails is an object, extract description
        displayDescription = formatServiceDescription(
          service.additionalDetails
        );
      } else {
        // Otherwise use existing description or additionalDetails
        displayDescription =
          service.description ||
          service.additionalDetails ||
          "No description available";
      }

      return {
        id: service.id || service.serviceId,
        serviceId: service.serviceId,
        name: serviceName,
        description: displayDescription,
        price:
          typeof service.price === "number"
            ? `$${service.price}/h`
            : `$${service.price || 0}/h`,
      };
    }) || [];

  // Filter media based on selection
  const filteredMedia =
    mediaFilter === "all"
      ? mediaItems
      : mediaItems.filter((item) => item.type === mediaFilter);

  // Format issue date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Handle certificate click for preview
  const handleCertificateClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsCertificatePreviewOpen(true);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Error state
  if (status === "failed" || error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">
          Failed to load expert profile
        </h2>
        <p className="mb-6">{error || "An unknown error occurred"}</p>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }
  function getTodaysDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handlebook = (service: Service) => {
    // Set current service for modals
    setCurrentService(service);

    // Store common data for booking
    const serviceData = {
      expertname: expertData.name,
      expertProfileImage: expertData.profileImage,
      serviceid: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
    };

    // Handle different service types based on serviceId
    switch (service.serviceId) {
      case "1": // RECORDED VIDEO ASSESSMENT - open video upload modal
        setIsVideoUploadModalOpen(true);
        setVideoDescription("");
        // setSelectedVideo(null);
        setUploadProgress(0);
        break;

      case "2": // ONLINE TRAINING - navigate to booking page
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
        break;

      case "3": // ON GROUND ASSESSMENT - navigate to booking page
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
        break;
      case "4": // ONLINE ASSESSMENT - navigate to booking page
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
        break;

      default:
        // Default behavior for unknown service types
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
    }
  };

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  // Handle video upload submission
  const handleVideoUploadSubmit = async () => {
    // Validate required fields
    if (!selectedVideo) {
      alert("Please select a video to upload");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      // Get auth token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        setIsUploading(false);
        return;
      }

      // Get required IDs
      const expertId = localStorage.getItem("expertid");
      const userId = localStorage.getItem("userId");

      if (!expertId) {
        alert("Expert information missing. Please try again.");
        setIsUploading(false);
        return;
      }

      // Create FormData to send both video file and booking data in one request
      const formData = new FormData();

      // Add the video file
      formData.append("video", selectedVideo);

      // Add other booking data as JSON string
      const bookingData = {
        expertId: expertId,
        playerId: userId,
        serviceId: currentService?.id,
        date: getTodaysDate(),
        startTime: "00:00",
        endTime: "00:00",
        description: videoDescription || "",
        status: "WAITING_EXPERT_APPROVAL",
      };

      // Append each field individually
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      setUploadProgress(50);

      console.log("Sending booking request with video...");

      // Make the API call with the FormData
      const bookingResponse = await axios.post(API_BOOKING_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            50 + (progressEvent.loaded * 40) / progressEvent.total!
          );
          setUploadProgress(progress);
        },
      });

      setUploadProgress(100);
      console.log("Booking created successfully:", bookingResponse.data);

      // Close modal and show success message
      setIsVideoUploadModalOpen(false);
      alert(
        "Video assessment request submitted successfully! You'll be notified when the expert reviews your recording."
      );

      // Navigate to bookings page
      navigate("/player/mybooking");
    } catch (error: any) {
      console.error("Error during video booking submission:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unknown error occurred";

      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Back button - simplified */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-3xl font-bold cursor-pointer"
        >
          <MoveLeft />
        </button>
      </div>

      {/* Header section with profile info and image */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        {/* Left side - Expert info */}
        <div className="flex-grow">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{expertData.name}</h1>

            {/* Social Media Icons */}
            <div className="flex gap-3 mt-4">
              {icons.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full text-white text-xl shadow-md"
                  style={{
                    background:
                      item.icon === faInstagram
                        ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                        : item.color,
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-6">
            <div>
              <p className="text-gray-500">Profession</p>
              <p className="font-semibold dark:text-white">
                {expertData.profession}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Certification Level</p>
              <p className="font-semibold dark:text-white">
                {expertData.certificationLevel}
              </p>
            </div>
            <div className="text-left">
              <p className="text-gray-500 dark:text-white">Languages</p>
              <p className="font-semibold dark:text-white">
                {expertData.language?.length > 0
                  ? expertData.language.slice(0, 3).map((lang, index) => (
                      <span
                        key={index}
                        className="px-1  dark:bg-gray-600 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                      >
                        {lang}
                      </span>
                    ))
                  : "Not specified"}
              </p>
            </div>
            {/* <div className="md:col-span-1"></div>{" "} */}
            {/* Empty column for proper alignment */}
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-semibold dark:text-white">
                {expertData.location}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Response Time</p>
              <p className="font-semibold dark:text-white">
                {expertData.responseTime}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Travel Limit</p>
              <p className="font-semibold dark:text-white">
                {expertData.travelLimit}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Profile image */}
        <div className="w-full md:w-1/3 lg:w-1/4 rounded-lg overflow-hidden">
          <img
            src={expertData.profileImage || profile}
            alt={expertData.name}
            className="w-full h-auto aspect-square object-cover rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="border-t border-b py-6 mb-8">
        <div className="flex flex-wrap justify-around items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-300 text-xl">
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
            </div>
            <p className="text-gray-500">{expertData.reviews} reviews</p>
          </div>
          <div className="text-center">
            <p className="text-red-500 text-3xl font-bold">
              {expertData.followers}
            </p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-red-500 text-3xl font-bold">
              {expertData.assessments}+
            </p>
            <p className="text-gray-500">Assessments Evaluated</p>
          </div>
        </div>
      </div>
      <div className="border-b py-6 mb-8">
        <h2 className="text-xl font-bold">Services Offered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-8">
          {services.length > 0 ? (
            services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <span className="text-red-600 font-bold">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>
                  <Button
                    onClick={() => handlebook(service)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500 text-xl">
              No services available.
            </p>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="mb-8 border-b">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`pb-2 rounded-none text-base capitalize transition-none ${
                activeTab === tab
                  ? "text-red-500 border-b-2 border-red-500 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* About Me Card */}
            <Card className="p-6 relative">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">About Me</h2>
              </div>
              <div className="relative">
                <p
                  className={cn(
                    "text-gray-700 dark:text-gray-300",
                    !readMore && "line-clamp-3"
                  )}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {expertData.about}
                </p>
                {showButton && (
                  <Button
                    variant="link"
                    className="p-0 text-blue-600 hover:underline mt-2 text-center w-full"
                    onClick={() => setReadMore(!readMore)}
                  >
                    {readMore ? "Show less" : "Read more"}
                  </Button>
                )}
              </div>
            </Card>
            <Card className="p-6 relative">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-bold">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {expertData.skills && expertData.skills.length > 0 ? (
                  expertData.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-gray-800 dark:text-gray-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills available</p>
                )}
              </div>
            </Card>

            {/* Certificates & Awards Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificates Section */}
              <Card className="p-6 relative">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Certifications</h2>
                </div>
                <div className="space-y-3">
                  {expertData.certificates &&
                  expertData.certificates.length > 0 ? (
                    expertData.certificates.map((cert: Certificate) => (
                      <div
                        key={cert.id}
                        className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => handleCertificateClick(cert)}
                      >
                        {/* Image thumbnail if available */}
                        {cert.imageUrl && (
                          <div className="w-16 h-16 flex-shrink-0">
                            <img
                              src={cert.imageUrl}
                              alt={cert.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Certificate details */}
                        <div className="p-3 flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {cert.title}
                          </h4>
                          {cert.issuedBy && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Issued by: {cert.issuedBy}
                              {cert.issuedDate &&
                                ` (${formatDate(cert.issuedDate)})`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No certifications available</p>
                  )}
                </div>
              </Card>

              {/* Awards Section */}
              <Card className="p-6 relative">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Awards</h2>
                </div>
                <div className="space-y-3">
                  {expertData.awards && expertData.awards.length > 0 ? (
                    expertData.awards.map((award: Certificate) => (
                      <div
                        key={award.id}
                        className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => handleCertificateClick(award)}
                      >
                        {/* Image thumbnail if available */}
                        {award.imageUrl && (
                          <div className="w-16 h-16 flex-shrink-0">
                            <img
                              src={award.imageUrl}
                              alt={award.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Award details */}
                        <div className="p-3 flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {award.title}
                          </h4>
                          {award.issuedBy && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Issued by: {award.issuedBy}
                              {award.issuedDate &&
                                ` (${formatDate(award.issuedDate)})`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No awards available</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && <Mediaview Data={viewedProfile} />}

        {/* Reviews Tab */}
        {activeTab === "reviews" && <Reviewview Data={expertData} />}
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-3xl p-4 relative">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              {selectedMedia.title}
            </h3>
            {selectedMedia.type === "photo" ? (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="max-w-full max-h-[70vh] mx-auto object-contain"
              />
            ) : (
              <video
                src={selectedMedia.src}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] mx-auto"
              />
            )}
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCertificate && isCertificatePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-3xl p-4 relative">
            <button
              onClick={() => setIsCertificatePreviewOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {selectedCertificate.title}
            </h3>

            {selectedCertificate.issuedBy && (
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                Issued by: {selectedCertificate.issuedBy}
                {selectedCertificate.issuedDate &&
                  ` • ${formatDate(selectedCertificate.issuedDate)}`}
              </p>
            )}

            {selectedCertificate.imageUrl ? (
              <img
                src={selectedCertificate.imageUrl}
                alt={selectedCertificate.title}
                className="max-w-full max-h-[60vh] mx-auto object-contain border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500">
                  No image available
                </p>
              </div>
            )}

            {selectedCertificate.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedCertificate.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Upload Modal (for RECORDED VIDEO ASSESSMENT) */}
      {isVideoUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-lg p-6 relative">
            <button
              onClick={() => setIsVideoUploadModalOpen(false)}
              disabled={isUploading}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              Upload Video for Assessment
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Upload Video <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="videoUpload"
                    disabled={isUploading}
                  />
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("videoUpload")?.click()
                      }
                      className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                      disabled={isUploading}
                    >
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="text-2xl text-gray-400"
                      />
                      <span className="text-gray-500">
                        {selectedVideo
                          ? selectedVideo.name
                          : "Click to upload video"}
                      </span>
                    </Button>
                    {selectedVideo && (
                      <div className="mt-2 text-sm text-green-600">
                        Selected: {selectedVideo.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe what you'd like the expert to assess in your video..."
                  className="w-full h-32 dark:bg-gray-700"
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="w-full">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {uploadProgress < 100
                      ? "Uploading video..."
                      : "Processing..."}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsVideoUploadModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleVideoUploadSubmit}
                  disabled={isUploading || !selectedVideo}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                      Submit for Assessment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertProfileView;
