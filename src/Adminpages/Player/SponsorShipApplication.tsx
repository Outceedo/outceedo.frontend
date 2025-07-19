import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Eye, Trash2, MoreHorizontal } from "lucide-react";
import avatar from "../../assets/images/avatar.png"; // ✅ Make sure this path is correct

const applications = [
  {
    sponsor: "Sponsor A",
    sponsorSecondary: "Secondary info",
    player: "Player X",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Monetary",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Pending",
  },
  {
    sponsor: "Sponsor B",
    sponsorSecondary: "Secondary info",
    player: "Player Y",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Approved",
  },
  {
    sponsor: "Sponsor C",
    sponsorSecondary: "Secondary info",
    player: "Player Z",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Approved",
  },
  {
    sponsor: "Sponsor D",
    sponsorSecondary: "Secondary info",
    player: "Player W",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Monetary",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Pending",
  },
  {
    sponsor: "Sponsor E",
    sponsorSecondary: "Secondary info",
    player: "Player T",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Rejected",
  },
];

const SponsorShipApplication: React.FC = () => {
  return (
    <div className="p-2 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-semibold mb-4">Sponsorship Request</h2>

      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xs sm:text-base">
            <TableRow>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3"></TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Sponsor's Name</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Player's Name</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Application Date</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Type</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Allocated Date</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Sponsorship</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Status</TableHead>
              <TableHead className="px-2 sm:px-4 py-2 sm:py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applications.map((app, index) => (
              <TableRow key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <Checkbox />
                </TableCell>

                {/* Sponsor's Name */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={app.sponsor}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-xs sm:text-sm md:text-base">{app.sponsor}</span>
                      <div className="text-[10px] sm:text-xs text-gray-500">{app.sponsorSecondary}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Player's Name */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={app.player}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-xs sm:text-sm md:text-base">{app.player}</span>
                      <div className="text-[10px] sm:text-xs text-gray-500">{app.playerSecondary}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Application Date */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.applicationDate}</span>
                </TableCell>

                {/* Type */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.type}</span>
                </TableCell>

                {/* Allocated Date */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.allocatedDate}</span>
                </TableCell>

                {/* Sponsorship Amount */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle font-semibold">
                  <span className="text-xs sm:text-sm">{app.amount}</span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <Badge
                    className={
                      app.status === "Approved"
                        ? "bg-green-100 text-green-800 p-1 w-20 text-xs sm:text-sm"
                        : app.status === "Rejected"
                        ? "bg-red-100 text-red-800 p-1 w-20 text-xs sm:text-sm"
                        : "bg-yellow-100 text-yellow-800 p-1 w-20 text-xs sm:text-sm"
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <div className="flex gap-1 sm:gap-2">
                    <button className="text-red-600 hover:bg-red-50 rounded-full p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-blue-50 rounded-full p-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination & Showing count */}
        <div className="flex items-center justify-between px-4 py-2 text-xs sm:text-sm">
          <div>
            Showing {applications.length} / {applications.length}
          </div>
          <div className="flex gap-1">
            <button className="border px-2 py-1 rounded hover:bg-gray-100">{"<"}</button>
            <button className="border px-2 py-1 rounded hover:bg-gray-100">1</button>
            <button className="border px-2 py-1 rounded hover:bg-gray-100">2</button>
            <button className="border px-2 py-1 rounded hover:bg-gray-100">{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorShipApplication;