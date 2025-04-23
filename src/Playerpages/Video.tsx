import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faUpload, faTrash } from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import Upload from "./Upload";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "video";
}

const Video: React.FC = () => {
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

  const filteredMedia = media.filter((item) => item.type === "video");

  const handleDeleteSingle = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this media item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = media.filter((item) => item.id !== id);
        setMedia(updated);
        setSelectedMedia(selectedMedia.filter((mid) => mid !== id));
        localStorage.setItem("savedMedia", JSON.stringify(updated));
        Swal.fire("Deleted!", "The media item has been removed.", "success");
      }
    });
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 w-3xl">
      {/* CARD CONTAINER */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8">
        {/* Top Tabs & Upload */}
        <div className="flex space-x-4 mb-6">
          {[{ name: "Videos", icon: faVideo }].map((tab) => (
            <button
              key={tab.name}
              className={`px-4 py-2 rounded-md flex items-center gap-2 border-2 cursor-pointer  ${
                activeTab === tab.name
                  ? "bg-yellow-200 dark:bg-yellow-400 font-semibold"
                  : "bg-transparent text-gray-600 hover:text-black dark:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab.name)}
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

        {/* Media Section - Only Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMedia.length === 0 ? (
            <p className="text-gray-400 text-center w-full col-span-full">
              No Videos Available
            </p>
          ) : (
            filteredMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                selectedMedia={selectedMedia}
                onDelete={handleDeleteSingle}
                onPreview={() => setPreviewItem(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="relative">
            <Upload
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
            <video
              src={previewItem.preview || ""}
              controls
              className="w-fit max-h-[500px] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
// -------------------- MediaCard Component -------------------- //

interface MediaCardProps {
  item: UploadItem;
  selectedMedia: number[];
  onDelete: (id: number) => void;
  onPreview: () => void;
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onDelete, onPreview }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

      {/* Preview on Click */}
      <div onClick={onPreview} className="cursor-pointer">
        <video
          src={item.preview || ""}
          controls
          className="w-full h-40 rounded-lg mt-2"
        />
      </div>

      <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-white">
        {item.title}
      </p>
    </div>
  );
};
