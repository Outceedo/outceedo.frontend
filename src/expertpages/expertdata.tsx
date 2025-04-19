import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import profile2 from "../assets/images/profile2.jpg";
import ExpertDetails from "./Expertdetails";
import ExpertReviews from "./Expertreviews";
import ExpertServices from "./Expertservices";
import ExpertMedia from "./expertmedia";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";
import Swal from "sweetalert2";

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "" },
  { icon: faFacebook, color: "#3b5998", link: "" },
  { icon: faInstagram, color: "#E1306C", link: "" },
  { icon: faTwitter, color: "#1DA1F2", link: "" },
];

// Fallback expert data if profile not loaded
const fallbackExpertData = {
  name: "Expert Name",
  profession: "Coach & Ex-Soccer Player Defender",
  location: "London, UK",
  responseTime: "40 mins",
  travelLimit: "30 kms",
  certificationLevel: "3rd highest",
  reviews: 120,
  followers: 110,
  assessments: "100+",
  profileImage: profile2,
  backgroundImage: "/background-image.jpg",
  media: [],
  about:
    "Experienced soccer coach with a strong background in player development and strategy.",
  skills: [
    "Leadership",
    "Tactical Analysis",
    "Team Management",
    "Fitness Training",
  ],
  certifications: [
    "UEFA Pro License",
    "FIFA Coaching Diploma",
    "Sports Science Certification",
  ],
  socials: {
    linkedin: "https://linkedin.com",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
  },
};

const ExpertProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");
  const dispatch = useAppDispatch();

  // Get profile state from Redux store
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );

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

  // Format the expert data from API response
  const formatExpertData = () => {
    if (!viewedProfile) return fallbackExpertData;

    const profile = viewedProfile;
    console.log("Expert profile data:", profile);

    // Get media items (photos/videos)
    const mediaItems = profile.uploads || [];

    // Get profile photo
    let profileImage = fallbackExpertData.profileImage;
    if (profile.photo) {
      profileImage = profile.photo;
    } else if (mediaItems.length > 0) {
      const profilePhoto = mediaItems.find((item) => item.type === "photo");
      if (profilePhoto) {
        profileImage = profilePhoto.url;
      }
    }

    // Get social links
    const socials = profile.socialLinks || fallbackExpertData.socials;

    // Generate icon links
    icons[0].link = socials.linkedin || "";
    icons[1].link = socials.facebook || "";
    icons[2].link = socials.instagram || "";
    icons[3].link = socials.twitter || "";

    // Get certifications
    const certifications =
      profile.documents
        ?.filter((doc) => doc.type === "certificate")
        .map((cert) => cert.title) || fallbackExpertData.certifications;

    return {
      id: profile.id || fallbackExpertData.id,
      name:
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        fallbackExpertData.name,
      profession: profile.profession || fallbackExpertData.profession,
      location:
        profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : fallbackExpertData.location,
      responseTime: profile.responseTime || fallbackExpertData.responseTime,
      travelLimit: profile.travelLimit
        ? `${profile.travelLimit} kms`
        : fallbackExpertData.travelLimit,
      certificationLevel:
        profile.certificationLevel || fallbackExpertData.certificationLevel,
      reviews: profile.reviews || fallbackExpertData.reviews,
      followers: profile.followers || fallbackExpertData.followers,
      assessments: profile.assessments || fallbackExpertData.assessments,
      profileImage: profileImage,
      about: profile.bio || fallbackExpertData.about,
      skills: profile.skills || fallbackExpertData.skills,
      certifications: certifications,
      socials: socials,
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile, // Include raw profile for passing to child components
    };
  };

  // Get the formatted expert data
  const expertData = formatExpertData();

  // Show loading state
  if (status === "loading" && !viewedProfile) {
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
                  {expertData.profession}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-500 dark:text-white ">Location</p>
                <p className="font-semibold dark:text-white">
                  {expertData.location}
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
          {/* Right - Profile Picture in a Rectangle */}
          <div className="w-80 h-60 bg-gray-200 rounded-lg overflow-hidden mr-20 shadow-md">
            <img
              src={expertData.profileImage}
              alt="Expert"
              className="w-full h-full object-cover"
            />
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
              <ExpertReviews expertId={expertData.id} />
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
