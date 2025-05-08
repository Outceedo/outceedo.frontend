import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faStar, faCamera, faSpinner } from "@fortawesome/free-solid-svg-icons";
import ExpertDetails from "./Expertdetails";
import ExpertReviews from "./Expertreviews";
import ExpertServices from "./Expertservices";
import ExpertMedia from "./expertmedia";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile, updateProfilePhoto } from "../store/profile-slice";
import Swal from "sweetalert2";
import avatar from "../assets/images/avatar.png";
import { useNavigate } from "react-router-dom";
import { profile } from "console";

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "" },
  { icon: faFacebook, color: "#3b5998", link: "" },
  { icon: faInstagram, color: "#E1306C", link: "" },
  { icon: faXTwitter, color: "#1DA1F2", link: "" },
];

const ExpertProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Get profile state from Redux store
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

  // Fetch profile data on component mount
  useEffect(() => {
    // Get username from localStorage
    const username = localStorage.getItem("username");
    console.log("Expert username:", username);
    if (username) {
      // Dispatch the getProfile action with the username
      dispatch(getProfile(username));
    }
  }, [dispatch]);
  useEffect(() => {
    // Set a 2-second delay before executing navigation logic
    const navigationTimer = setTimeout(() => {
      // Only proceed with navigation if user is logged in and not already redirecting
      const userRole = localStorage.getItem("role");

      // Check if required profile fields are missing
      const isProfileIncomplete =
        !currentProfile?.age ||
        !currentProfile?.gender ||
        !currentProfile?.height ||
        !currentProfile?.weight;

      console.log("Profile check - isProfileIncomplete:", isProfileIncomplete);
      console.log("Missing fields:", {
        age: !currentProfile?.age,
        gender: !currentProfile?.gender,
        height: !currentProfile?.height,
        weight: !currentProfile?.weight,
      });

      if (isProfileIncomplete) {
        console.log("Profile is incomplete, redirecting to details form");
        navigate("/details-form");
      } else {
        if (userRole === "player") {
          console.log("Redirecting to player profile");
          navigate("/player/profile");
        } else if (userRole === "expert") {
          console.log("Redirecting to expert profile");
          navigate("/expert/profile");
        } else {
          // Fallback if role is not recognized
          console.log("Role not recognized, redirecting to details form");
          navigate("/expert/details-form");
        }
      }
    }, 4000); // 2000 milliseconds = 2 seconds

    // Cleanup function to clear the timeout if component unmounts before timeout completes
    return () => clearTimeout(navigationTimer);
  }, [navigate, currentProfile]);

  // Format the expert data from API response
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
        followers: 0,
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
        reviewsReceived: {},
      };

    const profile = currentProfile;
    console.log("Expert profile data:", profile);

    // Get media items (photos/videos)
    const mediaItems = profile.uploads || [];

    // Get profile photo
    let profileImage = "";
    if (profile.photo) {
      profileImage = profile.photo;
    } else if (mediaItems.length > 0) {
      const profilePhoto = mediaItems.find((item) => item.type === "photo");
      if (profilePhoto) {
        profileImage = profilePhoto.url;
      }
    }

    // Get social links
    const socials = profile.socialLinks || {};

    // Generate icon links
    icons[0].link = socials.linkedin || "";
    icons[1].link = socials.facebook || "";
    icons[2].link = socials.instagram || "";
    icons[3].link = socials.twitter || "";

    // Get certifications
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
      followers: profile.followers || 0,
      assessments: profile.assessments || "0",
      profileImage: profileImage,
      about: profile.bio || "",
      skills: profile.skills || [],
      certifications: certifications,
      socials: socials,
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile,
      reviewsReceived: profile.reviewsReceived,

      // Include raw profile for passing to child components
    };
  };

  // Handle profile photo click to open file selector
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Handle profile photo change
  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size and type before uploading
    if (file.size > 1 * 1024 * 1024) {
      // 1MB limit (changed from 5MB)
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
      // Dispatch action to update profile photo
      await dispatch(updateProfilePhoto(file)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile photo updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh profile data
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

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  // Get the formatted expert data
  const expertData = formatExpertData();
  console.log("expert data im sending to review is");
  console.log(expertData);

  // Show loading state
  if (status === "loading" && !currentProfile) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading expert profile...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === "failed" && error) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center text-red-600 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">
          <p>Error loading profile: {error}</p>
          <button
            onClick={() => {
              const username = localStorage.getItem("username");
              if (username) {
                dispatch(getProfile(username));
              }
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex -mt-5">
      {/* Main Content */}
      <main className="flex-1 p-6 dark:bg-gray-900 ml-15">
        <div className="flex justify-between items-center w-full p-4 mx-auto bg-dark:bg-slate-700 ">
          {/* Left - Expert Name */}
          <div>
            <div className="flex gap-10">
              <h1 className="text-4xl font-bold dark:text-white">
                {expertData.name}
              </h1>

              <div className="gap-4 ml-32 flex">
                {icons.map((item, index) =>
                  item.link ? (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl shadow-lg"
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

            {/* Expert Info */}
            <div className="flex justify-start gap-40 text-center mt-8">
              <div className="text-left">
                <p className="text-gray-500 dark:text-white">Profession</p>
                <p className="font-semibold dark:text-white">
                  {expertData.profession || "Not specified"}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-500 dark:text-white ">Location</p>
                <p className="font-semibold dark:text-white">
                  {expertData.location || "Not specified"}
                </p>
              </div>
            </div>
            {/* Additional Information */}
            <div className="flex justify-start gap-40 mt-6 text-center">
              <div className="text-left">
                <p className="text-gray-500 dark:text-white">Response Time</p>
                <p className="font-semibold dark:text-white">
                  {expertData.responseTime}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-500 dark:text-white">Travel Limit</p>
                <p className="font-semibold dark:text-white">
                  {expertData.travelLimit}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-500 dark:text-white">
                  Certification Level
                </p>
                <p className="font-semibold dark:text-white">
                  {expertData.certificationLevel}
                </p>
              </div>
            </div>
          </div>
          {/* Right - Profile Picture in a Rectangle with Update Functionality */}
          <div className="w-80 h-60 bg-gray-200 rounded-lg overflow-hidden mr-20 shadow-md relative group">
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
                <FontAwesomeIcon icon={faCamera} size="2x" className="mb-2" />
                <p className="text-sm font-medium">
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
                    size="2x"
                    className="mb-2"
                  />
                  <p className="mt-2 text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="border-t border-b py-6 mt-6 text-center">
          <div className="flex justify-around">
            <div className="flex items-center gap-x-2">
              <p className="text-yellow-300 text-3xl">
                {/* Render 5 stars */}
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </p>
              <p className="text-gray-500 dark:text-white">
                {expertData.reviews} reviews
              </p>
            </div>
            <div>
              <p className="text-red-500 text-3xl font-bold">
                {expertData.followers}
              </p>
              <p className="text-gray-500 dark:text-white">Followers</p>
            </div>
            <div>
              <p className="text-red-500 text-3xl font-bold">
                {expertData.assessments}
              </p>
              <p className="text-gray-500 dark:text-white">
                Assessments Evaluated
              </p>
            </div>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="mt-8">
          <div className="flex gap-4 border-b ">
            {(["details", "media", "reviews", "services"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
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
            {activeTab === "media" && <ExpertMedia expertData={expertData} />}
            {activeTab === "reviews" && (
              <ExpertReviews expertData={expertData} />
            )}
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
