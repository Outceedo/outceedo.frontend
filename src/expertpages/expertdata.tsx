import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
  faCamera,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import ExpertDetails from "./Expertdetails";
import ExpertServices from "./Expertservices";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile, updateProfilePhoto } from "../store/profile-slice";
import Swal from "sweetalert2";
import avatar from "../assets/images/avatar.png";
import { useNavigate } from "react-router-dom";
import Mediaedit from "@/Pages/Media/MediaEdit";
import Reviewnoedit from "@/Pages/Reviews/Reviewprofilenoedit";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FollowList from "../components/follower/followerlist";
import axios from "axios";

interface Follower {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: string;
  [key: string]: any;
}

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "" },
  { icon: faFacebook, color: "#3b5998", link: "" },
  { icon: faInstagram, color: "#E1306C", link: "" },
  { icon: faXTwitter, color: "#0C0B0B", link: "" },
];

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
          className="text-yellow-400 text-base sm:text-lg lg:text-xl"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="text-yellow-400 text-base sm:text-lg lg:text-xl"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className="text-yellow-400 text-base sm:text-lg lg:text-xl"
        />
      ))}
    </span>
  );
};

const ExpertProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [serviceCount, setServiceCount] = useState(0);

  // Follower states
  const [followersCount, setFollowersCount] = useState(0);
  const [followersLimit, setFollowersLimit] = useState(10);
  const [followersPage, setFollowersPage] = useState(1);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Get profile state from Redux store
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

  // API URLs
  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;
  const API_BOOKING_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Fetch profile data on component mount
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      dispatch(getProfile(username));
    }
    getExpertServiceCount();
  }, [dispatch]);

  // Fetch followers count when profile loads
  useEffect(() => {
    if (currentProfile?.id) {
      fetchFollowers();
    }
  }, [currentProfile]);

  useEffect(() => {
    const navigationTimer = setTimeout(async () => {
      const userRole = localStorage.getItem("role");
      const isProfileIncomplete =
        !currentProfile?.age ||
        !currentProfile?.gender ||
        !currentProfile?.height ||
        !currentProfile?.weight;

      if (isProfileIncomplete) {
        try {
          await Swal.fire({
            icon: "warning",
            title: "Please enter the Profile details",
            text: "Redirecting to Details form",
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
          navigate("/expert/details-form");
        } catch {
          null;
        }
      } else {
        if (userRole === "player") {
          navigate("/player/profile");
        } else if (userRole === "expert") {
          navigate("/expert/profile");
        } else {
          navigate("/expert/details-form");
        }
      }
    }, 5000);
    return () => clearTimeout(navigationTimer);
  }, [navigate, currentProfile]);

  // Fetch followers count only (for the stats display)

  // Fetch followers list with pagination
  const fetchFollowers = async (
    limit = followersLimit,
    page = followersPage
  ) => {
    if (!currentProfile?.id) return;

    setLoadingFollowers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_FOLLOW_URL}/${currentProfile.id}/followers?limit=${limit}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFollowers(response.data?.users || []);

      // Update followers count from the detailed API response if available
      if (typeof response.data?.totalCount === "number") {
        setFollowersCount(response.data.totalCount);
      } else if (Array.isArray(response.data?.users) && page === 1) {
        // Only update count from users array length if it's the first page
        // and we don't have totalCount
        setFollowersCount(response.data.users.length);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Handle followers modal open
  const handleFollowersClick = () => {
    setIsFollowersModalOpen(true);
    fetchFollowers();
  };

  const getExpertServiceCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BOOKING_URL}/expert/${currentProfile?.id}/count`,
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

  const formatExpertData = () => {
    if (!currentProfile)
      return {
        name: "",
        profession: "",
        location: "",
        responseTime: "",
        travelLimit: "",
        certificationLevel: "",
        reviews: 0,
        followers: followersCount, // Use dynamic followers count
        assessments: 0,
        profileImage: "",
        about: "",
        skills: [],
        certifications: [],
        socials: {},
        uploads: [],
        documents: [],
        id: "",
        rawProfile: {},
        reviewsReceived: [],
      };

    const profile = currentProfile;
    const mediaItems = profile.uploads || [];
    let profileImage = "";
    if (profile.photo) {
      profileImage = profile.photo;
    } else if (mediaItems.length > 0) {
      const profilePhoto = mediaItems.find((item) => item.type === "photo");
      if (profilePhoto) {
        profileImage = profilePhoto.url;
      }
    }
    const socials = profile.socialLinks || {};
    icons[0].link = socials.linkedin || "";
    icons[1].link = socials.facebook || "";
    icons[2].link = socials.instagram || "";
    icons[3].link = socials.twitter || "";
    const certifications =
      profile.documents
        ?.filter((doc) => doc.type === "certificate")
        .map((cert) => cert.title) || [];
    return {
      id: profile.id || "",
      name:
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        "Expert",
      profession: profile.profession || "",
      location:
        profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : "",
      responseTime: profile.responseTime || "N/A",
      travelLimit: profile.travelLimit ? `${profile.travelLimit} kms` : "N/A",
      certificationLevel: profile.certificationLevel || "N/A",
      reviews: profile.reviews || 0,
      followers: followersCount, // Use dynamic followers count
      assessments: profile.assessments || "0",
      profileImage: profileImage,
      about: profile.bio || "",
      skills: profile.skills || [],
      certifications: certifications,
      socials: socials,
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile,
      reviewsReceived: profile.reviewsReceived || [],
      language: profile.language,
      club: profile.club,
    };
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size and type before uploading
    if (file.size > 1 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: "Profile photo must be less than 1MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid file type",
        text: "Please select an image file",
      });
      return;
    }

    setIsUpdatingPhoto(true);

    try {
      await dispatch(updateProfilePhoto(file)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile photo updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message || "Failed to update profile photo",
      });
    } finally {
      setIsUpdatingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const expertData = formatExpertData();

  // Review Stars Calculation:
  const reviewsArray = expertData.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        totalReviews;

  // Show loading state
  if (status === "loading" && !currentProfile) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Loading expert profile...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === "failed" && error) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center p-4">
        <div className="text-center text-red-600 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg max-w-md">
          <p className="text-sm sm:text-base">Error loading profile: {error}</p>
          <button
            onClick={() => {
              const username = localStorage.getItem("username");
              if (username) {
                dispatch(getProfile(username));
              }
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex -mt-6">
      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 dark:bg-gray-900 ml-0 sm:ml-15">
        <div className="flex flex-col lg:flex-row justify-between items-start w-full p-2 sm:p-4 mx-auto bg-dark:bg-slate-700 gap-4 lg:gap-6">
          {/* Left - Expert Info Section */}
          <div className="flex-1 w-full lg:pr-6">
            {/* Name and Social Icons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white">
                {expertData.name}
              </h1>
              <div className="flex gap-2 sm:gap-3 lg:gap-4">
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
                      className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full text-white text-sm sm:text-base lg:text-xl shadow-lg"
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

            {/* Expert Info - All fields in one grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
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
                  {expertData.travelLimit.replace("kms", " ")}kms
                </p>
              </div>
            </div>
          </div>

          {/* Right - Profile Picture */}
          <div className="w-full sm:w-80 h-48 sm:h-60 lg:w-80 lg:h-60 bg-gray-200 rounded-lg overflow-hidden shadow-md relative group flex-shrink-0">
            {expertData.profileImage ? (
              <img
                src={expertData.profileImage}
                alt="Expert"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={avatar}
                alt="Expert"
                className="w-full h-full object-cover"
              />
            )}
            {/* Profile photo upload overlay */}
            <div
              onClick={handlePhotoClick}
              className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            >
              <div className="text-white text-center">
                <FontAwesomeIcon
                  icon={faCamera}
                  className="text-xl sm:text-2xl mb-2"
                />
                <p className="text-xs sm:text-sm font-medium">
                  {expertData.profileImage ? "Change Photo" : "Add Photo"}
                </p>
              </div>
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            {/* Photo upload loading indicator */}
            {isUpdatingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-white text-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-xl sm:text-2xl mb-2"
                  />
                  <p className="mt-2 text-xs sm:text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-b py-4 sm:py-6 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
            <div className="flex items-center justify-center">
              <StarRating avg={avgRating} />
              <p className="text-gray-500 dark:text-white ml-2 text-sm sm:text-base">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                {totalReviews > 0 && (
                  <span className="ml-2 text-gray-600 text-sm sm:text-base">
                    ({avgRating.toFixed(1)} avg)
                  </span>
                )}
              </p>
            </div>

            {/* Followers Dialog */}
            <Dialog
              open={isFollowersModalOpen}
              onOpenChange={setIsFollowersModalOpen}
            >
              <DialogTrigger asChild>
                <div
                  className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  onClick={handleFollowersClick}
                >
                  <p className="text-red-500 text-2xl sm:text-3xl font-bold">
                    {followersCount}
                  </p>
                  <p className="text-gray-500 dark:text-white text-sm sm:text-base">
                    Followers
                  </p>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-xs sm:max-w-md max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg font-semibold text-center">
                    Followers ({followersCount})
                  </DialogTitle>
                </DialogHeader>

                {/* Pagination controls */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Show:</label>
                    <select
                      value={followersLimit}
                      onChange={(e) => {
                        setFollowersLimit(Number(e.target.value));
                        setFollowersPage(1);
                        fetchFollowers(Number(e.target.value), 1);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                      disabled={loadingFollowers}
                    >
                      {[5, 10, 20, 50].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={followersPage === 1 || loadingFollowers}
                      onClick={() => {
                        const newPage = followersPage - 1;
                        setFollowersPage(newPage);
                        fetchFollowers(followersLimit, newPage);
                      }}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-medium">
                      Page {followersPage}
                    </span>
                    <button
                      disabled={
                        followers.length < followersLimit || loadingFollowers
                      }
                      onClick={() => {
                        const newPage = followersPage + 1;
                        setFollowersPage(newPage);
                        fetchFollowers(followersLimit, newPage);
                      }}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Followers list */}
                <div className="overflow-y-auto max-h-96">
                  <FollowList
                    followers={followers}
                    loading={loadingFollowers}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="text-center">
              <p className="text-red-500 text-2xl sm:text-3xl font-bold">
                {serviceCount || 0}
              </p>
              <p className="text-gray-500 dark:text-white text-sm sm:text-base">
                Services Completed
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
            {(["details", "media", "reviews", "services"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm sm:text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? "text-red-600 border-red-600"
                      : "border-transparent text-gray-600 dark:text-white hover:text-red-600"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
          <div className="mt-4">
            {activeTab === "details" && (
              <ExpertDetails expertData={expertData} />
            )}
            {activeTab === "media" && <Mediaedit Data={expertData} />}
            {activeTab === "reviews" && <Reviewnoedit Data={expertData} />}
            {activeTab === "services" && (
              <ExpertServices expertData={expertData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpertProfile;
