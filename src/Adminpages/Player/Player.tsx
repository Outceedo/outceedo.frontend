import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import profile from "../../assets/images/avatar.png";

const players = [
  {
    id: 1,
    image: profile,
    name: "User One",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Inactive",
  },
  {
    id: 2,
    image: profile,
    name: "User Two",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Active",
  },
  {
    id: 3,
    image: profile,
    name: "User Three",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Active",
  },
  {
    id: 4,
    image: profile,
    name: "User Four",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Active",
  },
  {
    id: 5,
    image: profile,
    name: "User Five",
    joined: "18th June 2025",
    subscription: "Premium",
    expiry: "27-03-2026",
    status: "Inactive",
  },
  {
    id: 6,
    image: profile,
    name: "User Six",
    joined: "18th June 2025",
    subscription: "Premium",
    expiry: "27-03-2026",
    status: "Active",
  },
  {
    id: 7,
    image: profile,
    name: "User Seven",
    joined: "18th June 2025",
    subscription: "Premium",
    expiry: "27-03-2026",
    status: "Inactive",
  },
  {
    id: 8,
    image: profile,
    name: "User Eight",
    joined: "18th June 2025",
    subscription: "Premium",
    expiry: "27-03-2026",
    status: "Inactive",
  },
  {
    id: 9,
    image: profile,
    name: "User Nine",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Active",
  },
  {
    id: 10,
    image: profile,
    name: "User Ten",
    joined: "18th June 2025",
    subscription: "Free",
    expiry: "-",
    status: "Inactive",
  },
];



const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Player: React.FC = () => {
  const [monthList, setMonthList] = useState<string[]>([]);
  useEffect(() => {
    setMonthList(months);
  }, []);

  return (
    <div className="p-2 sm:p-6 w-full max-w-full ">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Registered Players Details</h2>
        <div className="flex gap-2 items-center">
          
          <select
            className="border px-3 py-2 rounded-md bg-white w-36 font-medium text-gray-700"
            value={monthList}
            onChange={e => setMonthList(e.target.value)}
          >
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-lg border bg-white overflow-x-auto w-full">
        <Table className="min-w-[650px] w-full">
          <TableHeader>
            <TableRow className="bg-red-50 text-base">
              <TableHead className="w-4"></TableHead>
              <TableHead>
                <span className="relative right-6">
                  <Checkbox />
                </span>
                <span className="font-medium text-gray-700">Player Names</span>
              </TableHead>
              <TableHead>
                <span className="font-medium text-gray-700">Registered Date</span>
              </TableHead>
              <TableHead>
                <span className="font-medium text-gray-700">Subscription</span>
              </TableHead>
              <TableHead>
                <span className="font-medium text-gray-700">Expiry Date</span>
              </TableHead>
              <TableHead>
                <span className="font-medium text-gray-700">Status</span>
              </TableHead>
              <TableHead className="text-center">
                <span className="font-medium text-gray-700">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200"
                    />
                    <span className="text-gray-700 font-medium truncate">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">{player.joined}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">{player.subscription}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">{player.expiry}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      player.status === "Active"
                        ? "bg-green-200 text-green-800 p-1 w-20 font-medium"
                        : "bg-yellow-200 text-yellow-800 p-1 w-20 font-medium"
                    }
                  >
                    {player.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2 justify-center min-w-[110px]">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-500 gap-2">
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