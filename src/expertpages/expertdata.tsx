import { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faCheck,
  faTimes,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

import profile2 from "../assets/images/profile2.jpg";

import ExpertMedia from "./expertmedia";

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

interface SocialLink {
  icon: TSX.Element;
  link: string;
  platform: string;
}

const ExpertData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");
  const [] = useState<MediaItem[]>([]);
  const [] = useState<"all" | "photo" | "video">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
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
  });

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
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
  ]);

  const [aboutMe, setAboutMe] = useState(
    localStorage.getItem("aboutMe") ||
      "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing."
  );

  // Skills state
  const [skills, setSkills] = useState<string[]>(
    JSON.parse(
      localStorage.getItem("expertSkills") ||
        JSON.stringify([
          "Leadership",
          "Tactical Analysis",
          "Team Management",
          "Fitness Training",
        ])
    )
  );

  // Editing states
  const [isEditing, setIsEditing] = useState({
    basicInfo: false,
    aboutMe: false,
    skills: false,
    socialLinks: false,
    services: false,
  });

  // Temp editing values
  const [tempBasicInfo, setTempBasicInfo] = useState({ ...profileData });
  const [tempSkills, setTempSkills] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState("");
  const [tempSocialLinks, setTempSocialLinks] = useState<SocialLink[]>([
    ...socialLinks,
  ]);
  const [tempServices, setTempServices] = useState<Service[]>([]);

  // Sample Services Data
  const [services, setServices] = useState<Service[]>(
    JSON.parse(
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
    )
  );

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    alert(`You have booked: ${service.name}`);
  };

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      name: "John Doe",
      date: "2024-02-15", // Example date
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
      name: "Michael Smith",
      date: "2024-01-25",
      comment: "Good quality, but the waiting time was a bit long.",
    },
    {
      id: 5,
      name: "Michael Smith",
      date: "2024-01-25",
      comment: "Good quality, but the waiting time was a bit long.",
    },
  ]);

  // Profile photo change handler
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileData({
            ...profileData,
            profileImage: event.target.result as string,
          });
          // Could save to localStorage as base64, but omitted due to size concerns
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save about me
  const handleSaveAboutMe = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditing({ ...isEditing, aboutMe: false });
  };

  // Save basic info
  const handleSaveBasicInfo = () => {
    setProfileData(tempBasicInfo);
    localStorage.setItem("expertName", tempBasicInfo.name);
    localStorage.setItem("expertProfession", tempBasicInfo.profession);
    localStorage.setItem("expertLocation", tempBasicInfo.location);
    localStorage.setItem("expertResponseTime", tempBasicInfo.responseTime);
    localStorage.setItem("expertTravelLimit", tempBasicInfo.travelLimit);
    localStorage.setItem(
      "expertCertificationLevel",
      tempBasicInfo.certificationLevel
    );
    localStorage.setItem("expertLanguage", tempBasicInfo.language);
    setIsEditing({ ...isEditing, basicInfo: false });
  };

  // Cancel basic info edit
  const handleCancelBasicInfo = () => {
    setTempBasicInfo({ ...profileData });
    setIsEditing({ ...isEditing, basicInfo: false });
  };

  // Save skills
  const handleSaveSkills = () => {
    setSkills([...tempSkills]);
    localStorage.setItem("expertSkills", JSON.stringify(tempSkills));
    setIsEditing({ ...isEditing, skills: false });
  };

  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      setTempSkills([...tempSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((skill) => skill !== skillToRemove));
  };

  // Cancel skills edit
  const handleCancelSkills = () => {
    setTempSkills([...skills]);
    setIsEditing({ ...isEditing, skills: false });
  };

  // Save social links
  const handleSaveSocialLinks = () => {
    setSocialLinks([...tempSocialLinks]);
    localStorage.setItem("expertLinkedIn", tempSocialLinks[0].link);
    localStorage.setItem("expertInstagram", tempSocialLinks[1].link);
    localStorage.setItem("expertFacebook", tempSocialLinks[2].link);
    localStorage.setItem("expertTwitter", tempSocialLinks[3].link);
    setIsEditing({ ...isEditing, socialLinks: false });
  };

  // Cancel social links edit
  const handleCancelSocialLinks = () => {
    setTempSocialLinks([...socialLinks]);
    setIsEditing({ ...isEditing, socialLinks: false });
  };

  // Update social link
  const handleUpdateSocialLink = (index: number, value: string) => {
    const updatedLinks = [...tempSocialLinks];
    updatedLinks[index] = { ...updatedLinks[index], link: value };
    setTempSocialLinks(updatedLinks);
  };

  // Edit service functionality
  const startEditingService = () => {
    setTempServices([...services]);
    setIsEditing({ ...isEditing, services: true });
  };

  // Save services
  const handleSaveServices = () => {
    setServices([...tempServices]);
    localStorage.setItem("expertServices", JSON.stringify(tempServices));
    setIsEditing({ ...isEditing, services: false });
  };

  // Cancel services edit
  const handleCancelServices = () => {
    setTempServices([...services]);
    setIsEditing({ ...isEditing, services: false });
  };

  // Update service
  const handleUpdateService = (
    index: number,
    field: keyof Service,
    value: string
  ) => {
    const updatedServices = [...tempServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === "id" ? parseInt(value) : value,
    };
    setTempServices(updatedServices);
  };

  // Add new service
  const handleAddService = () => {
    const newId = Math.max(0, ...tempServices.map((s) => s.id)) + 1;
    setTempServices([
      ...tempServices,
      {
        id: newId,
        name: "New Service",
        description: "Description",
        price: "$0/h",
      },
    ]);
  };

  // Remove service
  const handleRemoveService = (serviceId: number) => {
    setTempServices(tempServices.filter((service) => service.id !== serviceId));
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <main className="flex-1 py-2 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto bg-white p-6 dark:bg-slate-800">
          <div className="flex justify-between items-center w-full dark:text-white p-4">
            {/* Left - Expert Info */}
            {isEditing.basicInfo ? (
              <div className="w-full">
                <h2 className="text-xl font-bold mb-4">
                  Edit Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.name}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Profession
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.profession}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          profession: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.location}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          location: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Response Time
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.responseTime}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          responseTime: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Travel Limit
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.travelLimit}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          travelLimit: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Certification Level
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.certificationLevel}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          certificationLevel: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Languages
                    </label>
                    <input
                      type="text"
                      value={tempBasicInfo.language}
                      onChange={(e) =>
                        setTempBasicInfo({
                          ...tempBasicInfo,
                          language: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelBasicInfo}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBasicInfo}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex justify-start gap-20">
                    <h1 className="text-2xl font-bold">{profileData.name}</h1>

                    {/* Social Media Icons - Edit Mode Toggle */}
                    {isEditing.socialLinks ? (
                      <div className="flex flex-col">
                        {tempSocialLinks.map((social, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <span className="mr-2">{social.platform}:</span>
                            <input
                              type="text"
                              value={social.link}
                              onChange={(e) =>
                                handleUpdateSocialLink(index, e.target.value)
                              }
                              className="p-1 border rounded-md text-black dark:text-white dark:bg-gray-700"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleCancelSocialLinks}
                            className="px-2 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSocialLinks}
                            className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex justify-center space-x-4 mt-3">
                          {socialLinks.map((social, index) => (
                            <a
                              key={index}
                              href={social.link}
                              className={`text-xl transition-colors duration-300 ${
                                index === 0
                                  ? "text-blue-700 hover:text-blue-900" // LinkedIn
                                  : index === 1
                                  ? "text-pink-500 hover:text-pink-700" // Instagram
                                  : index === 2
                                  ? "text-blue-600 hover:text-blue-800" // Facebook
                                  : "text-blue-400 hover:text-blue-600" // Twitter
                              }`}
                            >
                              {social.icon}
                            </a>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setTempSocialLinks([...socialLinks]);
                            setIsEditing({ ...isEditing, socialLinks: true });
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 mt-1 self-center"
                        >
                          <FontAwesomeIcon icon={faPen} className="mr-1" />
                          Edit Social Links
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setTempBasicInfo({ ...profileData });
                      setIsEditing({ ...isEditing, basicInfo: true });
                    }}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-1" />
                    Edit Profile
                  </button>
                </div>

                {/* Expert Info */}
                <div className="flex justify-start gap-20 text-center mt-6">
                  <div>
                    <p className="text-gray-500 dark:text-white">Profession</p>
                    <p className="font-semibold dark:text-white">
                      {profileData.profession}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white">Location</p>
                    <p className="font-semibold dark:text-white">
                      {profileData.location}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="flex justify-start gap-20 mt-6 text-center">
                  <div>
                    <p className="text-gray-500 dark:text-white">
                      Response Time
                    </p>
                    <p className="font-semibold dark:text-white">
                      {profileData.responseTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white">
                      Travel Limit
                    </p>
                    <p className="font-semibold dark:text-white">
                      {profileData.travelLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white">
                      Certification Level
                    </p>
                    <p className="font-semibold dark:text-white">
                      {profileData.certificationLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white">Language</p>
                    <p className="font-semibold dark:text-white">
                      {profileData.language}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Right - Profile Picture */}
            <div className="relative">
              <div className="w-60 h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <img
                  src={profileData.profileImage}
                  alt="Expert"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="absolute bottom-2 right-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <FontAwesomeIcon
                  icon={faCamera}
                  className="text-gray-600 dark:text-gray-300"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
              </label>
            </div>
          </div>

          {/* Media Tabs */}
          <div className="mt-6">
            <div className="flex space-x-6 border-b pb-2">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-2 ${
                  activeTab === "details"
                    ? "border-b-2 border-red-500 font-semibold text-red-500"
                    : "text-gray-500 dark:text-white"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`pb-2 ${
                  activeTab === "media"
                    ? "border-b-2 border-red-500 font-semibold text-red-500"
                    : "text-gray-500 dark:text-white"
                }`}
              >
                Media
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2 ${
                  activeTab === "reviews"
                    ? "border-b-2 border-red-500 font-semibold text-red-500"
                    : "text-gray-500 dark:text-white"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`pb-2 ${
                  activeTab === "services"
                    ? "border-b-2 border-red-500 font-semibold text-red-500"
                    : "text-gray-500 dark:text-white"
                }`}
              >
                Services
              </button>
            </div>

            {/* details Content */}
            {activeTab === "details" && (
              <div className="mt-8 w-full max-w-5xl mx-auto">
                {/* About Me Section */}
                <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-600 dark:text-white">
                  <h3 className="text-lg font-semibold dark:text-white">
                    About Me
                  </h3>
                  {isEditing.aboutMe ? (
                    <>
                      <textarea
                        value={aboutMe}
                        onChange={(e) => setAboutMe(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        rows={4}
                      ></textarea>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() =>
                            setIsEditing({ ...isEditing, aboutMe: false })
                          }
                          className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAboutMe}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-1" />
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {aboutMe}
                      </p>
                      <button
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 cursor-pointer"
                        onClick={() =>
                          setIsEditing({ ...isEditing, aboutMe: true })
                        }
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </>
                  )}
                </div>

                {/* Skills Section */}
                <div className="flex justify-between gap-8 w-full mt-8 ">
                  <div className="bg-white p-6 shadow-md rounded-lg w-[48%] relative dark:bg-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold dark:text-white">
                        Skills
                      </h2>
                      {!isEditing.skills && (
                        <button
                          onClick={() => {
                            setTempSkills([...skills]);
                            setIsEditing({ ...isEditing, skills: true });
                          }}
                          className="text-gray-500 dark:text-gray-300 hover:text-gray-700"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                      )}
                    </div>

                    {isEditing.skills ? (
                      <>
                        <div className="mb-4">
                          <div className="flex mb-2">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add new skill"
                              className="flex-1 p-2 border rounded-l-md dark:bg-gray-700 dark:text-white"
                            />
                            <button
                              onClick={handleAddSkill}
                              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                            >
                              Add
                            </button>
                          </div>

                          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-white">
                            {tempSkills.map((skill, index) => (
                              <li
                                key={index}
                                className="flex justify-between items-center"
                              >
                                {skill}
                                <button
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelSkills}
                            className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSkills}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <ul className="list-disc pl-4 text-gray-600 dark:text-white">
                        {skills.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {activeTab === "media" && <ExpertMedia />}

            {/* Reviews Section */}
            {activeTab === "reviews" && (
              <div className="flex justify-between gap-8 w-full mt-6 ">
                {/* If there are no reviews */}
                {reviews.length === 0 ? (
                  <p className="text-gray-400 dark:text-white">
                    No reviews yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-white w-full">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white p-4 rounded-lg shadow-md dark:bg-slate-600"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            {review.name}
                          </h3>
                          <span className="text-sm text-black dark:text-white ">
                            {moment(review.date).fromNow()}
                          </span>
                        </div>
                        <p className="text-black dark:text-white">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Services Section */}
            {activeTab === "services" && (
              <div className="w-full mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">
                    Services
                  </h2>

                  {!isEditing.services ? (
                    <button
                      onClick={startEditingService}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faPen} className="mr-1" />
                      Edit Services
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddService}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        + Add Service
                      </button>
                      <button
                        onClick={handleCancelServices}
                        className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveServices}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isEditing.services
                    ? // Editing mode for services
                      tempServices.map((service, index) => (
                        <div
                          key={service.id}
                          className="bg-white p-4 rounded-lg mb-4 w-full shadow-md dark:bg-slate-600 relative"
                        >
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 dark:text-white">
                              Service Name
                            </label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) =>
                                handleUpdateService(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 dark:text-white">
                              Description
                            </label>
                            <textarea
                              value={service.description}
                              onChange={(e) =>
                                handleUpdateService(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">
                              Price
                            </label>
                            <input
                              type="text"
                              value={service.price}
                              onChange={(e) =>
                                handleUpdateService(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      ))
                    : // Display mode for services
                      services.map((service) => (
                        <div
                          key={service.id}
                          className="bg-white p-4 rounded-lg mb-4 w-full shadow-md flex relative dark:bg-slate-600"
                        >
                          <p className="text-red-400 font-semibold absolute top-2 right-2 mt-2 dark:text-white">
                            {service.price}
                          </p>
                          <div className="">
                            <h3 className="text-lg font-semibold dark:text-white">
                              {service.name}
                            </h3>
                            <p className="text-black dark:text-white">
                              {service.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleBookService(service)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition mx-auto justify-center items-center duration-200 mt-20"
                          >
                            Book Now
                          </button>
                        </div>
                      ))}
                </div>
              </div>
            )}

            {/* Booking Confirmation */}
            {selectedService && (
              <div className="fixed top-20 bg-gray-800 p-6 rounded-lg shadow-lg text-white">
                <h3 className="text-lg font-semibold mb-2">
                  Booking Confirmed: {selectedService.name}
                </h3>
                <p className="text-gray-300">{selectedService.description}</p>
                <button
                  onClick={() => setSelectedService(null)}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpertData;
