import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
  faCamera,
  faSpinner,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import ExpertDetails from "../expertpages/Expertdetails";
import BusinessCard from "../expertpages/BusinessCard";
import ViewCvButton from "@/components/ViewCvButton";
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
import Settings from "@/common/settings";
import ScoutServices from "./ScoutServices";

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
  { icon: faYoutube, color: "#FF0000", link: "" },
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

const ScoutProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "services" | "media" | "reviews" | "account" | "businessCard"
  >("details");
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(true);

  const [followersCount, setFollowersCount] = useState(0);
  const [followersLimit, setFollowersLimit] = useState(10);
  const [followersPage, setFollowersPage] = useState(1);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile,
  );
  const navigate = useNavigate();

  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      dispatch(getProfile(username));
    }
  }, [dispatch]);

  useEffect(() => {
    if (currentProfile?.id) {
      fetchFollowers();
    }
  }, [currentProfile]);

  useEffect(() => {
    const navigationTimer = setTimeout(async () => {
      const userRole = localStorage.getItem("role");
      const isProfileIncomplete = false;

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
          navigate("/scout/details-form");
        } catch {
          null;
        }
      } else {
        if (userRole === "scout") {
          navigate("/scout/profile");
        } else {
          navigate("/scout/details-form");
        }
      }
    }, 5000);
    return () => clearTimeout(navigationTimer);
  }, [navigate, currentProfile]);

  const fetchFollowers = async (
    limit = followersLimit,
    page = followersPage,
  ) => {
    if (!currentProfile?.id) return;

    setLoadingFollowers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_FOLLOW_URL}/${currentProfile.id}/followers?limit=${limit}&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFollowers(response.data?.users || []);
      if (typeof response.data?.totalCount === "number") {
        setFollowersCount(response.data.totalCount);
      } else if (Array.isArray(response.data?.users) && page === 1) {
        setFollowersCount(response.data.users.length);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowersClick = () => {
    setIsFollowersModalOpen(true);
    fetchFollowers();
  };

  const formatScoutData = () => {
    if (!currentProfile)
      return {
        name: "",
        profession: "",
        location: "",
        responseTime: "",
        travelLimit: "",
        certificationLevel: "",
        reviews: 0,
        followers: followersCount,
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
      const profilePhoto = mediaItems.find(
        (item: any) => item.type === "photo",
      );
      if (profilePhoto) profileImage = profilePhoto.url;
    }

    const socials = profile.socialLinks || {};
    icons[0].link = socials.linkedin || "";
    icons[1].link = socials.facebook || "";
    icons[2].link = socials.instagram || "";
    icons[3].link = socials.twitter || "";
    icons[4].link = socials.youtube || "";

    const certifications =
      profile.documents
        ?.filter((doc: any) => doc.type === "certificate")
        .map((cert: any) => cert.title) || [];

    return {
      id: profile.id || "",
      name:
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        "Scout",
      profession: profile.profession || "",
      location:
        profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : "",
      responseTime: profile.responseTime || "N/A",
      travelLimit: profile.travelLimit ? `${profile.travelLimit} kms` : "N/A",
      certificationLevel: profile.certificationLevel || "N/A",
      reviews: profile.reviews || 0,
      followers: followersCount,
      assessments: profile.assessments || "0",
      profileImage,
      about: profile.bio || "",
      skills: profile.skills || [],
      certifications,
      socials,
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile,
      reviewsReceived: profile.reviewsReceived || [],
      language: profile.language,
      club: profile.club,
    };
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      if (username) dispatch(getProfile(username));
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message || "Failed to update profile photo",
      });
    } finally {
      setIsUpdatingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scoutData = formatScoutData();

  const getMissingFields = () => {
    if (!currentProfile) return [];
    const missingFields: string[] = [];
    if (!currentProfile.photo) missingFields.push("Profile Picture");
    if (!currentProfile.bio) missingFields.push("Bio");
    if (!currentProfile.profession) missingFields.push("Profession");
    if (!currentProfile.club) missingFields.push("Club");
    if (!currentProfile.language || currentProfile.language.length === 0)
      missingFields.push("Languages");
    if (!currentProfile.city || !currentProfile.country)
      missingFields.push("Location");
    if (!currentProfile.certificationLevel)
      missingFields.push("Certification Level");
    if (!currentProfile.responseTime) missingFields.push("Response Time");
    if (!currentProfile.travelLimit) missingFields.push("Travel Limit");
    return missingFields;
  };

  const missingFields = getMissingFields();
  const isProfileIncomplete = missingFields.length > 0;

  const reviewsArray = scoutData.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        totalReviews;

  if (status === "loading" && !currentProfile) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Loading scout profile...
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center p-4">
        <div className="text-center text-red-600 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg max-w-md">
          <p className="text-sm sm:text-base">Error loading profile: {error}</p>
          <button
            onClick={() => {
              const username = localStorage.getItem("username");
              if (username) dispatch(getProfile(username));
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
      <main className="flex-1 p-3 sm:p-4 md:p-6 dark:bg-gray-900 ml-0 sm:ml-15">
        {/* Profile Incomplete Notice */}
        {isProfileIncomplete && showIncompleteNotice && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 relative">
            <button
              onClick={() => setShowIncompleteNotice(false)}
              className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 p-1"
              aria-label="Dismiss notice"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-amber-600 mt-1 flex-shrink-0"
              />
              <div className="flex-1 pr-6">
                <h3 className="font-semibold text-amber-800 mb-1">
                  Profile Incomplete
                </h3>
                <p className="text-sm text-amber-700 mb-2">
                  Complete your profile to increase visibility. The following
                  fields are missing:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingFields.map((field, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded"
                    >
                      {field}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/scout/details-form")}
                  className="mt-3 inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start w-full p-2 sm:p-4 mx-auto gap-4 lg:gap-6">
          {/* Left - Scout Info */}
          <div className="flex-1 w-full lg:pr-6">
            <div className="flex flex-wrap items-center mb-4 sm:mb-6 gap-x-4 gap-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white min-w-0 break-words">
                {scoutData.name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 flex-wrap">
                {icons.map((item, index) => {
                  const bg =
                    item.icon === faInstagram
                      ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                      : item.color;
                  const baseClass =
                    "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full text-white text-sm sm:text-base lg:text-xl shadow-lg";
                  return item.link ? (
                    <a
                      key={index}
                      href={
                        item.link.startsWith("http")
                          ? item.link
                          : `https://${item.link.replace(/^\/+/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={baseClass}
                      style={{ background: bg }}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                    </a>
                  ) : (
                    <span
                      key={index}
                      className={`${baseClass} opacity-25 cursor-default`}
                      style={{ background: bg }}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                  );
                })}
              </div>
              <ViewCvButton
                role="scout"
                username={localStorage.getItem("username")}
                className="ml-auto"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Profession
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.profession || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Club
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.club || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Languages
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.language?.length > 0
                    ? scoutData.language.slice(0, 3).join(", ")
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Location
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.location || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Certification Level
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.certificationLevel || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Response Time
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.responseTime || "N/A"} mins
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                  Travel Limit
                </p>
                <p className="font-semibold dark:text-white text-sm sm:text-base">
                  {scoutData.travelLimit.replace("kms", " ")}kms
                </p>
              </div>
            </div>
          </div>

          {/* Right - Profile Picture */}
          <div className="w-full sm:w-80 h-48 sm:h-60 lg:w-80 lg:h-60 bg-gray-200 rounded-lg overflow-hidden shadow-md relative group flex-shrink-0">
            <img
              src={scoutData.profileImage || avatar}
              alt="Scout"
              className="w-full h-full object-cover"
            />
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
                  {scoutData.profileImage ? "Change Photo" : "Add Photo"}
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
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
                <div className="overflow-y-auto max-h-96">
                  <FollowList
                    followers={followers}
                    loading={loadingFollowers}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 sm:mt-8">
          <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
            {(
              [
                "details",
                "services",
                "media",
                "reviews",
                "account",
                "businessCard",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm sm:text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "text-red-600 border-red-600"
                    : "border-transparent text-gray-600 dark:text-white hover:text-red-600"
                }`}
              >
                {tab === "businessCard" ? "Business Card" : tab}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {activeTab === "details" && (
              <ExpertDetails expertData={scoutData} />
            )}
            {activeTab === "services" && <ScoutServices />}
            {activeTab === "media" && <Mediaedit Data={scoutData} />}
            {activeTab === "reviews" && <Reviewnoedit Data={scoutData} />}
            {activeTab === "account" && <Settings />}
            {activeTab === "businessCard" && (
              <BusinessCard expertData={scoutData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScoutProfile;
