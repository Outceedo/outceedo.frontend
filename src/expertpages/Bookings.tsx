import React, { useState, useEffect } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faTimes,
  faCalendarAlt,
  faVideo,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

interface Booking {
  id: number;
  expertName: string;
  date: string;
  service: string;
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
}

const BookingExpertside: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Load bookings from localStorage on component mount
  useEffect(() => {
    // Get bookings from localStorage
    const localStorageBookings = JSON.parse(
      localStorage.getItem("myBookings") || "[]"
    );

    // Get static bookings (this would normally come from an API)
    const staticBookings: Booking[] = [];

    // Combine all bookings
    setBookings([...staticBookings, ...localStorageBookings]);
  }, []);

  // Handle changing the booking action
  const handleActionChange = (
    bookingId: number,
    action: "Accepted" | "Rejected" | "Re-Scheduled"
  ) => {
    // Update the booking in state
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, action } : booking
    );
    setBookings(updatedBookings);

    // Update the booking in localStorage
    const storageBookings = JSON.parse(
      localStorage.getItem("myBookings") || "[]"
    );
    const updatedStorageBookings = storageBookings.map((booking: Booking) =>
      booking.id === bookingId ? { ...booking, action } : booking
    );
    localStorage.setItem("myBookings", JSON.stringify(updatedStorageBookings));
  };

  // Get style for action badges
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

  // Get style for payment badges
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

  // Filter bookings based on search, action, and status filters
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.expertName.toLowerCase().includes(search.toLowerCase()) &&
      (bookingStatus === "all" || booking.bookingStatus === bookingStatus) &&
      (actionFilter === "all" || booking.action === actionFilter)
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        Expert Dashboard - Player Bookings
      </h1>

      <div className="flex items-center space-x-4 mb-6">
        {/* Search Input with Icon */}
        <div className="relative w-1/3">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search by Player Name"
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

        {/* Action Filter Dropdown */}
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Re-Scheduled">Re-Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Booking ID</TableHead>
              <TableHead>Player Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-center">Session</TableHead>
              <TableHead className="text-center">Report</TableHead>
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
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() =>
                          handleActionChange(booking.id, "Accepted")
                        }
                        title="Accept Booking"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() =>
                          handleActionChange(booking.id, "Rejected")
                        }
                        title="Reject Booking"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                        onClick={() =>
                          handleActionChange(booking.id, "Re-Scheduled")
                        }
                        title="Reschedule Booking"
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Start Video Session"
                    >
                      <FontAwesomeIcon icon={faVideo} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Create/View Report"
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Statistics Section */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800">Total Bookings</h3>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800">Accepted</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.action === "Accepted").length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="font-medium text-red-800">Rejected</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.action === "Rejected").length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-yellow-800">Rescheduled</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.action === "Re-Scheduled").length}
          </p>
        </div>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bookings
            .filter((booking) => booking.action === "Accepted")
            .slice(0, 3)
            .map((booking) => (
              <div
                key={`upcoming-${booking.id}`}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{booking.service}</h3>
                    <p className="text-sm text-gray-500">
                      with {booking.expertName}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {booking.date}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-gray-600">{booking.amount}</span>
                  {/* <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Prepare
                  </Button> */}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookingExpertside;
