import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo, faPlay } from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";

interface MediaItem {
  id: number | string;
  title: string;
  file?: File | null;
  preview: string | null;
  url?: string;
  type: "photo" | "video";
}

interface MediaviewProps {
  Data?: any;
  isExpertView?: boolean;
}

const Mediaview: React.FC<MediaviewProps> = ({ Data }) => {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    console.log("PlayerMedia received profile data:", Data);

    if (!Data) {
      setIsLoading(false);
      return;
    }

    let mediaItems: MediaItem[] = [];

    // Process uploads array
    if (Data.uploads && Array.isArray(Data.uploads)) {
      console.log("Processing uploads:", Data.uploads);

      const uploadMedia = Data.uploads
        .filter((upload: any) => upload.url)
        .map((upload: any, index: number) => ({
          id: upload.id || `upload-${index}`,
          title: upload.title || upload.name || `Upload ${index + 1}`,
          preview: upload.url || null,
          url: upload.url || null,
          type: determineMediaType(upload.url || ""),
        }));

      mediaItems = [...mediaItems, ...uploadMedia];
    }

    console.log("Final processed media items:", mediaItems);
    setMedia(mediaItems);
    setIsLoading(false);
  }, [Data]);

  // Helper function to determine media type from URL
  const determineMediaType = (url: string): "photo" | "video" => {
    if (!url) return "photo";
    const videoExtensions = [".mp4", ".mov", ".avi", ".webm"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
      ? "video"
      : "photo";
  };

  const filteredMedia = media.filter((item) =>
    filter === "all" ? true : item.type === filter
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`py-2 px-4 rounded-md ${
            filter === "all" ? "bg-yellow-200" : "bg-white dark:bg-gray-600"
          } transition duration-200`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("photo")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${
            filter === "photo" ? "bg-yellow-200" : "bg-white dark:bg-gray-600"
          } transition duration-200`}
        >
          <FontAwesomeIcon icon={faImage} className="text-blue-600" />
          Photos
        </button>
        <button
          onClick={() => setFilter("video")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${
            filter === "video" ? "bg-yellow-200" : "bg-white dark:bg-gray-600"
          } transition duration-200`}
        >
          <FontAwesomeIcon icon={faVideo} className="text-blue-600" />
          Videos
        </button>
      </div>

      {/* Display Uploaded Media Based on Filter */}
      <div className="flex flex-col items-center gap-6 w-full max-w-screen">
        {filteredMedia.length === 0 ? (
          <p className="text-gray-400 dark:text-white">
            No{" "}
            {filter === "all"
              ? "media"
              : filter === "photo"
              ? "photos"
              : "videos"}{" "}
            available.
          </p>
        ) : (
          <>
            {(filter === "all" || filter === "photo") &&
              filteredMedia.some((item) => item.type === "photo") && (
                <div className="w-full max-w-screen text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    {filteredMedia
                      .filter((item) => item.type === "photo")
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="text-center cursor-pointer"
                          onClick={() => setPreviewItem(photo)}
                        >
                          <div className="w-full h-36 overflow-hidden rounded-md">
                            <img
                              src={photo.preview || photo.url || ""}
                              alt={photo.title}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "https://via.placeholder.com/300/CCCCCC/666666?text=Image+Not+Found";
                              }}
                            />
                          </div>
                          <p className="text-sm mt-2 text-gray-600 dark:text-white">
                            {photo.title}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {(filter === "all" || filter === "video") &&
              filteredMedia.some((item) => item.type === "video") && (
                <div className="w-full text-left mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    {filteredMedia
                      .filter((item) => item.type === "video")
                      .map((video) => (
                        <div
                          key={video.id}
                          className="text-center cursor-pointer"
                          onClick={() => setPreviewItem(video)}
                        >
                          <div className="w-full aspect-video overflow-hidden rounded-md bg-black relative">
                            <video
                              src={video.preview || video.url || ""}
                              className="w-full h-full object-contain rounded-md"
                              controls={false}
                              muted
                              poster="https://via.placeholder.com/400x225/000000/FFFFFF?text=Video"
                              onMouseOver={(e) =>
                                (e.target as HTMLVideoElement).play()
                              }
                              onMouseOut={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.pause();
                                video.currentTime = 0;
                              }}
                            />
                            {/* Play button overlay for videos */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-black bg-opacity-60 flex items-center justify-center hover:bg-opacity-70 transition-all">
                                <FontAwesomeIcon
                                  icon={faPlay}
                                  className="text-white text-2xl ml-1"
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm mt-2 text-gray-600 dark:text-white">
                            {video.title}
                          </p>
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-gray-600 dark:text-gray-300 text-3xl hover:text-red-500"
              onClick={() => setPreviewItem(null)}
            >
              &times;
            </button>
            <h2 className="text-center text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              {previewItem.title}
            </h2>
            <div className="flex justify-center">
              {previewItem.type === "photo" ? (
                <img
                  src={previewItem.preview || previewItem.url || ""}
                  alt={previewItem.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                  }}
                />
              ) : (
                <video
                  src={previewItem.preview || previewItem.url || ""}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.poster =
                      "https://via.placeholder.com/800x600/000000/FFFFFF?text=Video+Not+Available";
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mediaview;
