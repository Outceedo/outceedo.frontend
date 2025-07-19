import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import profile from "../../assets/images/avatar.png";
import {
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Pencil,
  Eye,
  MoreVertical,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const mediaData = [
  {
    expert: "Aarav Kumar",
    image: profile,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    expert: "Meera Sharma",
    image: profile,
    video: "https://www.w3schools.com/html/movie.mp4",
  },
  {
    expert: "Aarav Kumar",
    image: profile,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    expert: "Meera Sharma",
    image: profile,
    video: "https://www.w3schools.com/html/movie.mp4",
  },
  {
    expert: "Aarav Kumar",
    image: profile,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    expert: "Meera Sharma",
    image: profile,
    video: "https://www.w3schools.com/html/movie.mp4",
  },
  {
    expert: "Aarav Kumar",
    image: profile,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    expert: "Meera Sharma",
    image: profile,
    video: "https://www.w3schools.com/html/movie.mp4",
  },
];

const Media: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    src: string;
  } | null>(null);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Player Media </h2>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Pictures</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.expert}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                      to={`/expert-profile/${index + 1}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {item.expert}
                    </Link>
                  </div>
                </TableCell>

                <TableCell>
                  <button
                    onClick={() =>
                      setSelectedMedia({ type: "image", src: item.image })
                    }
                    className="flex items-center gap-1 text-sm text-purple-800 hover:text-purple-900 bg-purple-100 rounded-xl p-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Picture
                  </button>
                </TableCell>

                <TableCell>
                  <button
                    onClick={() =>
                      setSelectedMedia({ type: "video", src: item.video })
                    }
                    className="flex items-center gap-1 text-sm text-purple-800 hover:text-purple-900 bg-purple-100 rounded-xl p-1.5 cursor-pointer"
                  >
                    <VideoIcon className="w-4 h-4" />
                    Video
                  </button>
                </TableCell>

                <TableCell className="flex gap-2 justify-center">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Preview for Image or Video */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 p-4 rounded-md shadow-lg w-full max-w-md">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-3 text-center">
              {selectedMedia.type === "image"
                ? "Image Preview"
                : "Video Preview"}
            </h3>

            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.src}
                alt="Media"
                className="w-full rounded border shadow-sm"
              />
            ) : (
              <video
                src={selectedMedia.src}
                controls
                className="w-full rounded border shadow-sm"
              />
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out of {mediaData.length}</div>
        <div className="flex gap-1">
          <button className="border px-2 rounded">⟨</button>
          <button className="border px-2 rounded bg-gray-200">1</button>
          <button className="border px-2 rounded">2</button>
          <button className="border px-2 rounded">⟩</button>
        </div>
      </div>
    </div>
  );
};

export default Media;
