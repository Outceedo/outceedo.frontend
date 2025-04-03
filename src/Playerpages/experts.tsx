import React, { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faImage, faVideo, faCamera } from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import profile2 from "../assets/images/profile2.jpg";

interface MediaItem {
  id: number;
  type: "photo" | "video";
  url: string;
  src: string;
  title: string;
}

interface Review {
  id: number;
  name: string;
  date: string;
  comment: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
}

const Experts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Profile data
  const profileData = {
    name: localStorage.getItem("expertName") || "Expert Name",
    profession:
      localStorage.getItem("expertProfession") ||
      "Coach & Ex-Soccer Player Defender",
    location: localStorage.getItem("expertLocation") || "London, UK",
    responseTime: localStorage.getItem("expertResponseTime") || "40 mins",
    travelLimit: localStorage.getItem("expertTravelLimit") || "30 kms",
    certificationLevel:
      localStorage.getItem("expertCertificationLevel") || "3rd highest",
    language: localStorage.getItem("expertLanguage") || "English, Spanish",
    profileImage: profile2,
    reviews: 120,
    followers: 110,
    assessments: "100+",
  };

  // Social links
  const socialLinks = [
    {
      icon: <FontAwesomeIcon icon={faLinkedin} />,
      link: localStorage.getItem("expertLinkedIn") || "#",
      platform: "LinkedIn",
    },
    {
      icon: <FontAwesomeIcon icon={faInstagram} />,
      link: localStorage.getItem("expertInstagram") || "#",
      platform: "Instagram",
    },
    {
      icon: <FontAwesomeIcon icon={faFacebook} />,
      link: localStorage.getItem("expertFacebook") || "#",
      platform: "Facebook",
    },
    {
      icon: <FontAwesomeIcon icon={faTwitter} />,
      link: localStorage.getItem("expertTwitter") || "#",
      platform: "Twitter",
    },
  ];

  // Format URL to ensure it has http/https
  const formatUrl = (url: string): string => {
    if (url === "#") return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // About Me data
  const aboutMe =
    localStorage.getItem("aboutMe") ||
    "I am from London, UK. A passionate, versatile expert bringing years of experience to help players improve their skills and reach their potential.";

  // Skills data
  const skills = JSON.parse(
    localStorage.getItem("expertSkills") ||
      JSON.stringify([
        "Leadership",
        "Tactical Analysis",
        "Team Management",
        "Fitness Training",
      ])
  );

  // Sample media data
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: 1,
      type: "photo",
      url: "/photo1.jpg",
      src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500",
      title: "Training Session",
    },
    {
      id: 2,
      type: "photo",
      url: "/photo2.jpg",
      src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=500",
      title: "Team Building",
    },
    {
      id: 3,
      type: "video",
      url: "/video1.mp4",
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Coaching Tips",
    },
  ]);

  // Filter state for media
  const [mediaFilter, setMediaFilter] = useState<"All" | "Photos" | "Videos">(
    "All"
  );

  // Filtered media based on selection
  const filteredMedia =
    mediaFilter === "All"
      ? mediaItems
      : mediaItems.filter((item) =>
          mediaFilter === "Photos"
            ? item.type === "photo"
            : item.type === "video"
        );

  // Sample Services Data
  const services = JSON.parse(
    localStorage.getItem("expertServices") ||
      JSON.stringify([
        {
          id: 1,
          name: "Online Video Assessment",
          description: "Video Assessment. Report.",
          price: "$50/h",
        },
        {
          id: 2,
          name: "On-Field Assessment",
          description: "Live Assessment. Report",
          price: "$30/h",
        },
        {
          id: 3,
          name: "1-1 Training",
          description: "1 on 1 advise. doubts",
          price: "$80/h",
        },
      ])
  );

  // Book service function
  const handleBookService = (service: Service) => {
    setSelectedService(service);
  };

  // Sample reviews data
  const reviews: Review[] = [
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
    {
      id: 4,
      name: "Emily Davis",
      date: "2024-01-20",
      comment: "Exceptional coaching skills and very attentive to detail.",
    },
    {
      id: 5,
      name: "Robert Wilson",
      date: "2024-01-15",
      comment:
        "My son has improved tremendously under the guidance. Great expert!",
    },
  ];

  return (
    <div className="flex w-full min-h-screen dark:bg-gray-900">
      <div className="flex-1 p-4">
        <div className="ml-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4 relative">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profileData.profileImage}
                alt={`${profileData.name}'s profile`}
                className="rounded-lg w-60 h-60 object-cover shadow-md"
              />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col mt-5 w-full gap-4">
              <Card className="p-6 shadow-sm dark:bg-gray-700">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {profileData.name}
                  </h2>
                  <div className="flex flex-wrap gap-8 text-gray-600 mt-2 dark:text-gray-300">
                    <span>{profileData.profession}</span>
                    <span>{profileData.location}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Response Time
                      </p>
                      <p className="font-medium dark:text-white">
                        {profileData.responseTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Travel Limit
                      </p>
                      <p className="font-medium dark:text-white">
                        {profileData.travelLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Certification
                      </p>
                      <p className="font-medium dark:text-white">
                        {profileData.certificationLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Languages
                      </p>
                      <p className="font-medium dark:text-white">
                        {profileData.language}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Card */}
              <Card className="p-4 shadow-sm dark:bg-gray-700">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-yellow-500 text-lg">⭐⭐⭐⭐⭐</p>
                    <p className="font-medium dark:text-white">
                      {profileData.reviews} reviews
                    </p>
                  </div>
                  <div>
                    <p className="text-red-600 text-lg font-semibold">
                      {profileData.followers}
                    </p>
                    <p className="font-medium dark:text-white">Followers</p>
                  </div>
                  <div>
                    <p className="text-red-600 text-lg font-semibold">
                      {profileData.assessments}
                    </p>
                    <p className="font-medium dark:text-white">Assessments</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-4 border-b pb-2">
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
              {/* Details Content */}
              {activeTab === "details" && (
                <div className="p-4 w-full space-y-6">
                  {/* About Me Section */}
                  <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About Me
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {aboutMe}
                    </p>
                  </Card>

                  {/* Skills & Socials in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills Section */}
                    <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </Card>

                    {/* Social Media Links */}
                    <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Social Media
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {socialLinks.map((social, index) =>
                          social.link && social.link !== "#" ? (
                            <a
                              key={index}
                              href={formatUrl(social.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                            >
                              <div
                                className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 group-hover:bg-opacity-80 ${
                                  index === 0
                                    ? "bg-blue-50 dark:bg-blue-900/20" // LinkedIn
                                    : index === 1
                                    ? "bg-pink-50 dark:bg-pink-900/20" // Instagram
                                    : index === 2
                                    ? "bg-blue-50 dark:bg-blue-900/20" // Facebook
                                    : "bg-blue-50 dark:bg-blue-900/20" // Twitter
                                }`}
                              >
                                <span
                                  className={`text-2xl ${
                                    index === 0
                                      ? "text-blue-600" // LinkedIn
                                      : index === 1
                                      ? "text-pink-600" // Instagram
                                      : index === 2
                                      ? "text-blue-800" // Facebook
                                      : "text-blue-500" // Twitter
                                  }`}
                                >
                                  {social.icon}
                                </span>
                              </div>
                              <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                                {index === 0
                                  ? "LinkedIn"
                                  : index === 1
                                  ? "Instagram"
                                  : index === 2
                                  ? "Facebook"
                                  : "Twitter"}
                              </span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Media Content */}
              {activeTab === "media" && (
                <div className="p-4 w-full space-y-6">
                  <Card className="p-6 shadow-sm dark:bg-gray-700">
                    {/* Tabs and Upload Button */}
                    <div className="flex flex-wrap justify-between items-center mb-6">
                      <div className="flex space-x-4">
                        {[
                          { name: "All", icon: null },
                          { name: "Photos", icon: faImage },
                          { name: "Videos", icon: faVideo },
                        ].map((tab) => (
                          <Button
                            key={tab.name}
                            variant={
                              mediaFilter === tab.name ? "default" : "outline"
                            }
                            className={`${
                              mediaFilter === tab.name
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : ""
                            }`}
                            onClick={() =>
                              setMediaFilter(
                                tab.name as "All" | "Photos" | "Videos"
                              )
                            }
                          >
                            {tab.icon && (
                              <FontAwesomeIcon
                                icon={tab.icon}
                                className="mr-2"
                              />
                            )}
                            {tab.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Media Content */}
                    {filteredMedia.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <FontAwesomeIcon
                          icon={mediaFilter === "Videos" ? faVideo : faImage}
                          className="text-4xl text-gray-400 mb-3"
                        />
                        <p className="text-gray-500 dark:text-gray-400">
                          No{" "}
                          {mediaFilter === "All"
                            ? "media"
                            : mediaFilter.toLowerCase()}{" "}
                          available
                        </p>
                      </div>
                    ) : (
                      <>
                        {mediaFilter === "All" ? (
                          <>
                            {/* Photos Section */}
                            {mediaItems.some(
                              (item) => item.type === "photo"
                            ) && (
                              <>
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
                                  Photos
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                  {mediaItems
                                    .filter((item) => item.type === "photo")
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
                                      >
                                        <div className="h-40 overflow-hidden">
                                          <img
                                            src={item.src}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="p-3">
                                          <p className="font-medium text-gray-700 dark:text-white truncate">
                                            {item.title}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}

                            {/* Videos Section */}
                            {mediaItems.some(
                              (item) => item.type === "video"
                            ) && (
                              <>
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3 mt-6">
                                  Videos
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                  {mediaItems
                                    .filter((item) => item.type === "video")
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
                                      >
                                        <div className="h-40 overflow-hidden">
                                          <video
                                            src={item.src}
                                            controls
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="p-3">
                                          <p className="font-medium text-gray-700 dark:text-white truncate">
                                            {item.title}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredMedia.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
                              >
                                <div className="h-40 overflow-hidden">
                                  {item.type === "photo" ? (
                                    <img
                                      src={item.src}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={item.src}
                                      controls
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="font-medium text-gray-700 dark:text-white truncate">
                                    {item.title}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                </div>
              )}

              {/* Reviews Content */}
              {activeTab === "reviews" && (
                <div className="p-4 w-full space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Reviews from Players
                  </h2>

                  {reviews.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No reviews available yet
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reviews.map((review) => (
                        <Card
                          key={review.id}
                          className="p-4 shadow-sm dark:bg-gray-700"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {review.name}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {moment(review.date).fromNow()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Services Content */}
              {activeTab === "services" && (
                <div className="p-4 w-full space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Services Offered
                  </h2>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service: Service) => (
                      <Card
                        key={service.id}
                        className="shadow-md dark:bg-gray-700 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {service.name}
                            </h3>
                            <span className="text-lg text-red-600 font-semibold">
                              {service.price}
                            </span>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 mb-6">
                            {service.description}
                          </p>
                        </div>

                        <div className="px-6 pb-6">
                          <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => handleBookService(service)}
                          >
                            Book Now
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Confirmation Modal */}
          {selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-6 w-96">
                <h3 className="text-lg font-semibold mb-2">
                  Booking Confirmed: {selectedService.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {selectedService.description}
                </p>
                <p className="text-red-600 font-semibold mb-4">
                  {selectedService.price}
                </p>
                <Button
                  className="w-full"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Experts;
