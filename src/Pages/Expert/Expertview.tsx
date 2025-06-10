import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  faStar as faStarSolid,
  faStarHalfAlt,
  faUpload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";
import { MoveLeft } from "lucide-react";
import Mediaview from "@/Pages/Media/MediaView";
import Reviewview from "../Reviews/Reviewview";
import ExpertProfiledetails from "./ExpertProfiledetails";

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "https://www.linkedin.com" },
  { icon: faFacebook, color: "#3b5998", link: "https://www.facebook.com" },
  { icon: faInstagram, color: "#E1306C", link: "https://www.instagram.com" },
  { icon: faXTwitter, color: "#1DA1F2", link: "https://www.twitter.com" },
];

interface Service {
  id: number | string;
  serviceId?: string;
  name: string;
  description?: string;
  additionalDetails?: string;
  price: string | number;
  isActive?: boolean;
}

type TabType = "details" | "media" | "reviews" | "services";

const StarRating: React.FC<{
  avg: number;
  total?: number;
  className?: string;
}> = ({ avg, total = 5, className }) => {
  const fullStars = Math.floor(avg);
  const hasHalfStar = avg - fullStars >= 0.25 && avg - fullStars < 0.75;
  const emptyStars = total - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className={className}>
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStarSolid}
          className="text-yellow-400 text-xl"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="text-yellow-400 text-xl"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className="text-xl text-yellow-400"
        />
      ))}
    </span>
  );
};

const Expertview = () => {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const tabs: TabType[] = ["details", "media", "reviews"];
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const dispatch = useAppDispatch();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

  const API_BOOKING_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  useEffect(() => {
    const expertUsername = localStorage.getItem("viewexpertusername");
    if (expertUsername) {
      dispatch(getProfile(expertUsername));
    } else {
      console.error("No expert username found in localStorage");
    }
  }, [dispatch]);

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
        followers: Math.floor(Math.random() * 200) + 50, // Demo
        assessments: Math.floor(Math.random() * 150) + 50, // Demo
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
        club: viewedProfile.club,
      }
    : {
        name: "N/A",
        profession: "N/A",
        location: "N/A",
        responseTime: "N/A",
        travelLimit: "N/A",
        certificationLevel: "3rd highest",
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

  const SERVICE_NAME_MAP: Record<string, string> = {
    "1": "RECORDED VIDEO ASSESSMENT",
    "2": "ONLINE TRAINING",
    "3": "ON GROUND ASSESSMENT",
    "4": "ONLINE ASSESSMENT",
  };

  const getServiceNameById = (
    serviceId: string | number | undefined
  ): string => {
    if (!serviceId) return "Unknown Service";
    const id = String(serviceId);
    return SERVICE_NAME_MAP[id] || "Custom Service";
  };

  const formatServiceDescription = (description: any): string => {
    if (!description) return "No description available";
    if (typeof description === "string") {
      return description;
    }
    if (typeof description === "object") {
      if (description.description) {
        return description.description;
      }
      try {
        const entries = Object.entries(description);
        if (entries.length === 0) return "No description available";
        return entries
          .map(([key, value]) => {
            if (key === "duration") return null;
            return `${key}: ${value}`;
          })
          .filter(Boolean)
          .join(", ");
      } catch (e) {
        return "No description available";
      }
    }
    return "No description available";
  };

  const services =
    expertData.services?.map((service: any) => {
      const serviceName = getServiceNameById(service.serviceId);
      let displayDescription;
      if (typeof service.additionalDetails === "object") {
        displayDescription = formatServiceDescription(
          service.additionalDetails
        );
      } else {
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

  // --- Star rating calculation using real reviewsReceived ---
  const reviewsArray = viewedProfile?.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) /
        totalReviews;

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

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
    setCurrentService(service);
    const serviceData = {
      expertId: expertData.id,
      expertname: expertData.name,
      expertProfileImage: expertData.profileImage,
      serviceid: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
    };
    switch (service.serviceId) {
      case "1":
        setIsVideoUploadModalOpen(true);
        setVideoDescription("");
        setUploadProgress(0);
        break;
      case "2":
      case "3":
      case "4":
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
        break;
      default:
        localStorage.setItem("selectedService", JSON.stringify(serviceData));
        navigate("/player/book");
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const handleVideoUploadSubmit = async () => {
    if (!selectedVideo) {
      alert("Please select a video to upload");
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(20);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        setIsUploading(false);
        return;
      }
      const expertId = localStorage.getItem("expertid");
      const userId = localStorage.getItem("userId");
      if (!expertId) {
        alert("Expert information missing. Please try again.");
        setIsUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append("video", selectedVideo);
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
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      setUploadProgress(50);
      await axios.post(API_BOOKING_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      setIsVideoUploadModalOpen(false);
      alert(
        "Video assessment request submitted successfully! You'll be notified when the expert reviews your recording."
      );
      navigate("/player/mybooking");
    } catch (error: any) {
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
      {/* Back button */}
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
        <div className="flex-1 pr-6">
          <div className="flex items-center mb-6">
            <h1 className="text-4xl font-bold dark:text-white">
              {expertData.name}
            </h1>
            <div className="ml-10 flex gap-4">
              {icons.map((item, index) =>
                item.link ? (
                  <a
                    key={index}
                    href={
                      item.link.startsWith("http")
                        ? item.link
                        : `https://${item.link.replace(/^\/+/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white text-xl shadow-lg"
                    style={{
                      background:
                        item.icon === faInstagram
                          ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                          : item.color,
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Expert Info - First row */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div>
              <p className="text-gray-500 dark:text-white text-sm">
                Profession
              </p>
              <p className="font-semibold dark:text-white">
                {expertData.profession || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-sm">Club</p>
              <p className="font-semibold dark:text-white">
                {expertData.club || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-sm">Languages</p>
              <p className="font-semibold dark:text-white">
                {expertData.language?.length > 0
                  ? expertData.language.slice(0, 3).join(", ")
                  : "Not specified"}
              </p>
            </div>
          </div>

          {/* Expert Info - Second row */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div>
              <p className="text-gray-500 dark:text-white text-sm">Location</p>
              <p className="font-semibold dark:text-white">
                {expertData.location || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-white text-sm">
                Certification Level
              </p>
              <p className="font-semibold dark:text-white">
                {expertData.certificationLevel || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-sm">
                Response Time
              </p>
              <p className="font-semibold dark:text-white">
                {expertData.responseTime || "N/A"} mins
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-white text-sm">
              Travel Limit
            </p>
            <p className="font-semibold dark:text-white">
              {expertData.travelLimit || "N/A"} kms
            </p>
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
            <StarRating avg={avgRating} className="mr-2" />
            <span className="text-gray-500">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
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
      {localStorage.getItem("role") === "player" ? (
        <>
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
        </>
      ) : null}

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
        {activeTab === "details" && (
          <ExpertProfiledetails expertData={expertData} />
        )}
        {activeTab === "media" && <Mediaview Data={viewedProfile} />}
        {activeTab === "reviews" && <Reviewview Data={expertData} />}
      </div>
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

export default Expertview;
