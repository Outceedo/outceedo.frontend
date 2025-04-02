import React, { useState, useEffect } from "react";

interface MediaProps {
  playerId?: string;
  isExpertView?: boolean;
}

interface MediaItem {
  id: number;
  title: string;
  preview: string;
  type: "photo" | "video";
}

const Media: React.FC<MediaProps> = ({ playerId, isExpertView = false }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<"photo" | "video">("photo");

  // In a real application, this would fetch from an API using playerId
  useEffect(() => {
    // For demo, we'll use localStorage, but in a real app this would be an API call
    const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(savedMedia);
  }, [playerId]);

  // Filter media by type based on the active tab
  const filteredMedia = media.filter((item) => item.type === activeTab);

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2 mb-4">
        <span
          onClick={() => setActiveTab("photo")}
          className={`cursor-pointer px-4 py-2 ${
            activeTab === "photo"
              ? "text-red-500 font-semibold border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-300"
          }`}
        >
          Photos
        </span>
        <span
          onClick={() => setActiveTab("video")}
          className={`cursor-pointer px-4 py-2 ${
            activeTab === "video"
              ? "text-red-500 font-semibold border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-300"
          }`}
        >
          Videos
        </span>
      </div>

      {/* Media Gallery */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No {activeTab}s available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden dark:bg-gray-700"
            >
              {item.type === "photo" ? (
                <img
                  src={item.preview}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <video
                  src={item.preview}
                  controls
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-3">
                <h4 className="font-medium dark:text-white">
                  {item.title || "Untitled"}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add fallback content when no media is available */}
      {media.length === 0 && (
        <div className="mt-6 text-center p-8 border border-dashed rounded-lg dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            No media has been uploaded for this player yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Media;
