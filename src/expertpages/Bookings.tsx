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

interface Player {
  id: string;
  name: string;
  profileImage?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
}

interface Booking {
  id: string;
  playerId: string;
  expertId: string;
  serviceId: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  meetLink: string | null;
  recordedVideo: string | null;
  meetingRecording: string | null;
  createdAt: string;
  updatedAt: string;
  player?: Player;
  service?: Service;
  review?: string;
}

const BookingExpertside: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [players, setPlayers] = useState<{ [key: string]: Player }>({});
  const [services, setServices] = useState<{ [key: string]: Service }>({});
  const [bookingStatus, setBookingStatus] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/booking`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings);

        // Fetch player and service data for each booking
        await Promise.all(data.bookings.map(fetchRelatedData));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Could not load bookings. Using demo data instead.");

        // Use demo data if API fails
        setBookings(getDemoBookings());
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Fetch related data for each booking (player and service details)
  const fetchRelatedData = async (booking: Booking) => {
    try {
      // Fetch player data if not already fetched
      if (booking.playerId && !players[booking.playerId]) {
        const token = localStorage.getItem("accessToken");
        const playerResponse = await fetch(
          `${API_BASE_URL}/players/${booking.playerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (playerResponse.ok) {
          const playerData = await playerResponse.json();
          setPlayers((prev) => ({
            ...prev,
            [booking.playerId]: {
              id: playerData.id,
              name: playerData.name || "Unknown Player",
              profileImage: playerData.profileImage,
            },
          }));
        }
      }

      // Fetch service data if not already fetched
      if (booking.serviceId && !services[booking.serviceId]) {
        const token = localStorage.getItem("accessToken");
        const serviceResponse = await fetch(
          `${API_BASE_URL}/services/${booking.serviceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          setServices((prev) => ({
            ...prev,
            [booking.serviceId]: {
              id: serviceData.id,
              name: serviceData.name || "Unknown Service",
              description: serviceData.description || "",
              price: serviceData.price
                ? `$${serviceData.price}`
                : "Price not available",
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching related data:", error);
    }
  };

  // Generate demo bookings if API fails
  const getDemoBookings = (): Booking[] => {
    const demoBookings: Booking[] = [
      {
        id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        playerId: "p1a2b3c4",
        expertId: "e1a2b3c4",
        serviceId: "s1a2b3c4",
        status: "WAITING_EXPERT_APPROVAL",
        date: "2025-05-15T00:00:00.000Z",
        startTime: "10:00",
        endTime: "11:00",
        location: null,
        meetLink: null,
        recordedVideo: null,
        meetingRecording: null,
        createdAt: "2025-04-29T14:30:00.000Z",
        updatedAt: "2025-04-29T14:30:00.000Z",
      },
      {
        id: "c2b3d4e5-f6g7-8901-hijk-lm2345678901",
        playerId: "p2b3c4d5",
        expertId: "e1a2b3c4",
        serviceId: "s2b3c4d5",
        status: "CONFIRMED",
        date: "2025-05-20T00:00:00.000Z",
        startTime: "14:00",
        endTime: "15:00",
        location: null,
        meetLink: "https://meet.google.com/abc-defg-hij",
        recordedVideo: null,
        meetingRecording: null,
        createdAt: "2025-04-30T09:15:00.000Z",
        updatedAt: "2025-05-01T10:20:00.000Z",
      },
      {
        id: "d3c4e5f6-g7h8-9012-jklm-no3456789012",
        playerId: "p3c4d5e6",
        expertId: "e1a2b3c4",
        serviceId: "s3c4d5e6",
        status: "COMPLETED",
        date: "2025-04-25T00:00:00.000Z",
        startTime: "09:00",
        endTime: "10:00",
        location: "Central Park Field #3",
        meetLink: null,
        recordedVideo: "https://example.com/videos/session123.mp4",
        meetingRecording: null,
        createdAt: "2025-04-22T11:30:00.000Z",
        updatedAt: "2025-04-25T10:05:00.000Z",
        review:
          "Player showed strong fundamentals but needs to work on positioning. Overall good progress.",
      },
    ];

    // Also populate demo players and services
    const demoPlayers: { [key: string]: Player } = {
      p1a2b3c4: { id: "p1a2b3c4", name: "Alex Taylor" },
      p2b3c4d5: { id: "p2b3c4d5", name: "Michael Brown" },
      p3c4d5e6: { id: "p3c4d5e6", name: "Sophia Williams" },
    };

    const demoServices: { [key: string]: Service } = {
      s1a2b3c4: {
        id: "s1a2b3c4",
        name: "Technical Training Session",
        description: "One-on-one technical skills training",
        price: "$35",
      },
      s2b3c4d5: {
        id: "s2b3c4d5",
        name: "Strategy Session",
        description: "Game strategy and tactical analysis",
        price: "$40",
      },
      s3c4d5e6: {
        id: "s3c4d5e6",
        name: "Field Training",
        description: "On-field practice and drills",
        price: "$45",
      },
    };

    setPlayers(demoPlayers);
    setServices(demoServices);

    return demoBookings;
  };

  // Handle accepting a booking
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/booking/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept booking");
      }

      // Update booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "CONFIRMED" }
            : booking
        )
      );
    } catch (error) {
      console.error("Error accepting booking:", error);
      setError("Failed to accept booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle rejecting a booking
  const handleRejectBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject booking");
      }

      // Update booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "REJECTED" }
            : booking
        )
      );
    } catch (error) {
      console.error("Error rejecting booking:", error);
      setError("Failed to reject booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle rescheduling a booking
  const handleRescheduleBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // In a real implementation, you'd open a modal to get new date/time
      // For now, we'll just update the status
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // You would include new date and time here
            // For demo, we'll just update the status
            status: "RESCHEDULED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reschedule booking");
      }

      // Update booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "RESCHEDULED" }
            : booking
        )
      );
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      setError("Failed to reschedule booking. Please try again.");

      // For demo purposes, still update the UI
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "RESCHEDULED" }
            : booking
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle completing a booking
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete booking");
      }

      // Update booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "COMPLETED" }
            : booking
        )
      );
    } catch (error) {
      console.error("Error completing booking:", error);
      setError("Failed to complete booking. Please try again.");

      // For demo purposes, still update the UI
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "COMPLETED" }
            : booking
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle opening review modal
  const openReviewModal = (bookingId: string) => {
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
  const handleSubmitReview = async () => {
    if (!selectedBookingId) return;

    setSubmittingReview(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/booking/${selectedBookingId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ review: reviewText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, review: reviewText }
            : booking
        )
      );

      closeReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");

      // For demo purposes, still update the UI
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, review: reviewText }
            : booking
        )
      );
      closeReviewModal();
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get style for action badges
  const getActionBadgeStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
      case "CONFIRMED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "RESCHEDULED":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "WAITING_EXPERT_APPROVAL":
      case "PENDING":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get style for payment badges
  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "WAITING_EXPERT_APPROVAL":
      case "PENDING":
      case "CONFIRMED":
      case "ACCEPTED":
      case "RESCHEDULED":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get payment status from booking status
  const getPaymentStatus = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Paid";
      case "REJECTED":
      case "CANCELLED":
        return "Not Paid";
      default:
        return "Pending";
    }
  };

  // Format date for display
  const formatDate = (dateStr: string, startTime: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Format time (convert 24h to 12h format)
    const [hours, minutes] = startTime.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'

    return `${formattedDate} at ${hour}:${minutes}${ampm}`;
  };

  // Filter bookings based on search, action, and status filters
  const filteredBookings = bookings.filter((booking) => {
    const playerName = players[booking.playerId]?.name || "";
    const matchesSearch = playerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      bookingStatus === "all" ||
      getPaymentStatus(booking.status) === bookingStatus;
    const matchesAction =
      actionFilter === "all" ||
      (actionFilter === "Accepted" &&
        ["CONFIRMED", "ACCEPTED"].includes(booking.status)) ||
      (actionFilter === "Rejected" && booking.status === "REJECTED") ||
      (actionFilter === "Re-Scheduled" && booking.status === "RESCHEDULED") ||
      (actionFilter === "Completed" && booking.status === "COMPLETED") ||
      (actionFilter === "Pending" &&
        booking.status === "WAITING_EXPERT_APPROVAL");

    return matchesSearch && matchesStatus && matchesAction;
  });

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

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Booking ID</TableHead>
                <TableHead>Player Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
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
                    <TableCell className="font-medium">
                      {booking.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            players[booking.playerId]?.profileImage ||
                            `https://i.pravatar.cc/40?u=${booking.playerId}`
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <span>
                          {players[booking.playerId]?.name || "Unknown Player"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(booking.date, booking.startTime)}
                    </TableCell>
                    <TableCell>
                      {services[booking.serviceId]?.name || "Unknown Service"}
                    </TableCell>
                    <TableCell>
                      {services[booking.serviceId]?.price || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getActionBadgeStyle(booking.status)}
                      >
                        {formatStatus(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPaymentBadgeStyle(booking.status)}
                      >
                        {getPaymentStatus(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => handleAcceptBooking(booking.id)}
                          title="Accept Booking"
                          disabled={
                            booking.status !== "WAITING_EXPERT_APPROVAL"
                          }
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => handleRejectBooking(booking.id)}
                          title="Reject Booking"
                          disabled={
                            booking.status !== "WAITING_EXPERT_APPROVAL"
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                          onClick={() => handleRescheduleBooking(booking.id)}
                          title="Reschedule Booking"
                          disabled={
                            !["WAITING_EXPERT_APPROVAL", "CONFIRMED"].includes(
                              booking.status
                            )
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
                        disabled={
                          !["CONFIRMED", "ACCEPTED"].includes(booking.status)
                        }
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
      )}

      {/* Statistics Section */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800">Total Bookings</h3>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800">Accepted</h3>
          <p className="text-2xl font-bold">
            {
              bookings.filter((b) =>
                ["CONFIRMED", "ACCEPTED"].includes(b.status)
              ).length
            }
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="font-medium text-red-800">Rejected</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.status === "REJECTED").length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-800">Completed</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => b.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bookings
            .filter((booking) =>
              ["CONFIRMED", "ACCEPTED"].includes(booking.status)
            )
            .slice(0, 3)
            .map((booking) => (
              <div
                key={`upcoming-${booking.id}`}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {services[booking.serviceId]?.name || "Service"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      with {players[booking.playerId]?.name || "Player"}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-gray-600">
                    {services[booking.serviceId]?.price || "N/A"}
                  </span>
                </div>
              </div>
            ))}

          {bookings.filter((booking) =>
            ["CONFIRMED", "ACCEPTED"].includes(booking.status)
          ).length === 0 && (
            <div className="col-span-3 text-center py-4 text-gray-500">
              No upcoming sessions
            </div>
          )}
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
              {selectedBookingId && (
                <p className="text-sm text-gray-500">
                  {services[
                    bookings.find((b) => b.id === selectedBookingId)
                      ?.serviceId || ""
                  ]?.name || "Service"}{" "}
                  with{" "}
                  {players[
                    bookings.find((b) => b.id === selectedBookingId)
                      ?.playerId || ""
                  ]?.name || "Player"}{" "}
                  on{" "}
                  {bookings.find((b) => b.id === selectedBookingId)
                    ? formatDate(
                        bookings.find((b) => b.id === selectedBookingId)
                          ?.date || "",
                        bookings.find((b) => b.id === selectedBookingId)
                          ?.startTime || ""
                      )
                    : ""}
                </p>
              )}
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
