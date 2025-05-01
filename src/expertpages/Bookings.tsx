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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faTimes,
  faCalendarAlt,
  faVideo,
  faFileAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

interface Booking {
  id: number;
  expertName: string;
  playerName: string;
  date: string;
  service: string;
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled" | "Pending" | "Completed";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
  review?: string;
}

const BookingExpertside: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load bookings from localStorage or use demo data
  useEffect(() => {
    // Sample booking data for demonstration
    const demoBookings: Booking[] = [
      {
        id: 1,
        expertName: "John Smith",
        playerName: "Alex Taylor",
        date: "May 5, 2025 at 10:00am",
        service: "Technical Training Session",
        amount: "$35",
        action: "Pending",
        bookingStatus: "Not Paid",
      },
      {
        id: 2,
        expertName: "Emma Johnson",
        playerName: "Michael Brown",
        date: "May 7, 2025 at 2:00pm",
        service: "Strategy Session",
        amount: "$40",
        action: "Accepted",
        bookingStatus: "Pending",
      },
      {
        id: 3,
        expertName: "Miguel Rodriguez",
        playerName: "Sophia Williams",
        date: "May 1, 2025 at 9:00am",
        service: "Field Training",
        amount: "$45",
        action: "Completed",
        bookingStatus: "Paid",
        review:
          "Player showed strong fundamentals but needs to work on positioning. Overall good progress.",
      },
      {
        id: 4,
        expertName: "Sarah Lee",
        playerName: "Oliver Garcia",
        date: "May 10, 2025 at 11:30am",
        service: "Video Analysis",
        amount: "$50",
        action: "Accepted",
        bookingStatus: "Pending",
        review:
          "Good attention to detail during the session. Identified several areas for improvement.",
      },
      {
        id: 5,
        expertName: "David Wilson",
        playerName: "Emma Martinez",
        date: "April 28, 2025 at 4:00pm",
        service: "Mental Coaching",
        amount: "$55",
        action: "Completed",
        bookingStatus: "Paid",
      },
      {
        id: 6,
        expertName: "Jessica Chen",
        playerName: "Noah Johnson",
        date: "May 12, 2025 at 5:30pm",
        service: "Technical Training Session",
        amount: "$35",
        action: "Rejected",
        bookingStatus: "Not Paid",
      },
    ];

    // Get bookings from localStorage or use demo data
    const localStorageBookings = localStorage.getItem("myBookings");
    if (localStorageBookings) {
      setBookings(JSON.parse(localStorageBookings));
    } else {
      setBookings(demoBookings);
    }
  }, []);

  // Handle changing the booking action
  const handleActionChange = (
    bookingId: number,
    action: "Accepted" | "Rejected" | "Re-Scheduled" | "Completed"
  ) => {
    // Update the booking in state
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, action } : booking
    );
    setBookings(updatedBookings);

    // Update the booking in localStorage
    localStorage.setItem("myBookings", JSON.stringify(updatedBookings));
  };

  // Handle opening review modal
  const openReviewModal = (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setSelectedBookingId(bookingId);
    setReviewText(booking?.review || "");
    setIsReviewModalOpen(true);
  };

  // Handle closing review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBookingId(null);
    setReviewText("");
  };

  // Handle submitting the review
  const handleSubmitReview = () => {
    if (!selectedBookingId) return;

    setSubmittingReview(true);

    // Simulate API delay
    setTimeout(() => {
      // Update local state
      const updatedBookings = bookings.map((booking) =>
        booking.id === selectedBookingId
          ? { ...booking, review: reviewText }
          : booking
      );
      setBookings(updatedBookings);

      // Update in localStorage
      localStorage.setItem("myBookings", JSON.stringify(updatedBookings));

      // Close modal and reset state
      setSubmittingReview(false);
      closeReviewModal();
    }, 500);
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
      case "Pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Completed":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
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
      booking.playerName.toLowerCase().includes(search.toLowerCase()) &&
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
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
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
              <TableHead className="text-center">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
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
                      <span>{booking.playerName}</span>
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
                        disabled={booking.action !== "Pending"}
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
                        disabled={booking.action !== "Pending"}
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
                        disabled={
                          !["Pending", "Accepted"].includes(booking.action)
                        }
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
                      disabled={!["Accepted"].includes(booking.action)}
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
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        booking.review ? "text-yellow-500" : ""
                      }`}
                      title={booking.review ? "Edit Review" : "Add Review"}
                      onClick={() => openReviewModal(booking.id)}
                    >
                      <FontAwesomeIcon icon={faStar} />
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
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-800">Completed</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.action === "Completed").length}
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
                      with {booking.playerName}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {booking.date.split(" at ")[0]}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-gray-600">{booking.amount}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {bookings.find((b) => b.id === selectedBookingId)?.review
                ? "Edit Player Review"
                : "Add Player Review"}
            </DialogTitle>
            <DialogDescription>
              Add your feedback about the player's performance during this
              session. This review will be visible to the player.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Session Details:</p>
              <p className="text-sm text-gray-500">
                {bookings.find((b) => b.id === selectedBookingId)?.service} with{" "}
                {bookings.find((b) => b.id === selectedBookingId)?.playerName}{" "}
                on {bookings.find((b) => b.id === selectedBookingId)?.date}
              </p>
            </div>

            <Textarea
              placeholder="Enter your review here..."
              className="min-h-[150px]"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || !reviewText.trim()}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingExpertside;
