import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";
import {
  faCamera,
  faVideo,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Swal from "sweetalert2";
import Sponsor2 from "../assets/images/sponsor2.jpg";

interface UploadItem {
  id: string | number;
  title: string;
  file?: File | null;
  preview?: string | null;
  type: "photo" | "video";
  url?: string;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

const SponsorInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");
  const [mediaTab, setMediaTab] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sponsordata = {
    name: "Company/Individual Name",
    sportInterest: "Football",
    country: "England",
    city: "London",
    sponsorType: "CompanyName",
    companySite: "www.company_site.com",
    image: Sponsor2,
    socialLinks: {
      instagram: "",
      linkedin: "",
      facebook: "",
      twitter: "",
    },
  };

  const icons = [
    {
      icon: faInstagram,
      link: sponsordata.socialLinks.instagram,
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    },
    {
      icon: faLinkedinIn,
      link: sponsordata.socialLinks.linkedin,
      bg: "bg-blue-700",
    },
    {
      icon: faFacebookF,
      link: sponsordata.socialLinks.facebook,
      bg: "bg-blue-600",
    },
    {
      icon: faXTwitter,
      link: sponsordata.socialLinks.twitter,
      bg: "bg-black",
    },
  ];

  const aboutMe = "We are a top-tier sponsor with global outreach in football development, aiming to support young talent worldwide.";
  const sponsorshipInfo = {
    range: "$10,000 - $100,000",
    type: "Monetary & Equipment",
    country: "Worldwide",
  };

  const getAuthToken = (): string | null => localStorage.getItem("token");

  useEffect(() => {
    fetchMediaFromAPI();
  }, []);

  const fetchMediaFromAPI = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const username = localStorage.getItem("username");

      if (!token || !username) {
        const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
        setMedia(savedMedia);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/user/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const mediaItems: UploadItem[] = response.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title || "Untitled",
          preview: item.url,
          url: item.url,
          type: item.type === "video" ? "video" : "photo",
        }));
        setMedia(mediaItems);
      }
    } catch (error) {
      const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
      setMedia(savedMedia);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedia =
    mediaTab === "All"
      ? media
      : media.filter((item) =>
          mediaTab === "Photos" ? item.type === "photo" : item.type === "video"
        );

  const handleDeleteSingle = async (id: string | number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this media item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3b5998",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getAuthToken();
          if (token) {
            await axios.delete(`${API_BASE_URL}/user/media/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          const updated = media.filter((item) => item.id !== id);
          setMedia(updated);
          setSelectedMedia(selectedMedia.filter((mid) => mid !== id));
          localStorage.setItem("savedMedia", JSON.stringify(updated));

          Swal.fire("Deleted!", "The media item has been removed.", "success");
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Failed to delete the media item.",
          });
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen dark:bg-gray-900 p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5">
        <div>
          <h1 className="text-2xl font-bold">{sponsordata.name}</h1>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-4 gap-30 text-sm text-gray-600">
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sports Interest
              </label>
              <span className="font-semibold dark:text-white">
                {sponsordata.sportInterest}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Country
              </label>
              <span className="font-semibold dark:text-white">
                {sponsordata.country}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                City
              </label>
              <span className="font-semibold dark:text-white">
                {sponsordata.city}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sponsor Type
              </label>
              <span className="font-semibold dark:text-white">
                {sponsordata.sponsorType}
              </span>
            </div>
          </div>

          <div className="mt-10 flex gap-6">
            {icons.map(({ icon, link, bg }, index) => (
              <a key={index} href={link || "#"} target="_blank" rel="noopener noreferrer">
                <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${bg}`}>
                  <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10">
            <label className="block text-sm text-gray-500 dark:text-white mb-1">
              Company Site
            </label>
            <Link
              to={`https://${sponsordata.companySite}`}
              className="font-light text-blue-500 dark:text-white"
              target="_blank"
            >
              {sponsordata.companySite}
            </Link>
          </div>
        </div>

        <div className="rounded-md overflow-hidden mt-10 md:mt-0">
          <img
            src={sponsordata.image}
            alt="Sponsor"
            width={350}
            height={350}
            className="rounded-md object-cover"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 border-b">
          {["details", "media"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "details" | "media")}
              className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                activeTab === tab
                  ? "text-red-600 border-red-600"
                  : "border-transparent text-gray-600 hover:text-red-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "details" && (
          <div className="p-4 w-full space-y-6">
            <Card className="p-6 shadow-sm dark:bg-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About Me
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{aboutMe}</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 shadow-sm dark:bg-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Sponsorship
                </h3>
                <p>
                  <span className="font-medium">Range:</span> {sponsorshipInfo.range}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {sponsorshipInfo.type}
                </p>
                <p>
                  <span className="font-medium">Country Preferred:</span> {sponsorshipInfo.country}
                </p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="flex space-x-4 p-4">
                  {[{ name: "All", icon: null }, { name: "Photos", icon: faCamera }, { name: "Videos", icon: faVideo }].map((tab) => (
                    <button
                      key={tab.name}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                        mediaTab === tab.name
                          ? "bg-yellow-200 dark:bg-yellow-400 font-semibold"
                          : "bg-transparent text-gray-600 hover:text-black dark:text-gray-300"
                      }`}
                      onClick={() => setMediaTab(tab.name)}
                    >
                      {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
                      {tab.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  {filteredMedia.length === 0 ? (
                    <p className="text-gray-400 text-center col-span-3">No Media Available</p>
                  ) : (
                    filteredMedia.map((item) => (
                      <div key={item.id} className="relative bg-white dark:bg-gray-700 shadow rounded-md overflow-hidden">
                        {item.type === "photo" ? (
                          <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
                        ) : (
                          <video controls className="w-full h-48 object-cover">
                            <source src={item.url} />
                          </video>
                        )}
                        <div className="p-2 flex justify-between items-center">
                          <p className="text-sm font-semibold dark:text-white truncate">{item.title}</p>
                          <Button variant="ghost" onClick={() => handleDeleteSingle(item.id)}>
                            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorInfo;
