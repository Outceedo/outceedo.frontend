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
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Pencil,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Dummy sponsor media data for demonstration
const mediaData = [
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    expert: "User name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
];

// Pagination Bar Component
const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3);

  return (
    <div className="flex justify-between items-center px-4 py-4 border-t bg-white">
      <span className="text-xs text-gray-700">
        Showing {(currentPage - 1) * 7 + 1} to {Math.min(currentPage * 7, totalItems)} out of {totalItems}
      </span>
      <div className="flex rounded overflow-hidden border border-gray-200 gap-0.5 bg-white">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-100 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          &#60;
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`w-8 h-8 flex items-center justify-center text-xs border-x border-gray-200 ${
              currentPage === pageNum
                ? "bg-blue-100 text-blue-700 font-semibold border-blue-400"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-100 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          &#62;
        </button>
      </div>
    </div>
  );
};

const SponsorMedia: React.FC = () => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination logic
  const totalItems = mediaData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMedia = mediaData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-8 ">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Sponsor's Media</h2>
        {/* Example month dropdown, you can wire up as needed */}
        <select className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900">
          <option>October</option>
        </select>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-900 overflow-x-auto shadow-sm">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-base sm:text-lg">
            <TableRow>
              <TableHead className="w-12 text-center py-4">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-[160px] text-left py-4">Sponsors Name</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Audio</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Videos</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Certificates</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Awards</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Affiliation</TableHead>
              <TableHead className="min-w-[120px] text-center py-4">Status</TableHead>
              <TableHead className="min-w-[140px] text-center py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMedia.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50 transition">
                <TableCell className="text-center align-middle py-4">
                  <Checkbox />
                </TableCell>
                <TableCell className="align-middle py-4">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{item.expert}</span>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.audio}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.video}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.certificate}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.award}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  {item.affiliation}
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Badge
                    className={
                      item.status === "Completed"
                        ? "bg-green-200 text-green-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                        : "bg-yellow-200 text-yellow-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <div className="flex gap-2 justify-center">
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Eye className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default SponsorMedia;