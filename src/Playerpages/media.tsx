import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo, faUpload, faTrash } from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import MediaUpload from "./MediaUpload";
import React, { useState, useEffect, useRef } from "react";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
}

const Media: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);

  useEffect(() => {
    const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(savedMedia);
  }, []);

  const handleMediaUpdate = () => {
    const updatedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(updatedMedia);
  };

  const filteredMedia =
    activeTab === "All"
      ? media
      : media.filter((item) =>
          activeTab === "Photos" ? item.type === "photo" : item.type === "video"
        );

  const handleDeleteSingle = (id: number) => {
    const updated = media.filter((item) => item.id !== id);
    setMedia(updated);
    setSelectedMedia(selectedMedia.filter((mid) => mid !== id));
    localStorage.setItem("savedMedia", JSON.stringify(updated));
  };

  return (
    <div className="p-4 -mt-10 w-full">
      {/* Top Tabs & Upload */}
      <div className="flex space-x-4 p-4">
        {[
          { name: "All", icon: null },
          { name: "Photos", icon: faImage },
          { name: "Videos", icon: faVideo },
        ].map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === tab.name
                ? "bg-yellow-200 dark:bg-yellow-400 font-semibold"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.name as "All" | "Photos" | "Videos")}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
            {tab.name}
          </button>
        ))}

        <div className="flex justify-end w-full">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FE221E] hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUpload} />
            Upload
          </button>
        </div>
      </div>

      {/* Media Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filteredMedia.length === 0 ? (
          <p className="text-gray-400 text-center w-full">No Media Available</p>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative">
            <MediaUpload onClose={() => setIsModalOpen(false)} onMediaUpdate={handleMediaUpdate} />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-3xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-gray-600 dark:text-gray-300 text-xl"
              onClick={() => setPreviewItem(null)}
            >
              &times;
            </button>
            <h2 className="text-center text-lg font-semibold mb-4 text-gray-700 dark:text-white">
              {previewItem.title}
            </h2>
            {previewItem.type === "photo" ? (
              <img
                src={previewItem.preview || ""}
                alt={previewItem.title}
                className="w-full max-h-[500px] object-contain"
              />
            ) : (
              <video
                src={previewItem.preview || ""}
                controls
                className="w-full max-h-[500px] rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;

//  Reusable MediaCard Component
interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
}

interface MediaCardProps {
  item: UploadItem;
  selectedMedia: number[];
  onDelete: (id: number) => void;
  onPreview: () => void;
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
    <div className="relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700">
      {/* Three-dot delete menu */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          className="text-gray-500 dark:text-white text-lg"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-md rounded-md">
            <button
              onClick={() => {
                onDelete(item.id); // Corrected here
                setMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Preview on Click */}
      <div onClick={onPreview} className="cursor-pointer">
        {item.type === "photo" ? (
          <img
            src={item.preview || ""}
            alt={item.title}
            className="w-full h-40 object-cover rounded-lg mt-2"
          />
        ) : (
          <video
            src={item.preview || ""}
            controls
            className="w-full h-40 rounded-lg mt-2"
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


