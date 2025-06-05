import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faFileAlt,
  faEye,
  faEyeSlash,
  faSearch,
  faUser,
  faCalendarAlt,
  faMoneyBill,
  faClock,
  faMapMarkerAlt,
  faLink,
  faInfoCircle,
  faCreditCard,
  faStar,
  faExclamationTriangle,
  faTrash,
  faFilter,
  faTimes,
  faLaptop,
  faVideoCamera,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import Video from "./Video";
import AssessmentReport from "../Playerpages/AssessmentReport";
import { X } from "lucide-react";
import profile from "../assets/images/avatar.png"; // Import a default profile image

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Updated interfaces to match the new API response format
interface Expert {
  id: string;
  username: string;
  photo: string;
}

interface Player {
  id: string;
  username: string;
  photo: string;
}

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  serviceId: string;
  price: number;
  service: ServiceDetails;
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
  expert: Expert;
  player: Player;
  service: Service;
  review?: string;
  description?: string | null;
  isPaid?: boolean; // Added to track payment status locally
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [visibilityMap, setVisibilityMap] = useState<{ [id: string]: boolean }>(
    {}
  );

  // Booking details modal state
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Check if any filters are applied
  useEffect(() => {
    setFiltersApplied(
      bookingStatus !== "all" ||
        actionFilter !== "all" ||
        serviceTypeFilter !== "all" ||
        dateFilter !== "" ||
        search !== ""
    );
  }, [bookingStatus, actionFilter, serviceTypeFilter, dateFilter, search]);

  // Function to clear all filters
  const clearAllFilters = () => {
    setBookingStatus("all");
    setActionFilter("all");
    setServiceTypeFilter("all");
    setDateFilter("");
    setSearch("");
  };

  // Function to check if booking is eligible for payment
  const canPay = (booking: Booking) => {
    return (
      booking.status === "ACCEPTED" &&
      !booking.isPaid &&
      booking.status !== "REJECTED" &&
      booking.status !== "CANCELLED" &&
      booking.status !== "COMPLETED"
    );
  };

  // Function to check if booking needs payment (for display purposes)
  const needsPayment = (booking: Booking) => {
    return (
      (booking.status === "WAITING_EXPERT_APPROVAL" ||
        booking.status === "ACCEPTED") &&
      !booking.isPaid &&
      booking.status !== "REJECTED" &&
      booking.status !== "CANCELLED" &&
      booking.status !== "COMPLETED"
    );
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Handle video error
  const handleVideoError = () => {
    setVideoError(
      "Failed to load video. The URL might be invalid or the video may no longer be available."
    );
  };

  // Get service type based on service ID and attributes
  const getServiceType = (booking: Booking): string => {
    // Assuming service ID "1" is for recorded video assessment
    if (booking.service?.serviceId === "1") {
      return "recorded-video";
    }
    // Check if there's a meet link for online sessions
    else if (booking.meetLink) {
      return "online";
    }
    // If there's a physical location
    else if (booking.location) {
      return "in-person";
    }
    // Default to other
    return "other";
  };

  // Get friendly name for service type
  const getServiceTypeName = (type: string): string => {
    switch (type) {
      case "recorded-video":
        return "Recorded Video Assessment";
      case "online":
        return "Online Session";
      case "in-person":
        return "In-Person Training";
      default:
        return "Other Service";
    }
  };

  // Dummy data for demonstration when API fails
  const getDummyBookings = (): Booking[] => {
    return [
      {
        id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        playerId: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
        expertId: "e1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
        serviceId: "s1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
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
        expert: {
          id: "e1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          username: "john_coach",
          photo: "https://i.pravatar.cc/150?u=john",
        },
        player: {
          id: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          username: "alex_taylor",
          photo: "https://i.pravatar.cc/150?u=alex",
        },
        service: {
          id: "s1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          serviceId: "1",
          price: 35,
          service: {
            id: "1",
            name: "Technical Training Session",
            description: "One-on-one technical skills training",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        },
        isPaid: false,
      },
      {
        id: "c2b3d4e5-f6g7-8901-hijk-lm2345678901",
        playerId: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
        expertId: "e2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
        serviceId: "s2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
        status: "ACCEPTED",
        date: "2025-05-20T00:00:00.000Z",
        startTime: "14:00",
        endTime: "15:00",
        location: null,
        meetLink: "https://meet.google.com/abc-defg-hij",
        recordedVideo: null,
        meetingRecording: null,
        createdAt: "2025-04-30T09:15:00.000Z",
        updatedAt: "2025-05-01T10:20:00.000Z",
        expert: {
          id: "e2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
          username: "emma_coach",
          photo: "https://i.pravatar.cc/150?u=emma",
        },
        player: {
          id: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          username: "alex_taylor",
          photo: "https://i.pravatar.cc/150?u=alex",
        },
        service: {
          id: "s2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
          serviceId: "2",
          price: 40,
          service: {
            id: "2",
            name: "Strategy Session",
            description: "Game strategy and tactical analysis",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        },
        isPaid: false, // Changed to false for demo purposes
      },
      {
        id: "d3c4e5f6-g7h8-9012-jklm-no3456789012",
        playerId: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
        expertId: "e3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
        serviceId: "s3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
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
        expert: {
          id: "e3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
          username: "miguel_coach",
          photo: "https://i.pravatar.cc/150?u=miguel",
        },
        player: {
          id: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          username: "alex_taylor",
          photo: "https://i.pravatar.cc/150?u=alex",
        },
        service: {
          id: "s3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
          serviceId: "3",
          price: 45,
          service: {
            id: "3",
            name: "Field Training",
            description: "On-field practice and drills",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        },
        isPaid: true,
      },
      {
        id: "e4d5f6g7-h8i9-0123-klmn-op4567890123",
        playerId: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
        expertId: "e4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
        serviceId: "s4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
        status: "REJECTED",
        date: "2025-05-10T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:00",
        location: null,
        meetLink: null,
        recordedVideo: null,
        meetingRecording: null,
        createdAt: "2025-05-01T08:45:00.000Z",
        updatedAt: "2025-05-01T12:30:00.000Z",
        expert: {
          id: "e4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
          username: "sarah_coach",
          photo: "https://i.pravatar.cc/150?u=sarah",
        },
        player: {
          id: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
          username: "alex_taylor",
          photo: "https://i.pravatar.cc/150?u=alex",
        },
        service: {
          id: "s4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
          serviceId: "4",
          price: 50,
          service: {
            id: "4",
            name: "Video Analysis",
            description: "Detailed analysis of gameplay footage",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        },
        isPaid: false,
      },
    ];
  };

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_BASE_URL, {
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
        // Initialize isPaid based on status
        const bookingsWithPaymentStatus = data.bookings.map(
          (booking: Booking) => ({
            ...booking,
            // Only COMPLETED bookings are automatically considered paid
            isPaid: booking.status === "COMPLETED",
          })
        );
        setBookings(bookingsWithPaymentStatus);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Could not connect to server. Showing demo data instead.");

        // Set dummy data if API fails
        setBookings(getDummyBookings());
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Open booking details modal
  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setVideoError(null); // Reset video error when opening new booking
    setIsBookingDetailsOpen(true);
  };

  // Close booking details modal
  const closeBookingDetails = () => {
    setIsBookingDetailsOpen(false);
    setSelectedBooking(null);
    setVideoError(null); // Reset video error when closing
  };

  // Process payment
  const handlePayment = async (bookingId: string) => {
    setIsProcessingPayment(true);

    try {
      // In a real implementation, you would call your payment API here
      // For now, we'll simulate a payment with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the booking status and isPaid flag
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, isPaid: true } : booking
        )
      );

      // If the selected booking is the one being paid for, update it too
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          isPaid: true,
        });
      }

      setPaymentSuccess(true);

      // Reset payment success message after a delay
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Payment processing error:", error);
      setError("Failed to process payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openVideoModal = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBookingId(id);
    setIsVideoOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
    setSelectedBookingId(null);
  };

  const openReportModal = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBookingId(id);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId(null);
  };

  const toggleVisibility = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVisibilityMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "WAITING_EXPERT_APPROVAL":
      case "ACCEPTED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get service type icon
  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "recorded-video":
        return faVideoCamera;
      case "online":
        return faLaptop;
      case "in-person":
        return faChalkboardTeacher;
      default:
        return faInfoCircle;
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
      weekday: "long",
      day: "numeric",
      month: "long",
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

  // Format date shorter (for UI elements with less space)
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Check if a booking matches the date filter
  const matchesDateFilter = (booking: Booking) => {
    if (!dateFilter) return true;

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);

    return bookingDate.getTime() === filterDate.getTime();
  };

  // Check if booking matches the action filter
  const matchesActionFilter = (booking: Booking) => {
    if (actionFilter === "all") return true;

    if (actionFilter === "accepted" && booking.status === "ACCEPTED")
      return true;
    if (actionFilter === "rejected" && booking.status === "REJECTED")
      return true;
    if (
      actionFilter === "waiting" &&
      booking.status === "WAITING_EXPERT_APPROVAL"
    )
      return true;

    return false;
  };

  // Check if booking matches the service type filter
  const matchesServiceTypeFilter = (booking: Booking) => {
    if (serviceTypeFilter === "all") return true;
    return getServiceType(booking) === serviceTypeFilter;
  };

  // Filter bookings based on all filters
  const filteredBookings = bookings.filter((booking) => {
    const expertName = booking.expert?.username || "";
    const matchesSearch = expertName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      bookingStatus === "all" ||
      (bookingStatus === "PAID" && booking.status === "COMPLETED") ||
      (bookingStatus === "NOT_PAID" &&
        booking.status === "WAITING_EXPERT_APPROVAL") ||
      (bookingStatus === "PENDING" && ["ACCEPTED"].includes(booking.status));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateFilter(booking) &&
      matchesActionFilter(booking) &&
      matchesServiceTypeFilter(booking)
    );
  });
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">My Bookings</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:w-1/5">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search by Expert Name"
            className="pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full sm:w-auto min-w-[180px]">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="date"
            className="pl-10"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            max="2030-12-31"
            min="2020-01-01"
          />
        </div>

        {/* Status Filter */}
        <Select value={bookingStatus} onValueChange={setBookingStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="NOT_PAID">Not Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waiting">Waiting Approval</SelectItem>
          </SelectContent>
        </Select>

        {/* Service Type Filter */}
        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className=" sm:w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            <SelectItem value="recorded-video">
              Recorded Video Assessment
            </SelectItem>
            <SelectItem value="online">Online Session</SelectItem>
            <SelectItem value="in-person">In-Person Training</SelectItem>
            <SelectItem value="other">Other Services</SelectItem>
          </SelectContent>
        </Select>
        {filtersApplied && (
          <Button
            variant="outline"
            className=" flex items-center gap-2 text-red-600 border-red-600 hover:text-red-600 "
            onClick={clearAllFilters}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Clear Filters</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
          {error}
        </div>
      )}

      {paymentSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
          Payment processed successfully!
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[140px]">Expert</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[140px]">Service</TableHead>
                <TableHead className="w-[80px]">Price</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Payment</TableHead>
                <TableHead className="text-center w-[70px]">Video</TableHead>
                <TableHead className="text-center w-[70px]">Report</TableHead>
                <TableHead className="text-center w-[70px]">View</TableHead>
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
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openBookingDetails(booking)}
                  >
                    <TableCell className="font-medium">
                      {booking.id.substring(0, 6)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={booking.expert?.photo || profile}
                          alt={booking.expert?.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = profile;
                          }}
                        />
                        <span
                          className="truncate max-w-[80px]"
                          title={booking.expert?.username || "Unknown Expert"}
                          onClick={() => {
                            const expert = booking.expert?.username;
                            localStorage.setItem("viewexpertusername", expert);
                            navigate("/player/exdetails");
                          }}
                        >
                          {truncateText(
                            booking.expert?.username || "Unknown Expert",
                            12
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatShortDate(booking.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={getServiceTypeIcon(getServiceType(booking))}
                          className="text-gray-500"
                        />
                        <span
                          className="truncate block max-w-[100px]"
                          title={
                            booking.service?.service?.name || "Unknown Service"
                          }
                        >
                          {booking.service?.service?.name || "Unknown Service"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${booking.service?.price || "N/A"}</TableCell>
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
                        {booking.isPaid
                          ? "Paid"
                          : booking.status === "REJECTED"
                          ? "Not Paid"
                          : booking.status === "WAITING_EXPERT_APPROVAL"
                          ? "Awaiting Approval"
                          : "Pay Now"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={(e) => openVideoModal(booking.id, e)}
                        disabled={booking.service.service.id !== "1"}
                      >
                        <FontAwesomeIcon icon={faVideo} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={(e) => openReportModal(booking.id, e)}
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => toggleVisibility(booking.id, e)}
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
      )}

      {/* Upcoming Sessions Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings
            .filter(
              (booking) =>
                (booking.status === "ACCEPTED" ||
                  booking.status === "WAITING_EXPERT_APPROVAL") &&
                booking.status !== "REJECTED" &&
                booking.status !== "CANCELLED"
            )
            .slice(0, 3)
            .map((booking) => (
              <div
                key={`upcoming-${booking.id}`}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => openBookingDetails(booking)}
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={getServiceTypeIcon(getServiceType(booking))}
                        className="text-gray-500"
                      />
                      <h3
                        className="font-medium truncate"
                        title={booking.service?.service?.name || "Service"}
                      >
                        {booking.service?.service?.name || "Service"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={booking.expert?.photo || profile}
                        alt={booking.expert?.username}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = profile;
                        }}
                      />
                      <p
                        className="text-sm text-gray-500 truncate"
                        title={`with ${booking.expert?.username || "Expert"}`}
                        onClick={() => {
                          const expert = booking.expert?.username;
                          localStorage.setItem("viewexpertusername", expert);
                          navigate("/player/exdetails");
                        }}
                      >
                        with{" "}
                        {truncateText(booking.expert?.username || "Expert", 15)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-800 whitespace-nowrap"
                  >
                    {formatShortDate(booking.date)}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-gray-600">
                    ${booking.service?.price || "N/A"}
                  </span>

                  {!booking.isPaid && booking.status === "ACCEPTED" ? (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(booking.id);
                      }}
                    >
                      Pay Now
                    </Button>
                  ) : !booking.isPaid &&
                    booking.status === "WAITING_EXPERT_APPROVAL" ? (
                    <Button
                      className="bg-gray-300 text-gray-600 text-sm px-3 py-1 h-auto cursor-not-allowed"
                      disabled
                    >
                      Awaiting Approval
                    </Button>
                  ) : booking.meetLink ? (
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Join Meeting
                    </a>
                  ) : null}
                </div>
              </div>
            ))}

          {bookings.filter(
            (booking) =>
              (booking.status === "ACCEPTED" ||
                booking.status === "WAITING_EXPERT_APPROVAL") &&
              booking.status !== "REJECTED" &&
              booking.status !== "CANCELLED"
          ).length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-4 text-gray-500">
              No upcoming sessions
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog
          open={isBookingDetailsOpen}
          onOpenChange={setIsBookingDetailsOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Booking Details</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {/* Status and Payment */}
              <div className="flex justify-between items-center mb-4">
                <Badge
                  variant="outline"
                  className={getActionBadgeStyle(selectedBooking.status)}
                >
                  {formatStatus(selectedBooking.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getPaymentBadgeStyle(selectedBooking.status)}
                >
                  {selectedBooking.isPaid ? "Paid" : "Not Paid"}
                </Badge>
              </div>

              {/* Expert Information */}
              <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mr-2 text-gray-600"
                  />
                  Expert Information
                </h3>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedBooking.expert?.photo || profile}
                    alt="Expert"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = profile;
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-lg mb-1 break-words">
                      {selectedBooking.expert?.username}
                    </h4>
                    {/* Additional expert info - in a real application, you might fetch this from the API */}
                    <p className="text-gray-600 text-sm mb-1">
                      Professional Coach
                    </p>
                    <p className="text-gray-600 text-sm">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 mr-1"
                      />
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 mr-1"
                      />
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 mr-1"
                      />
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 mr-1"
                      />
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-gray-300 mr-1"
                      />
                      (4.0)
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FontAwesomeIcon
                      icon={getServiceTypeIcon(getServiceType(selectedBooking))}
                      className="mr-2 text-gray-600"
                    />
                    Service Details
                  </h3>
                  <div className="text-lg font-bold text-green-700">
                    <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />$
                    {selectedBooking.service?.price}
                  </div>
                </div>
                <h4 className="font-medium mb-2 break-words">
                  {selectedBooking.service?.service?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {getServiceTypeName(getServiceType(selectedBooking))}
                </p>
                <p className="text-gray-600 mb-4">
                  {selectedBooking.service?.service?.description}
                </p>

                {/* Service features - in a real application, these would come from the API */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>One-on-one personalized instruction</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Video recording for later review</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Detailed performance assessment</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Follow-up recommendations</span>
                  </div>
                </div>
              </div>

              {/* Session Information */}
              <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="mr-2 text-gray-600"
                  />
                  Session Information
                </h3>
                <div className="flex items-start mb-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mr-2 mt-1 text-gray-600 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium">Date & Time:</p>
                    <p className="text-gray-600">
                      {formatDate(
                        selectedBooking.date,
                        selectedBooking.startTime
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start mb-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mr-2 mt-1 text-gray-600 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Duration:</p>
                    <p className="text-gray-600">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </p>
                    {selectedBooking.description && (
                      <>
                        <p className="font-medium mt-2">Description:</p>
                        <p className="text-gray-600 mb-4 break-words">
                          {selectedBooking.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {selectedBooking.location && (
                  <div className="flex items-start mb-2">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 mt-1 text-gray-600 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium">Location:</p>
                      <p className="text-gray-600 break-words">
                        {selectedBooking.location}
                      </p>
                    </div>
                  </div>
                )}
                {selectedBooking.meetLink && (
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faLink}
                      className="mr-2 mt-1 text-gray-600 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium">Meeting Link:</p>
                      <a
                        href={selectedBooking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedBooking.meetLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              {selectedBooking.status === "WAITING_EXPERT_APPROVAL" && (
                <div className="mb-5 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-2 mt-1 text-amber-600 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-amber-800">
                        Payment Pending Expert Approval
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        You will be able to make a payment once the expert
                        accepts your booking request.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Section - Updated to display video player for RECORDED VIDEO ASSESSMENT */}
              {(selectedBooking.recordedVideo ||
                selectedBooking.meetingRecording) && (
                <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FontAwesomeIcon
                      icon={faVideo}
                      className="mr-2 text-gray-600"
                    />
                    Recording
                  </h3>

                  {selectedBooking.recordedVideo && (
                    <div className="mb-2">
                      <p className="font-medium mb-2">Recorded Video:</p>

                      {/* Check if this is a RECORDED VIDEO ASSESSMENT service type */}
                      {selectedBooking.service?.serviceId === "1" ? (
                        // Display embedded video player for RECORDED VIDEO ASSESSMENT
                        <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                          {videoError ? (
                            <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700 flex items-center">
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="mr-2"
                              />
                              <span>{videoError}</span>
                            </div>
                          ) : (
                            <video
                              src={selectedBooking.recordedVideo}
                              controls
                              className="w-full h-auto"
                              preload="metadata"
                              onError={handleVideoError}
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}

                          <div className="mt-2 text-sm text-gray-500">
                            <p>
                              If the video doesn't play, you can also{" "}
                              <a
                                href={selectedBooking.recordedVideo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                open it directly
                              </a>
                              .
                            </p>
                          </div>

                          {/* Video information */}
                          <div className="mt-3 text-sm text-gray-600">
                            <p>
                              Uploaded:{" "}
                              {new Date(
                                selectedBooking.createdAt
                              ).toLocaleDateString()}
                            </p>
                            {selectedBooking.description && (
                              <div className="mt-2">
                                <p className="font-medium">Description:</p>
                                <p className="italic break-words">
                                  {selectedBooking.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // For other service types, use a button to open the video
                        <Button
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => openVideoModal(selectedBooking.id)}
                        >
                          <FontAwesomeIcon icon={faVideo} className="mr-2" />
                          View Recorded Video
                        </Button>
                      )}
                    </div>
                  )}

                  {selectedBooking.meetingRecording && (
                    <div>
                      <p className="font-medium mb-2">Meeting Recording:</p>
                      <Button
                        variant="outline"
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => openVideoModal(selectedBooking.id)}
                      >
                        <FontAwesomeIcon icon={faVideo} className="mr-2" />
                        View Meeting Recording
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Information */}
              <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Booking Information
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Booking ID:</span>{" "}
                  {selectedBooking.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(selectedBooking.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(selectedBooking.updatedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Current Time (UTC):</span>{" "}
                  2025-06-05 05:28:58
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User:</span> 22951a3363
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-wrap gap-3 justify-end">
              {/* Session action buttons */}
              {canPay(selectedBooking) && (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handlePayment(selectedBooking.id)}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Pay Now (${selectedBooking.service?.price})
                    </>
                  )}
                </Button>
              )}

              {needsPayment(selectedBooking) && !canPay(selectedBooking) && (
                <Button
                  className="bg-gray-300 text-gray-600 cursor-not-allowed"
                  disabled
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Awaiting Expert Approval
                </Button>
              )}

              {selectedBooking.meetLink && selectedBooking.isPaid && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() =>
                    window.open(selectedBooking.meetLink, "_blank")
                  }
                >
                  <FontAwesomeIcon icon={faVideo} className="mr-2" />
                  Join Meeting
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => openReportModal(selectedBooking.id)}
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                View Report
              </Button>

              <Button variant="outline" onClick={closeBookingDetails}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-blur ml-[260px] bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-[95%] max-w-3xl relative">
            <button
              onClick={closeVideoModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl sm:text-4xl cursor-pointer"
            >
              ×
            </button>
            {selectedBookingId && (
              <div className="mt-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Recorded Session
                </h2>
                {bookings.find((b) => b.id === selectedBookingId)
                  ?.recordedVideo ? (
                  <div className="w-full rounded-lg overflow-hidden">
                    <video
                      src={
                        bookings.find((b) => b.id === selectedBookingId)
                          ?.recordedVideo || ""
                      }
                      controls
                      className="w-full h-auto"
                      preload="metadata"
                      autoPlay
                      onError={() => {
                        setError(
                          "Failed to load video. Please try again later."
                        );
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : bookings.find((b) => b.id === selectedBookingId)
                    ?.meetingRecording ? (
                  <div className="w-full rounded-lg overflow-hidden">
                    <video
                      src={
                        bookings.find((b) => b.id === selectedBookingId)
                          ?.meetingRecording || ""
                      }
                      controls
                      className="w-full h-auto"
                      preload="metadata"
                      autoPlay
                      onError={() => {
                        setError(
                          "Failed to load video. Please try again later."
                        );
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    No video recording available for this session.
                  </p>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Assessment Report</h2>
            <button onClick={closeReportModal}>
              <X className="w-6 h-6 cursor-pointer text-gray-800 hover:text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <AssessmentReport bookingId={selectedBookingId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
