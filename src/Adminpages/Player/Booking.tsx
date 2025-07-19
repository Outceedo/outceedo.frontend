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
import profile from "../../assets/images/avatar.png";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  FileX2,
  Trash2,
  Edit2,
  Eye,
  MoreHorizontal,
} from "lucide-react";

const bookings = [
  {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "Online Video Assessment",
    amount: 719.0,
    status: "Completed",
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  {
    id: "#002",
    date: "Wed Aug 09 2023 15:14",
    player: "Player Two",
    playerSecondary: "Secondary info",
    expert: "Expert Two",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "1-on-1 Online Training or advice",
    amount: 198.0,
    status: "Completed",
    report: { id: "043", date: "Wed Aug 09 2023 15:14" },
    cycle: "Weekly",
  },
  {
    id: "#003",
    date: "Thu Nov 23 2023 18:00",
    player: "Player Three",
    playerSecondary: "Secondary info",
    expert: "Expert Three",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "Online Video Assessment",
    amount: 674.0,
    status: "Completed",
    report: { id: "042", date: "Thu Nov 23 2023 18:00" },
    cycle: "Monthly",
  },
  {
    id: "#004",
    date: "Tue Sep 12 2023 02:17",
    player: "Player Four",
    playerSecondary: "Secondary info",
    expert: "Expert Four",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "On-Field Live Assessment",
    amount: 393.0,
    status: "Completed",
    report: { id: "023", date: "Tue Sep 12 2023 02:17" },
    cycle: "Single time",
  },
  {
    id: "#005",
    date: "Sun Nov 26 2023 07:03",
    player: "Player Five",
    playerSecondary: "Secondary info",
    expert: "Expert Five",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "1-on-1 Online Training or advice",
    amount: 731.0,
    status: "Completed",
    report: { id: "098", date: "Sun Nov 26 2023 07:03" },
    cycle: "Weekly",
  },
  {
    id: "#006",
    date: "Sun Apr 21 2024 21:29",
    player: "Player Six",
    playerSecondary: "Secondary info",
    expert: "Expert Six",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "Online Video Assessment",
    amount: 197.0,
    status: "Completed",
    report: { id: "064", date: "Sun Apr 21 2024 21:29" },
    cycle: "Monthly",
  },
  {
    id: "#007",
    date: "Thu Feb 15 2024 01:55",
    player: "Player Seven",
    playerSecondary: "Secondary info",
    expert: "Expert Seven",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "1-on-1 Online Training or advice",
    amount: 970.0,
    status: "Completed",
    report: { id: "334", date: "Thu Feb 15 2024 01:55" },
    cycle: "Weekly",
  },
  {
    id: "#008",
    date: "Wed Nov 22 2023 06:48",
    player: "Player Eight",
    playerSecondary: "Secondary info",
    expert: "Expert Eight",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "On-Field Live Assessment",
    amount: 448.0,
    status: "Completed",
    report: { id: "754", date: "Wed Nov 22 2023 06:48" },
    cycle: "Weekly",
  },
  {
    id: "#009",
    date: "Sun Feb 04 2024 10:25",
    player: "Player Nine",
    playerSecondary: "Secondary info",
    expert: "Expert Nine",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "Online Video Assessment",
    amount: 764.0,
    status: "Completed",
    report: { id: "23", date: "Sun Feb 04 2024 10:25" },
    cycle: "Monthly",
  },
  {
    id: "#010",
    date: "Fri Jul 21 2023 19:47",
    player: "Player Ten",
    playerSecondary: "Secondary info",
    expert: "Expert Ten",
    expertSecondary: "Secondary info",
    playerImage: profile,
    expertImage: profile,
    assessment: "On-Field Live Assessment",
    amount: 385.0,
    status: "Completed",
    report: { id: "4221", date: "Fri Jul 21 2023 19:47" },
    cycle: "Single time",
  },
];

const Booking = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("October");

  useEffect(() => {
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
    setTimeout(() => setMonths(monthList), 500);
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Booking Experts</h2>
        <div className="flex gap-2 items-center">
          
          <select
            className="border px-3 py-2 rounded-md bg-white w-36 font-medium text-gray-700"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-red-50 text-base">
            <TableRow>
              <TableHead className="px-4 py-3"></TableHead>
              <TableHead className="px-4 py-3">Player</TableHead>
              <TableHead className="px-4 py-3">Expert</TableHead>
              <TableHead className="px-4 py-3">Booking Type</TableHead>
              <TableHead className="px-4 py-3">Fee</TableHead>
              <TableHead className="px-4 py-3">Report</TableHead>
              <TableHead className="px-4 py-3">Booking Cycle</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow
                key={index}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <TableCell className="px-4 py-2 align-middle">
                  <Checkbox />
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.playerImage}
                      alt={booking.player}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="underline font-medium">{booking.player}</span>
                      <div className="text-xs text-gray-500">{booking.playerSecondary}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.expertImage}
                      alt={booking.expert}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="underline font-medium">{booking.expert}</span>
                      <div className="text-xs text-gray-500">{booking.expertSecondary}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <span className="block">{booking.assessment}</span>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle font-semibold">
                  {booking.amount.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  {booking.report ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">
                          Report #{booking.report.id}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{booking.report.date}</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileX2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">No Report</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <span className="text-gray-700">{booking.cycle}</span>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default Booking;