import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faVideo,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Swal from "sweetalert2";
import MediaUpload from "./Mediaupload";

interface UploadItem {
  id: string | number;
  title: string;
  file?: File | null;
  preview?: string | null;
  type: "photo" | "video";
  url?: string;
}

interface MediaeditProps {
  Data?: any;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

const Mediaedit: React.FC<MediaeditProps> = ({ Data }) => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    // Check if Data with uploads is available
    if (
      Data &&
      Data.uploads &&
      Array.isArray(Data.uploads) &&
      Data.uploads.length > 0
    ) {
      console.log("Using media from Data:", Data.uploads);

      // Transform uploads to match our UploadItem format
      const mediaItems: UploadItem[] = Data.uploads.map((item: any) => ({
        id: item.id || item._id,
        title: item.title || "Untitled",
        preview: item.url,
        url: item.url,
        type: item.type === "video" ? "video" : "photo",
      }));

      setMedia(mediaItems);
      setIsLoading(false);
    } else {
      // Fetch from API if no Data uploads
      fetchMediaFromAPI();
    }
  }, [Data]);

  // Separate function to fetch media from API
  const fetchMediaFromAPI = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const username = localStorage.getItem("username");

      if (!token || !username) {
        console.error("No auth token or username found");
        // Use local storage as fallback if API access not available
        const savedMedia = JSON.parse(
          localStorage.getItem("savedMedia") || "[]"
        );
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
        // Transform API response to match our UploadItem format
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
      console.error("Error fetching media:", error);

      // Use local storage as fallback if API fails
      const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
      setMedia(savedMedia);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpdate = () => {
    // Refresh media from API after upload
    fetchMediaFromAPI();
  };

  const filteredMedia =
    activeTab === "All"
      ? media
      : media.filter((item) =>
          activeTab === "Photos" ? item.type === "photo" : item.type === "video"
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
            // Delete from API if we have a token
            await axios.delete(`${API_BASE_URL}/user/media/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          // Update local state
          const updated = media.filter((item) => item.id !== id);
          setMedia(updated);
          setSelectedMedia(selectedMedia.filter((mid) => mid !== id));

          // Update localStorage as backup
          localStorage.setItem("savedMedia", JSON.stringify(updated));

          Swal.fire("Deleted!", "The media item has been removed.", "success");
        } catch (error) {
          console.error("Error deleting media:", error);

          // Show error message
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Failed to delete the media item.",
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full -ml-4 -mt-4">
      {/* Top Tabs & Upload */}
      <div className="flex space-x-4 p-4">
        {[
          { name: "All", icon: null },
          { name: "Photos", icon: faCamera },
          { name: "Videos", icon: faVideo },
        ].map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === tab.name
                ? "bg-yellow-200 dark:bg-yellow-400 font-semibold"
                : "bg-transparent text-gray-600 hover:text-black dark:text-gray-300"
            }`}
            onClick={() =>
              setActiveTab(tab.name as "All" | "Photos" | "Videos")
            }
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
            {tab.name}
          </button>
        ))}

        <div className="flex justify-end w-full">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FE221E] hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUpload} />
            Upload
          </Button>
        </div>
      </div>

      {/* Media Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {filteredMedia.length === 0 ? (
          <p className="text-gray-400 text-center col-span-3">
            No Media Available
          </p>
        ) : (
          <>
            {activeTab === "All" && (
              <>
                {/* Photos Section */}
                {media.some((item) => item.type === "photo") && (
                  <>
                    <h2 className="col-span-2 md:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                      Photos
                    </h2>
                    {media
                      .filter((item) => item.type === "photo")
                      .map((item) => (
                        <MediaCard
                          key={item.id}
                          item={item}
                          selectedMedia={selectedMedia}
                          onDelete={handleDeleteSingle}
                          onPreview={() => setPreviewItem(item)}
                          className="w-fit h-40"
                        />
                      ))}
                  </>
                )}

                {/* Videos Section */}
                {media.some((item) => item.type === "video") && (
                  <>
                    <h2 className="col-span-2 md:col-span-4 text-lg font-semibold text-gray-700 dark:text-white mt-4">
                      Videos
                    </h2>
                    {media
                      .filter((item) => item.type === "video")
                      .map((item) => (
                        <MediaCard
                          key={item.id}
                          item={item}
                          selectedMedia={selectedMedia}
                          onDelete={handleDeleteSingle}
                          onPreview={() => setPreviewItem(item)}
                        />
                      ))}
                  </>
                )}
              </>
            )}

            {activeTab !== "All" &&
              filteredMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  selectedMedia={selectedMedia}
                  onDelete={handleDeleteSingle}
                  onPreview={() => setPreviewItem(item)}
                />
              ))}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="relative">
            <MediaUpload
              onClose={() => setIsModalOpen(false)}
              onMediaUpdate={handleMediaUpdate}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-3xl w-fit relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              className="absolute top-2 right-4 text-red-600 bg-transparent hover:bg-transparent dark:text-gray-300 text-xl"
              onClick={() => setPreviewItem(null)}
            >
              &times;
            </Button>
            <h2 className="text-center text-lg font-semibold mb-4 text-gray-700 dark:text-white">
              {previewItem.title}
            </h2>
            {previewItem.type === "photo" ? (
              <img
                src={previewItem.preview || previewItem.url || ""}
                alt={previewItem.title}
                className="w-fit max-h-[500px] object-contain"
              />
            ) : (
              <video
                src={previewItem.preview || previewItem.url || ""}
                controls
                className="w-fit max-h-[500px] rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mediaedit;

//  Reusable MediaCard Component
interface UploadItem {
  id: string | number;
  title: string;
  file?: File | null;
  preview?: string | null;
  type: "photo" | "video";
  url?: string;
}

interface MediaCardProps {
  item: UploadItem;
  selectedMedia: (string | number)[];
  onDelete: (id: string | number) => void;
  onPreview: () => void;
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onDelete, onPreview }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 lg:max-w-96 max-w-64 3xl:h-84">
      {/* Three-dot delete menu */}
      <div className="absolute top-1 right-1 z-10" ref={menuRef}>
        <Button
          className="text-black bg-yellow-200 dark:text-black text-3xl hover:bg-yellow-200 w-4 h-8"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          &times;
        </Button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 bg-white shadow-md rounded-md">
            <Button
              onClick={() => {
                onDelete(item.id);
                setMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-red-600 bg-white w-full text-left hover:bg-white"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Preview on Click */}
      <div onClick={onPreview} className="cursor-pointer">
        {item.type === "photo" ? (
          <img
            src={item.preview || item.url || ""}
            alt={item.title}
            className="w-full h-40 3xl:h-56 object-cover rounded-lg mt-2"
          />
        ) : (
          <video
            src={item.preview || item.url || ""}
            className="w-full h-40 3xl:h-72 rounded-lg mt-2"
          />
        )}
      </div>

      {/* Title below */}
      <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-white">
        {item.title}
      </p>
    </div>
  );
};
