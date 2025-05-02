import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faVideo,
  faUpload,
  faTrash,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import MediaUpload from "./MediaUpload";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface UploadItem {
  id: string | number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
  url?: string;
}

interface MediaProps {
  playerdata?: any; // Optional player data with uploads
  isExpertView?: boolean;
}

interface AlertProps {
  type: "success" | "error" | "warning" | "confirm";
  title: string;
  text?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

// Custom Alert Component
const CustomAlert: React.FC<AlertProps & { onClose: () => void }> = ({
  type,
  title,
  text,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return faCheckCircle;
      case "error":
        return faTimesCircle;
      case "warning":
      case "confirm":
        return faExclamationTriangle;
      default:
        return faCheckCircle;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
      case "confirm":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
        <div className="flex flex-col items-center mb-4">
          <FontAwesomeIcon
            icon={getIcon()}
            className={`text-4xl mb-3 ${getIconColor()}`}
          />
          <h2 className="text-xl font-semibold">{title}</h2>
          {text && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-center">
              {text}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          {type === "confirm" && (
            <Button
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
          )}

          <Button
            onClick={() => {
              if (type === "confirm") {
                onConfirm?.();
              }
              onClose();
            }}
            className={`px-5 py-2 ${
              type === "confirm"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : type === "success"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : type === "error"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {type === "confirm" ? "Yes, delete it!" : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Media: React.FC<MediaProps> = ({ playerdata, isExpertView = false }) => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Alert state
  const [alert, setAlert] = useState<AlertProps & { show: boolean }>({
    show: false,
    type: "success",
    title: "",
    text: "",
  });

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    // Check if player data with uploads is available
    if (
      playerdata &&
      playerdata.uploads &&
      Array.isArray(playerdata.uploads) &&
      playerdata.uploads.length > 0
    ) {
      console.log("Using media from playerdata:", playerdata.uploads);

      // Transform uploads to match our UploadItem format
      const mediaItems: UploadItem[] = playerdata.uploads.map((item: any) => ({
        id: item.id || item._id,
        title: item.title || "Untitled",
        file: null,
        preview: item.url,
        url: item.url,
        type: item.type === "video" ? "video" : "photo",
      }));

      setMedia(mediaItems);
      setIsLoading(false);
    } else {
      // Fetch media from API if no player data
      fetchMediaFromAPI();
    }
  }, [playerdata]);

  // Fetch media from API
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
          file: null,
          preview: item.url,
          url: item.url,
          type: item.type === "video" ? "video" : "photo",
        }));

        setMedia(mediaItems);

        // Update local storage for offline access
        localStorage.setItem("savedMedia", JSON.stringify(mediaItems));
      }
    } catch (error) {
      console.error("Error fetching media:", error);

      // Use local storage as fallback if API fails
      const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
      setMedia(savedMedia);

      // Show error alert
      setAlert({
        show: true,
        type: "error",
        title: "Failed to load media",
        text: "There was a problem loading your media files.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpdate = async () => {
    // Refetch media from API after update
    fetchMediaFromAPI();
  };

  const filteredMedia =
    activeTab === "All"
      ? media
      : media.filter((item) =>
          activeTab === "Photos" ? item.type === "photo" : item.type === "video"
        );

  const handleDeleteSingle = async (id: string | number) => {
    // Show confirm alert
    setAlert({
      show: true,
      type: "confirm",
      title: "Are you sure?",
      text: "Do you want to delete this media item?",
      onConfirm: async () => {
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

          // Update local state and localStorage
          const updated = media.filter((item) => item.id !== id);
          setMedia(updated);
          setSelectedMedia(selectedMedia.filter((mid) => mid !== id));
          localStorage.setItem("savedMedia", JSON.stringify(updated));

          // Show success alert
          setAlert({
            show: true,
            type: "success",
            title: "Deleted!",
            text: "The media item has been removed.",
          });
        } catch (error) {
          console.error("Error deleting media:", error);

          // Update local state even if API call fails
          const updated = media.filter((item) => item.id !== id);
          setMedia(updated);
          setSelectedMedia(selectedMedia.filter((mid) => mid !== id));
          localStorage.setItem("savedMedia", JSON.stringify(updated));

          // Show error alert
          setAlert({
            show: true,
            type: "error",
            title: "Delete Failed",
            text: "Failed to delete the media item from server, but it was removed locally.",
          });
        }
      },
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

        {!isExpertView && (
          <div className="flex justify-end w-full">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FE221E] hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUpload} />
              Upload
            </Button>
          </div>
        )}
      </div>

      {/* Media Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
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
                    <h2 className="col-span-2 md:col-span-3 text-lg font-semibold text-gray-700 dark:text-white">
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
                          isExpertView={isExpertView}
                        />
                      ))}
                  </>
                )}

                {/* Videos Section */}
                {media.some((item) => item.type === "video") && (
                  <>
                    <h2 className="col-span-2 md:col-span-3 text-lg font-semibold text-gray-700 dark:text-white mt-4">
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
                          isExpertView={isExpertView}
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
                  isExpertView={isExpertView}
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
              className="absolute top-2 right-4 text-gray-600 dark:text-gray-300 text-xl"
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

      {/* Custom Alert Dialog */}
      {alert.show && (
        <CustomAlert
          type={alert.type}
          title={alert.title}
          text={alert.text}
          onConfirm={alert.onConfirm}
          onCancel={alert.onCancel}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default Media;

//  Reusable MediaCard Component
interface MediaCardProps {
  item: UploadItem;
  selectedMedia: (string | number)[];
  onDelete: (id: string | number) => void;
  onPreview: () => void;
  className?: string;
  isExpertView?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onDelete,
  onPreview,
  isExpertView = false,
}) => {
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
    <div className="relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 ">
      {/* Three-dot delete menu - Only show if not in expert view */}
      {!isExpertView && (
        <div className="absolute top-2 right-2 z-10" ref={menuRef}>
          <Button
            className="text-gray-100 dark:text-white text-lg"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ⋮
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-md rounded-md">
              <Button
                onClick={() => {
                  onDelete(item.id);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 w-full text-left"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview on Click */}
      <div onClick={onPreview} className="cursor-pointer relative">
        {item.type === "photo" ? (
          <img
            src={item.preview || item.url || ""}
            alt={item.title}
            className="w-full h-40 object-cover rounded-lg mt-2"
          />
        ) : (
          <div className="relative">
            <video
              src={item.preview || item.url || ""}
              className="w-full h-40 object-cover rounded-lg mt-2"
            />
            {/* Play button overlay for videos */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black bg-opacity-60 flex items-center justify-center hover:bg-opacity-70 transition-all">
                <FontAwesomeIcon icon={faPlay} className="text-white text-xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title below */}
      <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-white">
        {item.title}
      </p>
    </div>
  );
};
