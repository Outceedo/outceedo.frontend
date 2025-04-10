import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faFileAlt,
  faEye,
  faEyeSlash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Booking {
  id: number;
  expertName: string;
  date: string;
  service: string;
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
}

const initialBookings: Booking[] = [
  {
    id: 145,
    expertName: "Cody Fisher",
    date: "2 Jan 2025",
    service: "Online Video Assessment",
    amount: "$20",
    action: "Accepted",
    bookingStatus: "Paid",
  },
  {
    id: 123,
    expertName: "Karen",
    date: "20 Dec 2024",
    service: "Online Live Assessment",
    amount: "$50",
    action: "Rejected",
    bookingStatus: "Paid",
  },
  {
    id: 432,
    expertName: "Samuel Moore",
    date: "12 Dec 2024",
    service: "Online 1 on 1 Advise",
    amount: "$25",
    action: "Re-Scheduled",
    bookingStatus: "Paid",
  },
  {
    id: 342,
    expertName: "Andy",
    date: "25 Nov 2024",
    service: "Online Video Assessment",
    amount: "$10",
    action: "Accepted",
    bookingStatus: "Not Paid",
  },
  {
    id: 100,
    expertName: "Miguel Mendes",
    date: "10 Oct 2024",
    service: "Online 1 on 1 Advise",
    amount: "$75",
    action: "Rejected",
    bookingStatus: "Pending",
  },
  {
    id: 70,
    expertName: "Jonatan Katalaskajo",
    date: "15 Sep 2024",
    service: "Online Video Assessment",
    amount: "$15",
    action: "Accepted",
    bookingStatus: "Pending",
  },
  {
    id: 32,
    expertName: "Michael",
    date: "2 Aug 2025",
    service: "Online 1 on 1 Advise",
    amount: "$150",
    action: "Re-Scheduled",
    bookingStatus: "Not Paid",
  },
];

const MyBooking: React.FC = () => {
  const [bookings] = useState<Booking[]>(initialBookings);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [isVisible, setIsVisible] = useState(true);
  const [search, setSearch] = useState("");

  // Updated with the standard Shadcn Badge variants: default, secondary, outline, destructive
  // For additional colors, use className instead of variant
  const getActionBadgeStyle = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Re-Scheduled":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "";
    }
  };

  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Not Paid":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.expertName.toLowerCase().includes(search.toLowerCase()) &&
      (bookingStatus === "all" || booking.bookingStatus === bookingStatus)
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <div className="flex items-center space-x-4 mb-6">
        {/* Search Input with Icon */}
        <div className="relative w-1/3">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search by Expert Name"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Booking Status Dropdown */}
        <Select value={bookingStatus} onValueChange={setBookingStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Not Paid">Not Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Booking ID</TableHead>
              <TableHead>Expert Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Booking Status</TableHead>
              <TableHead className="text-center">Video</TableHead>
              <TableHead className="text-center">Assessment Report</TableHead>
              <TableHead className="text-center">Display/Hide</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://i.pravatar.cc/40?u=${booking.id}`}
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{booking.expertName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getActionBadgeStyle(booking.action)}
                    >
                      {booking.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPaymentBadgeStyle(booking.bookingStatus)}
                    >
                      {booking.bookingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FontAwesomeIcon icon={faVideo} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FontAwesomeIcon icon={faFileAlt} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsVisible(!isVisible)}
                    >
                      <FontAwesomeIcon icon={isVisible ? faEye : faEyeSlash} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyBooking;
