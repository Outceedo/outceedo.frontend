import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faFileAlt,
  faEye,
  faEyeSlash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import Video from "./Video";
import AssessmentReport from "../Playerpages/AssessmentReport";
import { X } from "lucide-react";
import profile2 from "../assets/images/profile2.jpg"; // Import a default profile image

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
  expertProfileImage?: string;
  date: string;
  service: {
    name: string;
    description: string;
    price: string;
  };
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled" | "Pending";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
  createdAt?: string; // Add timestamp for when booking was created
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );

  const [visibilityMap, setVisibilityMap] = useState<{ [id: number]: boolean }>(
    {}
  );

  // Load bookings from localStorage on component mount
  useEffect(() => {
    const storedBookings = localStorage.getItem("bookings");
    if (storedBookings) {
      let parsedBookings: Booking[] = JSON.parse(storedBookings);

      // Add createdAt field if not present (for older bookings)
      parsedBookings = parsedBookings.map((booking) => {
        if (!booking.createdAt) {
          return { ...booking, createdAt: new Date().toISOString() };
        }
        return booking;
      });

      // Sort bookings by date in ascending order (oldest first)
      parsedBookings.sort((a, b) => {
        // Try to parse date strings for comparison
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        // If we can't parse the dates properly, try to sort by ID as a fallback
        // Lower ID typically means it was created earlier
        if (isNaN(dateA) || isNaN(dateB)) {
          return a.id - b.id;
        }

        return dateA - dateB;
      });

      setBookings(parsedBookings);
    }
  }, []);

  const openVideoModal = (id: number) => {
    setSelectedBookingId(id);
    setIsVideoOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
    setSelectedBookingId(null);
  };

  const openReportModal = (id: number) => {
    setSelectedBookingId(id);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId(null);
  };

  const toggleVisibility = (id: number) => {
    setVisibilityMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getActionBadgeStyle = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Re-Scheduled":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
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

  const formatBookingDate = (dateString: string) => {
    // Check if the date has the redundant year pattern
    if (dateString.includes(", 2025 at")) {
      // Fix formatting
      return dateString.replace(", 2025 at", " at");
    }
    return dateString;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <div className="flex items-center space-x-4 mb-6">
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
              <TableHead>Expert</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-center">Video</TableHead>
              <TableHead className="text-center">Report</TableHead>
              <TableHead className="text-center">View</TableHead>
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
                      <span>{booking.expertName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatBookingDate(booking.date)}</TableCell>
                  <TableCell>{booking.service.name}</TableCell>
                  <TableCell>{booking.service.price}</TableCell>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => openVideoModal(booking.id)}
                    >
                      <FontAwesomeIcon icon={faVideo} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => openReportModal(booking.id)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleVisibility(booking.id)}
                    >
                      <FontAwesomeIcon
                        icon={visibilityMap[booking.id] ? faEye : faEyeSlash}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-3xl relative">
            <button
              onClick={closeVideoModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-4xl cursor-pointer"
            >
              ×
            </button>
            <Video />
          </div>
        </div>
      )}

      {/* Assessment Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={closeReportModal}>
              <X className="w-7 h-7 cursor-pointer text-gray-800 hover:text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <AssessmentReport />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
