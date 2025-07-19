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
  Pencil,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import your Badge component

const transactions = [
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    playerImage: profile,
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    expertImage: profile,
    serviceDate: "12-06-2025",
    serviceType: "Online Video Assessment",
    fee: 719.0,
    status: "Pending",
  },
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    playerImage: profile,
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    expertImage: profile,
    serviceDate: "12-06-2025",
    serviceType: "1-on-1 Online Training or advice",
    fee: 188.0,
    status: "Rejected",
  },
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    playerImage: profile,
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    expertImage: profile,
    serviceDate: "12-06-2025",
    serviceType: "Online Video Assessment",
    fee: 674.0,
    status: "Approved",
  },
  // ... more transactions
];

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

const ServiceTransaction: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("October");

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Service Transactions</h2>
        <div>
          <select
            className="border px-3 py-2 rounded-md bg-white w-36 font-medium text-gray-700"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
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
        <Table className="min-w-[950px] w-full">
          <TableHeader className="bg-red-50 text-xs sm:text-base">
            <TableRow>
              <TableHead className="px-3 py-3 bg-red-50"></TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Player Name</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Expert Name</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Service Date</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Service Type</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Fee</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Status</TableHead>
              <TableHead className="px-3 py-3 bg-red-50 text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => (
              <TableRow key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                <TableCell className="px-3 py-2 align-middle">
                  <Checkbox />
                </TableCell>
                {/* Player Name */}
                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.playerImage}
                      alt={item.player}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-base">{item.player}</span>
                      <div className="text-gray-500 text-sm">{item.playerSecondary}</div>
                    </div>
                  </div>
                </TableCell>
                {/* Expert Name */}
                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.expertImage}
                      alt={item.expert}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-base">{item.expert}</span>
                      <div className="text-gray-500 text-sm">{item.expertSecondary}</div>
                    </div>
                  </div>
                </TableCell>
                {/* Service Date */}
                <TableCell className="px-3 py-2 align-middle">
                  <span className="text-base">{item.serviceDate}</span>
                </TableCell>
                {/* Service Type */}
                <TableCell className="px-3 py-2 align-middle">
                  <span className="block text-base">{item.serviceType}</span>
                </TableCell>
                {/* Fee */}
                <TableCell className="px-3 py-2 align-middle font-semibold">
                  <span className="text-base">{item.fee.toFixed(2)}</span>
                </TableCell>
                {/* Status with Badge */}
                <TableCell className="px-3 py-2 align-middle">
                  <Badge
                    className={
                      item.status === "Approved"
                        ? "bg-green-100 text-green-800 p-1 w-20 text-xs sm:text-sm"
                        : item.status === "Rejected"
                        ? "bg-red-100 text-red-800 p-1 w-20 text-xs sm:text-sm"
                        : "bg-yellow-100 text-yellow-800 p-1 w-20 text-xs sm:text-sm"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                {/* Actions */}
                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex gap-3">
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
                      <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-white" />
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
        <div>Showing 1 out of {transactions.length}</div>
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

export default ServiceTransaction;