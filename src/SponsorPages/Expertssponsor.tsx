import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import profile from "../assets/images/avatar.png";

import { faStar, faCamera, faVideo } from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";
import { MoveLeft } from "lucide-react";
import Expertreviews from "./expertreviews";

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

type TabType = "details" | "media" | "reviews" | "services";

const SponsorExperts = () => {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const tabs: TabType[] = ["details", "media", "reviews"];
  const [readMore, setReadMore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">(
    "all"
  );
  // Certificate preview state
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isCertificatePreviewOpen, setIsCertificatePreviewOpen] =
    useState(false);

  // Redux state
  const dispatch = useAppDispatch();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

  // Fetch expert profile on component mount
  useEffect(() => {
    const expertUsername = localStorage.getItem("viewexpertusername");
    if (expertUsername) {
      dispatch(getProfile(expertUsername));
    } else {
      console.error("No expert username found in localStorage");
    }
  }, [dispatch]);

  // Get certificates from documents
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
        services: viewedProfile.services || [],
        reviewsReceived: viewedProfile.reviewsReceived,
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
        services: [],
      };
  localStorage.setItem("expertid", expertData?.id);
  localStorage.setItem("serviceid", expertData?.services.id);

  // Determine if text should be clamped
  const shouldClamp = expertData.about?.split(" ").length > 25;

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
    "1": "ONLINE ASSESSMENT",
    "2": "ONLINE TRAINING",
    "3": "ON GROUND ASSESSMENT",
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

  const handlebook = (service: Service) => {
    // Save service details to localStorage
    localStorage.setItem(
      "selectedService",
      JSON.stringify({
        expertname: expertData.name, // Add expert name
        expertProfileImage: expertData.profileImage,
        serviceid: service.id, // Add expert profile image
        name: service.name,
        description: service.description,
        price: service.price,
      })
    );

    // Navigate to the BookService page
    navigate("/player/book");
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
              <p className="text-gray-500">Location</p>
              <p className="font-semibold dark:text-white">
                {expertData.location}
              </p>
            </div>
            <div className="md:col-span-1"></div>{" "}
            {/* Empty column for proper alignment */}
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
            <div>
              <p className="text-gray-500">Certification Level</p>
              <p className="font-semibold dark:text-white">
                {expertData.certificationLevel}
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
              <p
                className={cn(
                  "text-gray-700 dark:text-gray-300",
                  !readMore && shouldClamp && "line-clamp-2"
                )}
              >
                {expertData.about}
              </p>
              {shouldClamp && (
                <Button
                  variant="link"
                  className="p-0 text-blue-600 hover:underline mt-2"
                  onClick={() => setReadMore(!readMore)}
                >
                  {readMore ? "Show less" : "Read more"}
                </Button>
              )}
            </Card>

            {/* Skills Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Section */}
              <Card className="p-6 relative">
                <div className="flex justify-between items-center mb-4">
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

              {/* Certifications Section */}
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
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <div>
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => setMediaFilter("all")}
                className={`px-4 py-2 rounded-md ${
                  mediaFilter === "all"
                    ? "bg-blue-200 text-blue-600"
                    : "hover:bg-blue-200"
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMediaFilter("photo")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md hover:text-blue-600 ${
                  mediaFilter === "photo"
                    ? "bg-blue-200 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon icon={faCamera} />
                Photos
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMediaFilter("video")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md hover:text-blue-600 ${
                  mediaFilter === "video"
                    ? "bg-blue-200 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon icon={faVideo} />
                Videos
              </Button>
            </div>

            {/* Media Content */}
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FontAwesomeIcon
                  icon={mediaFilter === "video" ? faVideo : faCamera}
                  className="text-4xl text-gray-400 mb-3"
                />
                <p className="text-gray-500">
                  No{" "}
                  {mediaFilter === "all"
                    ? "media"
                    : mediaFilter === "photo"
                    ? "photos"
                    : "videos"}{" "}
                  available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="h-48 overflow-hidden">
                      {item.type === "photo" ? (
                        <img
                          src={item.src}
                          alt={item.title}
                          onClick={() => {
                            setSelectedMedia(item);
                            setIsPreviewOpen(true);
                          }}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                      ) : (
                        <video
                          src={item.src}
                          controls
                          className="w-full h-full object-cover"
                          onClick={() => {
                            setSelectedMedia(item);
                            setIsPreviewOpen(true);
                          }}
                        />
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-medium text-gray-800 dark:text-white truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <Expertreviews expertData={expertData} isExpertView={false} />
        )}

        {/* Services Tab */}
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
    </div>
  );
};

export default SponsorExperts;
