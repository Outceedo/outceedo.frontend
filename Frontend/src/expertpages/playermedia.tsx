import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from 'react-router-dom';
import { faTrash, faImage, faVideo, faUpload } from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import ExpertNavbar from "./expertNavbar";
import MediaUpload from "./MediaUpload";
import { useState, useEffect } from "react";
import ExpertHeader from "./expertheader";

interface MediaItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
}

const PlayerMedia: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(savedMedia);
  }, []);

  const filteredMedia = media.filter((item) =>
    filter === "all" ? true : item.type === filter
  );

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 ">
        <button
          onClick={() => setFilter("all")}
          className={`py-2 px-4 rounded-md ${filter === "all" ? "bg-yellow-200" : "bg-white-700"} transition duration-200`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("photo")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${filter === "photo" ? "bg-yellow-200" : "bg-white-700"} transition duration-200`}
        >
          <FontAwesomeIcon icon={faImage} className="text-blue-600" />
          Photos
        </button>
        <button
          onClick={() => setFilter("video")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${filter === "video" ? "bg-yellow-200" : "bg-white-700"} transition duration-200`}
        >
          <FontAwesomeIcon icon={faVideo} className="text-blue-600" />
          Videos
        </button>
      </div>

      {/* Display Uploaded Media Based on Filter */}
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
        {filteredMedia.length === 0 ? (
          <p className="text-gray-400 dark:text-white">
            No {filter === "all" ? "media" : filter === "photo" ? "photos" : "videos"} available.
          </p>
        ) : (
          <>
            {(filter === "all" || filter === "photo") && media.some((item) => item.type === "photo") && (
              <div className="w-full text-left">
                <h2 className="bg-red-500 text-white py-2 px-4 rounded-md mb-3">All Photos</h2>
                <div className="grid grid-cols-3 gap-4">
                  {media.filter((item) => item.type === "photo").map((photo) => (
                    <div key={photo.id} className="text-center cursor-pointer" onClick={() => setPreviewItem(photo)}>
                      <img
                        src={photo.preview || ""}
                        alt={photo.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <p className="text-xs mt-1 text-gray-600 dark:text-white">{photo.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(filter === "all" || filter === "video") && media.some((item) => item.type === "video") && (
              <div className="w-full text-left">
                <h2 className="bg-red-500 text-white py-2 px-4 rounded-md mb-3">All Videos</h2>
                <div className="grid grid-cols-3 gap-4">
                  {media.filter((item) => item.type === "video").map((video) => (
                    <div key={video.id} className="text-center cursor-pointer" onClick={() => setPreviewItem(video)}>
                      <video
                        src={video.preview || ""}
                        className="w-32 h-24 rounded-md"
                        controls
                      />
                      <p className="text-xs mt-1 text-gray-600 dark:text-white">{video.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl w-full relative"
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

export default PlayerMedia;