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
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import profile from "../../assets/images/avatar.png";
import { Link } from "react-router-dom";

const players = [
  {
    id: 1,
    image: profile,
    name: "User One",
    email: "user1@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 2,
    image: profile,
    name: "User Two",
    email: "user2@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 3,
    image: profile,
    name: "User Three",
    email: "user3@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 4,
    image: profile,
    name: "User Four",
    email: "user4@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 5,
    image: profile,
    name: "User Five",
    email: "user5@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 6,
    image: profile,
    name: "User Six",
    email: "user6@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 7,
    image: profile,
    name: "User Seven",
    email: "user7@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 8,
    image: profile,
    name: "User Eight",
    email: "user8@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 9,
    image: profile,
    name: "User Nine",
    email: "user9@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 10,
    image: profile,
    name: "User Ten",
    email: "user10@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
];

const Player: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchMonths = () => {
      const monthList = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setTimeout(() => {
        setMonths(monthList);
      }, 500);
    };

    fetchMonths();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Players Details</h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>

          <select className="border px-3 py-2 rounded-md dark:bg-gray-900">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Email ID</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {players.map((player, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

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

                <TableCell>{player.joined}</TableCell>

                <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                  {player.email}
                </TableCell>

                <TableCell>{player.Account}</TableCell>

                <TableCell>
                  <span
                    className={`w-24 px-2 py-1 rounded text-xs font-medium
                      ${player.subscription === "Yearly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"}`}
                  >
                    {player.subscription}
                  </span>
                </TableCell>

                <TableCell>{player.subscriptionExpired}</TableCell>

                <TableCell>
                  <Badge
                    className={
                      player.status === "Active"
                        ? "bg-green-200 text-green-800 p-2 w-20"
                        : "bg-yellow-200 text-yellow-800 p-2 w-20"
                    }
                  >
                    {player.status}
                  </Badge>
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

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out 100</div>
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
