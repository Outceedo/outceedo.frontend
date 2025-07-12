import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import profile from "../../assets/images/avatar.png";
import { Link } from "react-router-dom";

// Updated player list with more users & removed account field
const players = [
  {
    id: 1,
    image: profile,
    name: "John Doe",
    joined: "18th June 2025",
    status: "Active",
    subscription: "Monthly",
    expiry: "18th July 2025",
  },
  {
    id: 2,
    image: profile,
    name: "Alice Smith",
    joined: "20th May 2025",
    status: "Inactive",
    subscription: "Yearly",
    expiry: "20th May 2026",
  },
  {
    id: 3,
    image: profile,
    name: "Robert Taylor",
    joined: "5th April 2025",
    status: "Active",
    subscription: "Monthly",
    expiry: "5th May 2025",
  },
  {
    id: 4,
    image: profile,
    name: "Emily Johnson",
    joined: "30th March 2025",
    status: "Inactive",
    subscription: "Yearly",
    expiry: "30th March 2026",
  },
  {
    id: 5,
    image: profile,
    name: "Michael Brown",
    joined: "15th June 2025",
    status: "Active",
    subscription: "Monthly",
    expiry: "15th July 2025",
  },
  {
    id: 6,
    image: profile,
    name: "Sophia Wilson",
    joined: "1st July 2025",
    status: "Inactive",
    subscription: "Monthly",
    expiry: "1st August 2025",
  },
  {
    id: 7,
    image: profile,
    name: "David Lee",
    joined: "22nd June 2025",
    status: "Active",
    subscription: "Yearly",
    expiry: "22nd June 2026",
  },
  {
    id: 8,
    image: profile,
    name: "Olivia Martin",
    joined: "12th May 2025",
    status: "Inactive",
    subscription: "Monthly",
    expiry: "12th June 2025",
  },
];

const Player: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const monthList = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    setTimeout(() => {
      setMonths(monthList);
    }, 500);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Players Details</h2>

        {/* Search + Month Filter */}
        <div className="flex items-center gap-2">
          {/* Search input with icon */}
          <div className="relative w-full dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>

          {/* Month dropdown */}
          <select className="border px-3 py-2 rounded-md dark:bg-gray-900">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Player Names</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {players.map((player, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                {/* User name with hyperlink */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                      to={`/player-profile/${player.id}`}
                      className="text-blue-600 underline"
                    >
                      {player.name}
                    </Link>
                  </div>
                </TableCell>

                {/* Joined Date */}
                <TableCell>{player.joined}</TableCell>

                {/* Status Button */}
               <TableCell>
  <Badge
    className={
      player.status === "Active"
        ? "bg-green-200 text-green-800 p-1 w-16"
        : "bg-yellow-200 text-yellow-800 p-1 w-16"
    }
  >
    {player.status}
  </Badge>
</TableCell>


                {/* Subscription */}
                <TableCell>
                  <Badge className="bg-indigo-100 text-indigo-800 p-1 w-20 text-center">
                    {player.subscription}
                  </Badge>
                </TableCell>

                {/* Expiry Date */}
                <TableCell>{player.expiry}</TableCell>

                {/* Action Buttons */}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out of {players.length}</div>
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

export default Player;
