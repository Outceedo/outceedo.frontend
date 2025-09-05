import { useCallback, useEffect, useState } from "react";
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
  faLock,
  faUserPlus,
  faUserCheck,
  faHeart,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";
import { MoveLeft } from "lucide-react";
import Mediaview from "@/Pages/Media/MediaView";
import Reviewview from "../Reviews/Reviewview";
import ExpertProfiledetails from "./ExpertProfiledetails";
import FollowersList from "../../components/follower/followerlist";
import Swal from "sweetalert2";

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

interface Follower {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: string;
  [key: string]: any;
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
  const [isLoading, setIsLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followersLimit, setFollowersLimit] = useState(10);
  const [followersPage, setFollowersPage] = useState(1);

  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const [serviceCount, setServiceCount] = useState(0);

  const dispatch = useAppDispatch();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);
  const navigate = useNavigate();

  const API_BOOKING_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;
  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;

  const isUserOnPremiumPlan =
    (isActive && planName && planName.toLowerCase() !== "free") || true;

  const isServiceAllowed = (serviceId: string) => {
    if (!isUserOnPremiumPlan) {
      return serviceId === "1";
    }
    return true;
  };

  const isFollowAllowed = () => {
    if (localStorage.getItem("role") === "player") {
      return isUserOnPremiumPlan;
    } else {
      return true;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const expertUsername = localStorage.getItem("viewexpertusername");
        if (expertUsername) {
          setTimeout(() => {
            dispatch(getProfile(expertUsername));
          }, 200);
        } else {
          setIsLoading(false);
          console.error("No expert username found in localStorage");
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" && viewedProfile) {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } else if (status === "failed") {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [viewedProfile, status]);

  useEffect(() => {
    if (viewedProfile?.id) {
      checkFollowStatus();
      setFollowersCount(viewedProfile.followersCount || 0);
    }
  }, [viewedProfile]);

  useEffect(() => {
    if (viewedProfile?.id) {
      getExpertServiceCount();
    }
  }, [viewedProfile?.id]);

  useEffect(() => {
    if (viewedProfile?.id) {
      fetchFollowers(followersLimit, followersPage);
    }
  }, [viewedProfile?.id]);

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !viewedProfile?.id) return;

      const response = await axios.get(
        `${API_FOLLOW_URL}/${viewedProfile.id}/isFollowing`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsFollowing(response.data?.isFollowing || false);
    } catch (error) {
      console.error("Error checking follow status:", error);
      setIsFollowing(false);
    }
  };

  const getExpertServiceCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BOOKING_URL}/expert/${viewedProfile?.id}/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServiceCount(response.data?.count || 0);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchFollowers = useCallback(
    async (limit = followersLimit, page = followersPage) => {
      if (!viewedProfile?.id) return;

      setLoadingFollowers(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_FOLLOW_URL}/${viewedProfile.id}/followers?limit=${limit}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFollowers(response.data?.users || []);
        if (typeof response.data?.totalCount === "number") {
          setFollowersCount(response.data.totalCount);
        } else if (Array.isArray(response.data?.users)) {
          setFollowersCount(response.data.users.length);
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
        setFollowers([]);
      } finally {
        setLoadingFollowers(false);
      }
    },
    [viewedProfile?.id, API_FOLLOW_URL]
  );

  const handleFollowersClick = () => {
    setIsFollowersModalOpen(true);
    fetchFollowers();
  };

  const handleFollow = async () => {
    if (!isFollowAllowed()) {
      const currentPlanName = planName || "Free";

      Swal.fire({
        icon: "info",
        title: "Upgrade to Premium",
        html: `
          <div class="text-left">
            <p class="mb-3">Following experts is only available for Premium members.</p>
            <div class="bg-blue-50 p-3 rounded-lg mb-3">
              <h4 class="font-semibold text-blue-800 mb-2">Premium Benefits:</h4>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• Follow your favorite experts</li>
                <li>• Access to all expert services</li>
                <li>• Unlimited bookings</li>
                <li>• Priority support</li>
                <li>• Enhanced storage capacity</li>
                <li>• Worldwide expert search</li>
                <li>• Reports download & share</li>
              </ul>
            </div>
            <p class="text-sm text-gray-600">Your current plan: <strong>${currentPlanName}</strong></p>
            <p class="text-xs text-gray-500 mt-2">Free plan has limited features</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#6B7280",
        customClass: {
          popup: "swal-wide",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/plans");
        }
      });
      return;
    }

    if (!viewedProfile?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Expert information not available. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setIsFollowLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "Please login to follow experts.",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      let response;
      let newFollowStatus;

      if (isFollowing) {
        response = await axios.patch(
          `${API_FOLLOW_URL}/${viewedProfile.id}/unfollow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        newFollowStatus = false;
      } else {
        response = await axios.patch(
          `${API_FOLLOW_URL}/${viewedProfile.id}/follow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        newFollowStatus = true;
      }

      setIsFollowing(newFollowStatus);

      setFollowersCount((prev) => (newFollowStatus ? prev + 1 : prev - 1));

      Swal.fire({
        icon: "success",
        title: newFollowStatus ? "Following!" : "Unfollowed",
        text: newFollowStatus
          ? `You are now following ${expertData.name}`
          : `You unfollowed ${expertData.name}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Follow/Unfollow error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update follow status. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollowWithConfirmation = async () => {
    if (!isFollowing) return;

    Swal.fire({
      title: "Unfollow Expert?",
      text: `Are you sure you want to unfollow ${expertData.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, unfollow",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleFollow();
      }
    });
  };

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
        followers: followersCount,
        assessments: 0,
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
        followers: followersCount,
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
    "4": "ON GROUND TRAINING",
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
            ? `£${service.price}/h`
            : `£${service.price || 0}/h`,
      };
    }) || [];

  const reviewsArray = viewedProfile?.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) /
        totalReviews;

  if (isLoading) {
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
    const serviceId = String(service.serviceId);

    if (!isServiceAllowed(serviceId)) {
      const currentPlanName = planName || "Free";

      Swal.fire({
        icon: "info",
        title: "Upgrade to Premium",
        html: `
          <div class="text-left">
            <p class="mb-3">This service is only available for Premium members.</p>
            <div class="bg-blue-50 p-3 rounded-lg mb-3">
              <h4 class="font-semibold text-blue-800 mb-2">Premium Benefits:</h4>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• Access to all expert services</li>
                <li>• Unlimited bookings</li>
                <li>• Priority support</li>
                <li>• Enhanced storage capacity</li>
                <li>• Worldwide expert search</li>
                <li>• Reports download & share</li>
              </ul>
            </div>
            <p class="text-sm text-gray-600">Your current plan: <strong>${currentPlanName}</strong></p>
            <p class="text-xs text-gray-500 mt-2">Free plan only includes: Recorded Video Assessment</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#6B7280",
        customClass: {
          popup: "swal-wide",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/plans");
        }
      });
      return;
    }

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
      Swal.fire({
        icon: "error",
        title: "Please select a video to upload",
        timer: 3000,
        showConfirmButton: false,
      });

      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(20);
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          timer: 3000,
          showConfirmButton: false,
        });
        setIsUploading(false);
        return;
      }
      const expertId = localStorage.getItem("expertid");
      const userId = localStorage.getItem("userId");
      if (!expertId) {
        Swal.fire({
          icon: "error",
          title: "Expert Information Missing. Please try again",
          timer: 3000,
          showConfirmButton: false,
        });
        setIsUploading(false);
        return;
      }
      const extractPrice = (priceString: string | number): number => {
        if (typeof priceString === "number") {
          return priceString;
        }

        if (typeof priceString === "string") {
          const numericString = priceString.replace(/[^\d.]/g, "");
          const parsedPrice = parseFloat(numericString);
          return isNaN(parsedPrice) ? 0 : parsedPrice;
        }

        return 0;
      };
      const servicePrice = extractPrice(currentService?.price || 0);
      const formData = new FormData();
      formData.append("video", selectedVideo);
      const bookingData = {
        expertId: expertId,
        playerId: userId,
        serviceId: currentService?.id,
        price: servicePrice,
        date: getTodaysDate(),
        startTime: "00:00",
        endTime: "00:00",
        description: videoDescription || "",
        status: "WAITING_EXPERT_APPROVAL",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      Swal.fire({
        icon: "success",
        title: "Video assessment request submitted successfully!",
        text: "You'll be notified when the expert reviews your recording.",
        timer: 3000,
        showConfirmButton: false,
      });
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
    <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl sm:text-3xl font-bold cursor-pointer"
        >
          <MoveLeft />
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="flex-1 md:pr-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold dark:text-white mb-2 sm:mb-0">
              {expertData.name}
            </h1>
            <div className="ml-0 sm:ml-10 flex gap-3 sm:gap-4 mt-2 sm:mt-0">
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
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white text-lg sm:text-xl shadow-lg"
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-6">
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Profession
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.profession || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Club
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.club || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Languages
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.language?.length > 0
                  ? expertData.language.slice(0, 3).join(", ")
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Location
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.location || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Certification Level
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.certificationLevel || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Response Time
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.responseTime || "N/A"} mins
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Travel Limit
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {expertData.travelLimit || "N/A"} kms
              </p>
            </div>
          </div>
        </div>
        <div className="w-32 h-32 sm:w-1/3 sm:h-auto md:w-1/3 lg:w-1/4 rounded-lg overflow-hidden mx-auto md:mx-auto flex md:justify-center">
          <img
            src={expertData.profileImage || profile}
            alt={expertData.name}
            className="w-full h-full aspect-square object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
      <div className="border-t border-b py-4 sm:py-6 mb-6 sm:mb-8">
        <div className="flex flex-wrap justify-around items-center gap-4">
          <div className="flex items-center gap-2">
            <StarRating avg={avgRating} className="mr-2" />
            <span className="text-gray-500 text-sm">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-500"> ({avgRating}/5)</span>
          </div>
          <div
            className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
            onClick={handleFollowersClick}
          >
            <p className="text-red-500 text-2xl sm:text-3xl font-bold">
              {expertData.followers}
            </p>
            <p className="text-gray-500 text-xs sm:text-base">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-red-500 text-2xl sm:text-3xl font-bold">
              {serviceCount}+
            </p>
            <p className="text-gray-500 text-xs sm:text-base">
              Services Completed
            </p>
          </div>
        </div>
      </div>

      {(localStorage.getItem("role") !== "player" ||
        (localStorage.getItem("role") === "player" && isUserOnPremiumPlan)) && (
        <div className="border-b py-4 sm:py-6 mb-6 sm:mb-8">
          <div className="flex flex-col items-center justify-center">
            {isFollowAllowed() && isFollowing ? (
              <div className="flex items-center gap-2">
                <Button
                  disabled
                  className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white cursor-default"
                >
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="text-lg mr-2"
                  />
                  Following
                </Button>
                <Button
                  onClick={handleUnfollowWithConfirmation}
                  disabled={isFollowLoading}
                  className="px-4 py-3 rounded-lg font-semibold bg-gray-500 hover:bg-red-600 text-white transition-colors"
                >
                  {isFollowLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faUserMinus}
                        className="text-lg mr-2"
                      />
                      Unfollow
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white`}
              >
                {isFollowLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} className="text-lg" />
                    Follow
                  </>
                )}
              </Button>
            )}

            {isFollowing && isFollowAllowed() && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                <FontAwesomeIcon icon={faHeart} className="mr-1" />
                You're following {expertData.name}
              </p>
            )}
          </div>
        </div>
      )}
      {localStorage.getItem("role") === "player" && !isUserOnPremiumPlan && (
        <div className="border-b py-4 sm:py-6 mb-6 sm:mb-8">
          <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Following experts is a <strong>Premium feature</strong>.
              <button
                onClick={() => navigate("/plans")}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Upgrade to Premium
              </button>{" "}
              to follow your favorite experts.
            </p>
          </div>
        </div>
      )}

      {localStorage.getItem("role") === "player" ? (
        <>
          <div className="border-b py-4 sm:py-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold">Services Offered</h2>

            {!subscriptionLoading && (
              <div
                className={`rounded-lg p-3 mb-4 mt-2 ${
                  isUserOnPremiumPlan
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                }`}
              >
                <p
                  className={`text-sm ${
                    isUserOnPremiumPlan
                      ? "text-green-700 dark:text-green-300"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isUserOnPremiumPlan ? (
                    <>
                      ✨ You're on the <strong>{planName}</strong> plan! Access
                      to all services is available.
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="mr-2" />
                      You're on the <strong>{planName || "Free"}</strong> plan.
                      Only <strong>Recorded Video Assessment</strong> is
                      available.
                      <button
                        onClick={() => navigate("/plans")}
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Upgrade to Premium
                      </button>{" "}
                      for access to all services.
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 mb-6 sm:mb-8">
              {services.length > 0 ? (
                services.map((service) => {
                  const serviceAllowed = isServiceAllowed(
                    String(service.serviceId)
                  );

                  return (
                    <Card
                      key={service.id}
                      className={`overflow-hidden ${
                        !serviceAllowed ? "opacity-75 border-gray-300" : ""
                      }`}
                    >
                      <div className="p-4 sm:p-5 relative">
                        {!serviceAllowed && (
                          <div className="absolute top-2 right-2">
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-gray-400 text-lg"
                            />
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4">
                          <h3
                            className={`text-base sm:text-lg font-semibold ${
                              !serviceAllowed
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {service.name}
                            {!serviceAllowed && (
                              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                Premium Only
                              </span>
                            )}
                          </h3>
                          <span
                            className={`font-bold mt-2 sm:mt-0 ${
                              !serviceAllowed ? "text-gray-500" : "text-red-600"
                            }`}
                          >
                            {service.price}
                          </span>
                        </div>
                        <p
                          className={`mb-3 sm:mb-4 text-sm sm:text-base ${
                            !serviceAllowed
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {service.description}
                        </p>
                        <Button
                          onClick={() => handlebook(service)}
                          className={`w-full sm:w-auto ${
                            serviceAllowed
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
                          }`}
                        >
                          {serviceAllowed ? "Book Now" : "Upgrade to Book"}
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <p className="col-span-2 text-center text-gray-500 text-base sm:text-xl">
                  No services available.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="mb-6 sm:mb-8 border-b">
        <div className="flex space-x-4 sm:space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`pb-2 rounded-none text-sm sm:text-base capitalize transition-none whitespace-nowrap ${
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
      <div className="mt-4 sm:mt-6">
        {activeTab === "details" && (
          <ExpertProfiledetails expertData={expertData} />
        )}
        {activeTab === "media" && <Mediaview Data={viewedProfile} />}
        {activeTab === "reviews" && (
          <div className="flex flex-col items-center">
            <Reviewview Data={expertData} />
          </div>
        )}
      </div>

      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] max-w-md p-6 relative max-h-[80vh] overflow-hidden">
            <button
              onClick={() => setIsFollowersModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
              Followers ({followersCount})
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="mr-2 font-medium">Followers per page:</label>
                <select
                  value={followersLimit}
                  onChange={(e) => {
                    setFollowersLimit(Number(e.target.value));
                    setFollowersPage(1);
                    fetchFollowers(Number(e.target.value), 1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  {[1, 5, 10, 20, 50].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  disabled={followersPage === 1 || loadingFollowers}
                  onClick={() => {
                    setFollowersPage(followersPage - 1);
                    fetchFollowers(followersLimit, followersPage - 1);
                  }}
                  className="px-2 py-1 border rounded mr-2"
                >
                  Prev
                </button>
                <span>Page {followersPage}</span>
                <button
                  disabled={
                    followers.length < followersLimit || loadingFollowers
                  }
                  onClick={() => {
                    setFollowersPage(followersPage + 1);
                    fetchFollowers(followersLimit, followersPage + 1);
                  }}
                  className="px-2 py-1 border rounded ml-2"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              <FollowersList followers={followers} loading={loadingFollowers} />
            </div>
          </div>
        </div>
      )}

      {isVideoUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[96vw] max-w-lg p-3 sm:p-6 relative">
            <button
              onClick={() => setIsVideoUploadModalOpen(false)}
              disabled={isUploading}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
              Upload Video for Assessment
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs sm:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                      className="w-full h-28 sm:h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                      disabled={isUploading}
                    >
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="text-xl sm:text-2xl text-gray-400"
                      />
                      <span className="text-gray-500 text-xs sm:text-base">
                        {selectedVideo
                          ? selectedVideo.name
                          : "Click to upload video"}
                      </span>
                    </Button>
                    {selectedVideo && (
                      <div className="mt-2 text-xs sm:text-sm text-green-600">
                        Selected: {selectedVideo.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe what you'd like the expert to assess in your video..."
                  className="w-full h-24 sm:h-32 dark:bg-gray-700"
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
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    {uploadProgress < 100
                      ? "Uploading video..."
                      : "Processing..."}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsVideoUploadModalOpen(false)}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
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

      <style jsx global>{`
        .swal-wide {
          width: 600px !important;
        }
      `}</style>
    </div>
  );
};

export default Expertview;
