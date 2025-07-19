import React, { useEffect, useState } from "react";
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
import profile from "../../assets/images/avatar.png";
import { Input } from "@/components/ui/input";
import { Search, FileText, FileX2 } from "lucide-react";
import { Link } from "react-router-dom";

const bookings = [
  {
    id: "#334",
    date: "Sat Apr 22 2024 01:55",
    image: profile,
    player: "Player One",
    expert: "Expert One",
    assessment: "1-on-1 Online Training or advice",
    amount: 970.0,
    status: "Completed",
    report: true,
  },
  {
    id: "#754",
    date: "Wed Nov 22 2023 06:48",
    image: profile,
    player: "Player Two",
    expert: "Expert Two",
    assessment: "On-Field Live Assessment",
    amount: 448.0,
    status: "Pending",
    report: false,
  },
  {
    id: "#023",
    date: "Tue Sept 12 2023 02:17",
    image: profile,
    player: "Player Three",
    expert: "Expert Three",
    assessment: "On-Field Live Assessment",
    amount: 393.0,
    status: "Completed",
    report: true,
  },
  {
    id: "#23",
    date: "Sun Feb 04 2024 10:56",
    image: profile,
    player: "Player Four",
    expert: "Expert Four",
    assessment: "Online Video Assessment",
    amount: 764.0,
    status: "Completed",
    report: true,
  },
  {
    id: "#221",
    date: "Fri Jul 21 2023 19:47",
    image: profile,
    player: "Player Five",
    expert: "Expert Five",
    assessment: "On-Field Live Assessment",
    amount: 385.0,
    status: "Pending",
    report: false,
  },

  {
    id: "#23",
    date: "Sun Feb 04 2024 10:56",
    image: profile,
    player: "Player Four",
    expert: "Expert Four",
    assessment: "Online Video Assessment",
    amount: 764.0,
    status: "Completed",
    report: true,
  },
  {
    id: "#221",
    date: "Fri Jul 21 2023 19:47",
    image: profile,
    player: "Player Five",
    expert: "Expert Five",
    assessment: "On-Field Live Assessment",
    amount: 385.0,
    status: "Pending",
    report: false,
  },
  {
    id: "#23",
    date: "Sun Feb 04 2024 10:56",
    image: profile,
    player: "Player Four",
    expert: "Expert Four",
    assessment: "Online Video Assessment",
    amount: 764.0,
    status: "Completed",
    report: true,
  },
  {
    id: "#221",
    date: "Fri Jul 21 2023 19:47",
    image: profile,
    player: "Player Five",
    expert: "Expert Five",
    assessment: "On-Field Live Assessment",
    amount: 385.0,
    status: "Pending",
    report: false,
  },
  
];

const Booking: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchMonths = () => {
      const monthList = [
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
      setTimeout(() => {
        setMonths(monthList);
      }, 500);
    };

    fetchMonths();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Players Booking</h2>
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

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Experts</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Reports</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{booking.id}</span>
                    <span className="text-sm text-gray-500">{booking.date}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.image}
                      alt={booking.player}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                      to={`/player-profile/${booking.player}`}
                      className="text-blue-600 underline font-medium"
                    >
                      {booking.player}
                    </Link>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.image}
                      alt={booking.expert}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                      to={`/expert-profile/${booking.expert}`}
                      className="text-blue-600 underline font-medium"
                    >
                      {booking.expert}
                    </Link>
                  </div>
                </TableCell>

                <TableCell>{booking.assessment}</TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">
                      £{booking.amount.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${
                        booking.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.status === "Completed" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    className={
                      booking.status === "Completed"
                        ? "bg-green-200 text-green-800 w-20 p-2"
                        : "bg-yellow-200 text-yellow-800 w-20 p-2"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {booking.report ? (
                    <FileText className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileX2 className="w-5 h-5 text-gray-400" />
                  )}
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

export default Booking;
