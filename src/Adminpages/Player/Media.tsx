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
  Eye,
  Edit2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data adapted to the image
const mediaData = [
  {
    name: "User name",
    image: profile,
    status: "Pending",
  },
  {
    name: "User name",
    image: profile,
    status: "Completed",
  },
  {
    name: "User name",
    image: profile,
    status: "Pending",
  },
  {
    name: "User name",
    image: profile,
    status: "Completed",
  },
  {
    name: "User name",
    image: profile,
    status: "Pending",
  },
  {
    name: "User name",
    image: profile,
    status: "Completed",
  },
  {
    name: "User name",
    image: profile,
    status: "Pending",
  },
  {
    name: "User name",
    image: profile,
    status: "Completed",
  },
  {
    name: "User name",
    image: profile,
    status: "Pending",
  },
  {
    name: "User name",
    image: profile,
    status: "Completed",
  },
];

const statusClass = status =>
  status === "Completed"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

const Media = () => {
  const [selectedMonth, setSelectedMonth] = useState("October");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Player's Media</h2>
        <div>
          <select
            className="border px-3 py-2 rounded-md bg-white w-36 font-medium text-gray-700"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {months.map((month, idx) => (
              <option key={idx} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm">
        <Table className="min-w-[950px]">
          <TableHeader className="bg-red-50 text-xs sm:text-base">
            <TableRow>
              <TableHead className="px-3 py-3 bg-red-50"></TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Players Name</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Audio</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Videos</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Certificates</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Awards</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Status</TableHead>
              <TableHead className="px-3 py-3 bg-red-50">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaData.map((item, idx) => (
              <TableRow key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                <TableCell className="px-3 py-2 align-middle">
                  <Checkbox />
                </TableCell>
                {/* Player Name with image */}
                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-xs sm:text-sm">{item.name}</span>
                  </div>
                </TableCell>
                {/* Audio */}
                <TableCell className="px-3 py-2 align-middle">
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm">View</a>
                </TableCell>
                {/* Videos */}
                <TableCell className="px-3 py-2 align-middle">
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm">View</a>
                </TableCell>
                {/* Certificates */}
                <TableCell className="px-3 py-2 align-middle">
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm">View</a>
                </TableCell>
                {/* Awards */}
                <TableCell className="px-3 py-2 align-middle">
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm">View</a>
                </TableCell>
                {/* Status */}
                <TableCell className="px-3 py-2 align-middle">
                  <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
                {/* Actions */}
                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex gap-2">
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
                     <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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