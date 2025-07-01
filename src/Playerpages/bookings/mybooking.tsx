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
  faLaptop,
  faVideoCamera,
  faChalkboardTeacher,
  faPlay,
  faExpand,
  faCompress,
  faMicrophone,
  faMicrophoneSlash,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import AssessmentReport from "../../Playerpages/AssessmentReport";
import { ArrowLeft, X } from "lucide-react";
import profile from "../../assets/images/avatar.png";
import axios from "axios";
import Swal from "sweetalert2";
import BookingsTable from "./Table";

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
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentModal from "../StripePaymentModal";
import AgoraVideoModal from "./AgoraVideoModal";

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

interface AgoraCredentials {
  channel: string;
  token: string;
  uid: number;
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
  isPaid?: boolean;
  paymentIntentId?: string;
  paymentIntentClientSecret?: string;
  agora?: AgoraCredentials;
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

  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<Booking | null>(null);

  const [isAgoraModalOpen, setIsAgoraModalOpen] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState<Booking | null>(null);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB);

  useEffect(() => {
    setFiltersApplied(
      bookingStatus !== "all" ||
        actionFilter !== "all" ||
        serviceTypeFilter !== "all" ||
        dateFilter !== "" ||
        search !== ""
    );
  }, [bookingStatus, actionFilter, serviceTypeFilter, dateFilter, search]);

  const clearAllFilters = () => {
    setBookingStatus("all");
    setActionFilter("all");
    setServiceTypeFilter("all");
    setDateFilter("");
    setSearch("");
  };

  const hasPaymentIntent = (booking: Booking) => {
    return (
      booking.paymentIntentId &&
      booking.paymentIntentId.trim() !== "" &&
      booking.paymentIntentClientSecret &&
      booking.paymentIntentClientSecret.trim() !== ""
    );
  };

  const needsPayment = (booking: Booking) => {
    return (
      hasPaymentIntent(booking) &&
      booking.status === "ACCEPTED" &&
      !booking.isPaid
    );
  };

  const isPaid = (booking: Booking) => {
    return booking.status === "SCHEDULED";
  };

  const isSessionOver = (booking: Booking) => {
    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHours, endMinutes, 0, 0);

    return now > sessionEnd;
  };

  const canGoLive = (booking: Booking) => {
    if (!isPaid(booking)) return false;

    // Get current local time
    const now = new Date();

    // Parse the booking date (this should be in YYYY-MM-DD format)
    const sessionDate = new Date(booking.date);

    // Parse time correctly
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    // Create session start time in local timezone
    const sessionStart = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
      startHours,
      startMinutes,
      0,
      0
    );

    // Create session end time in local timezone
    const sessionEnd = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
      endHours,
      endMinutes,
      0,
      0
    );

    // Handle sessions that cross midnight (like 11:00 PM - 12:00 AM)
    if (endHours < startHours || (endHours === 0 && startHours > 0)) {
      // Session crosses midnight, add one day to end time
      sessionEnd.setDate(sessionEnd.getDate() + 1);
    }

    // Allow going live 10 minutes before session starts
    const goLiveTime = new Date(sessionStart.getTime() - 10 * 60 * 1000);

    const isSessionOver = now > sessionEnd;
    const isTooEarly = now < goLiveTime;
    const canGoLiveNow = !isTooEarly && !isSessionOver;

    console.log(`Player - Booking ${booking.id}:`, {
      now: now.toISOString(),
      nowLocal: now.toLocaleString(),
      nowTime: `${now.getHours()}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      sessionStart: sessionStart.toISOString(),
      sessionStartLocal: sessionStart.toLocaleString(),
      sessionStartTime: `${sessionStart.getHours()}:${sessionStart
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      sessionEnd: sessionEnd.toISOString(),
      sessionEndLocal: sessionEnd.toLocaleString(),
      sessionEndTime: `${sessionEnd.getHours()}:${sessionEnd
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      goLiveTime: goLiveTime.toISOString(),
      goLiveTimeLocal: goLiveTime.toLocaleString(),
      goLiveTimeFormatted: `${goLiveTime.getHours()}:${goLiveTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      isSessionOver,
      isTooEarly,
      canGoLive: canGoLiveNow,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      crossesMidnight:
        endHours < startHours || (endHours === 0 && startHours > 0),
      bookingDate: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });

    return canGoLiveNow;
  };

  const isUpcomingSession = (booking: Booking) => {
    if (!isPaid(booking)) return false;

    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHours, startMinutes, 0, 0);

    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
      sessionStart >= now &&
      sessionStart <= next7Days &&
      !isSessionOver(booking)
    );
  };

  const isSessionToday = (booking: Booking) => {
    const today = new Date();
    const sessionDate = new Date(booking.date);

    return (
      today.getFullYear() === sessionDate.getFullYear() &&
      today.getMonth() === sessionDate.getMonth() &&
      today.getDate() === sessionDate.getDate()
    );
  };

  const getTimeUntilGoLive = (booking: Booking) => {
    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHours, startMinutes, 0, 0);

    const goLiveTime = new Date(sessionStart.getTime() - 10 * 60 * 1000);
    const timeDiff = goLiveTime.getTime() - now.getTime();

    if (timeDiff <= 0) return null;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleVideoError = () => {
    setVideoError(
      "Failed to load video. The URL might be invalid or the video may no longer be available."
    );
  };

  const getServiceType = (booking: Booking): string => {
    if (booking.service?.serviceId === "1") {
      return "recorded-video";
    } else if (booking.service?.serviceId === "2") {
      return "online";
    } else if (booking.service?.serviceId === "3") {
      return "in-person";
    }
    return "other";
  };

  const getServiceTypeName = (type: string): string => {
    switch (type) {
      case "recorded-video":
        return "RECORDED VIDEO ASSESSMENT";
      case "online":
        return "ONLINE TRAINING";
      case "in-person":
        return "ON GROUND ASSESSMENT";
      case "other":
      default:
        return "ONLINE ASSESSMENT";
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_BASE_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setBookings(response.data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(
          "Could not connect to server. Please try refreshing the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setVideoError(null);
    setIsBookingDetailsOpen(true);
  };

  const closeBookingDetails = () => {
    setIsBookingDetailsOpen(false);
    setSelectedBooking(null);
    setVideoError(null);
  };

  const handlePayment = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      setError("Booking not found");
      return;
    }

    if (!hasPaymentIntent(booking)) {
      setError(
        "Payment not available for this booking. Please contact support."
      );
      return;
    }

    setSelectedBookingForPayment(booking);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (
    bookingId: string,
    paymentResult: any
  ) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              isPaid: true,
              status: "SCHEDULED",
            }
          : booking
      )
    );

    if (selectedBooking?.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        isPaid: true,
        status: "SCHEDULED",
      });
    }

    setError(null);

    await Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      text: "Your booking has been confirmed. You will receive a confirmation email shortly.",
      confirmButtonText: "Great!",
      confirmButtonColor: "#10B981",
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(`Payment failed: ${errorMessage}`);

    Swal.fire({
      icon: "error",
      title: "Payment Failed",
      text: errorMessage,
      confirmButtonText: "Try Again",
      confirmButtonColor: "#EF4444",
      timer: 3000,
    });
  };

  const handleGoLive = (booking: Booking) => {
    if (!booking.agora) {
      Swal.fire({
        icon: "error",
        title: "Meeting Setup Error",
        text: "Meeting credentials are not available. Please contact support.",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    if (!canGoLive(booking)) {
      if (isSessionOver(booking)) {
        Swal.fire({
          icon: "info",
          title: "Session Ended",
          text: "This session has already ended. Please book a new session if you need further assistance.",
          confirmButtonColor: "#6B7280",
        });
        return;
      }

      const timeUntil = getTimeUntilGoLive(booking);
      Swal.fire({
        icon: "info",
        title: "Meeting Not Available Yet",
        text: timeUntil
          ? `You can join the meeting in ${timeUntil}. The meeting will be available 10 minutes before the session starts.`
          : "This meeting is no longer available.",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    setActiveVideoCall(booking);
    setIsAgoraModalOpen(true);
    setIsBookingDetailsOpen(false);
  };

  const handleEndCall = () => {
    setIsAgoraModalOpen(false);
    setActiveVideoCall(null);
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
      case "SCHEDULED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "WAITING_EXPERT_APPROVAL":
      case "PENDING":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPaymentBadgeStyle = (booking: Booking) => {
    if (isPaid(booking)) {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    }

    switch (booking.status) {
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "WAITING_EXPERT_APPROVAL":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "ACCEPTED":
        return needsPayment(booking)
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          : "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "SCHEDULED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPaymentStatusText = (booking: Booking) => {
    if (isPaid(booking)) {
      return "Paid";
    }

    switch (booking.status) {
      case "REJECTED":
      case "CANCELLED":
        return "Not Paid";
      case "WAITING_EXPERT_APPROVAL":
        return "Awaiting Approval";
      case "ACCEPTED":
        return needsPayment(booking) ? "Pay Now" : "Awaiting Payment Setup";
      case "SCHEDULED":
        return "Paid";
      default:
        return "Pending";
    }
  };

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

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr: string, startTime: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const [hours, minutes] = startTime.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${formattedDate} at ${hour}:${minutes}${ampm}`;
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      hour = hour ? hour : 12;
      return `${hour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const matchesDateFilter = (booking: Booking) => {
    if (!dateFilter) return true;

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);

    return bookingDate.getTime() === filterDate.getTime();
  };

  const matchesActionFilter = (booking: Booking) => {
    if (actionFilter === "all") return true;

    if (
      actionFilter === "accepted" &&
      (booking.status === "ACCEPTED" || booking.status === "CONFIRMED")
    )
      return true;
    if (actionFilter === "rejected" && booking.status === "REJECTED")
      return true;
    if (
      actionFilter === "waiting" &&
      booking.status === "WAITING_EXPERT_APPROVAL"
    )
      return true;
    if (actionFilter === "scheduled" && booking.status === "SCHEDULED")
      return true;

    return false;
  };

  const matchesServiceTypeFilter = (booking: Booking) => {
    if (serviceTypeFilter === "all") return true;
    return getServiceType(booking) === serviceTypeFilter;
  };

  const filteredBookings = bookings.filter((booking) => {
    const expertName = booking.expert?.username || "";
    const matchesSearch = expertName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      bookingStatus === "all" ||
      (bookingStatus === "PAID" && isPaid(booking)) ||
      (bookingStatus === "NOT_PAID" &&
        booking.status === "WAITING_EXPERT_APPROVAL") ||
      (bookingStatus === "PENDING" &&
        ["ACCEPTED", "CONFIRMED"].includes(booking.status));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateFilter(booking) &&
      matchesActionFilter(booking) &&
      matchesServiceTypeFilter(booking)
    );
  });

  const upcomingPaidSessions = bookings
    .filter((booking) => {
      return (
        isPaid(booking) &&
        isUpcomingSession(booking) &&
        booking.status !== "REJECTED" &&
        booking.status !== "CANCELLED" &&
        booking.status !== "COMPLETED"
      );
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">My Bookings</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
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
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            <SelectItem value="recorded-video">
              RECORDED VIDEO ASSESSMENT
            </SelectItem>
            <SelectItem value="online">ONLINE TRAINING</SelectItem>
            <SelectItem value="in-person">ON GROUND ASSESSMENT</SelectItem>
            <SelectItem value="other">ONLINE ASSESSMENT</SelectItem>
          </SelectContent>
        </Select>

        {filtersApplied && (
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-600 hover:text-red-600"
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

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : (
        <BookingsTable
          bookings={filteredBookings}
          visibilityMap={visibilityMap}
          onOpenBookingDetails={openBookingDetails}
          onOpenVideoModal={openVideoModal}
          onOpenReportModal={openReportModal}
          onToggleVisibility={toggleVisibility}
        />
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Paid Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingPaidSessions.slice(0, 6).map((booking) => (
            <div
              key={`upcoming-${booking.id}`}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => openBookingDetails(booking)}
            >
              <div className="flex justify-between items-start mb-3">
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
                  <div className="flex items-center gap-2">
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
                      onClick={(e) => {
                        e.stopPropagation();
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
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                    Paid ✓
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {formatShortDate(booking.date)}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </div>
                <div className="flex items-center gap-2">
                  {isSessionToday(booking) && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Today
                    </Badge>
                  )}
                  {canGoLive(booking) && (
                    <Badge className="bg-green-100 text-green-800 text-xs animate-pulse">
                      Live Now
                    </Badge>
                  )}
                  {isSessionOver(booking) && (
                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                      Session Ended
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  ${booking.service?.price || "N/A"}
                </span>

                {isSessionOver(booking) ? (
                  <Button
                    className="bg-gray-300 text-gray-600 text-sm px-3 py-1 h-auto cursor-not-allowed"
                    disabled
                  >
                    Session Ended
                  </Button>
                ) : canGoLive(booking) ? (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 h-auto flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoLive(booking);
                    }}
                  >
                    <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                    Go Live
                  </Button>
                ) : booking.agora ? (
                  <div className="text-right">
                    <Button
                      className="bg-gray-300 text-gray-600 text-sm px-3 py-1 h-auto cursor-not-allowed"
                      disabled
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        className="w-3 h-3 mr-1"
                      />
                      {getTimeUntilGoLive(booking) || "Not Available"}
                    </Button>
                    {getTimeUntilGoLive(booking) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Available in {getTimeUntilGoLive(booking)}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    className="bg-gray-300 text-gray-600 text-sm px-3 py-1 h-auto cursor-not-allowed"
                    disabled
                  >
                    Setup Pending
                  </Button>
                )}
              </div>

              {isSessionToday(booking) &&
                !canGoLive(booking) &&
                !isSessionOver(booking) &&
                booking.agora && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    Meeting will be available 10 minutes before session starts
                  </div>
                )}
            </div>
          ))}

          {upcomingPaidSessions.length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="w-12 h-12 mb-3 text-gray-300"
              />
              <p className="text-lg">No upcoming paid sessions</p>
              <p className="text-sm">
                Your confirmed sessions will appear here
              </p>
            </div>
          )}
        </div>
      </div>

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
              <div className="flex justify-between items-center mb-4">
                <Badge
                  variant="outline"
                  className={getActionBadgeStyle(selectedBooking.status)}
                >
                  {formatStatus(selectedBooking.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getPaymentBadgeStyle(selectedBooking)}
                >
                  {getPaymentStatusText(selectedBooking)}
                </Badge>
              </div>

              {isSessionOver(selectedBooking) && (
                <div className="mb-5 p-4 rounded-lg border bg-gray-50 border-gray-200">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 mt-1 flex-shrink-0 text-gray-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Session Ended</p>
                      <p className="text-sm mt-1 text-gray-700">
                        This session ended at{" "}
                        {formatTimeRange(
                          selectedBooking.startTime,
                          selectedBooking.endTime
                        )}{" "}
                        on{" "}
                        {formatDate(
                          selectedBooking.date,
                          selectedBooking.startTime
                        )}
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isPaid(selectedBooking) &&
                selectedBooking.agora &&
                !isSessionOver(selectedBooking) && (
                  <div
                    className={`mb-5 p-4 rounded-lg border ${
                      canGoLive(selectedBooking)
                        ? "bg-green-50 border-green-200"
                        : isSessionToday(selectedBooking)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <FontAwesomeIcon
                        icon={
                          canGoLive(selectedBooking)
                            ? faPlay
                            : isSessionToday(selectedBooking)
                            ? faInfoCircle
                            : faClock
                        }
                        className={`mr-2 mt-1 flex-shrink-0 ${
                          canGoLive(selectedBooking)
                            ? "text-green-600"
                            : isSessionToday(selectedBooking)
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            canGoLive(selectedBooking)
                              ? "text-green-800"
                              : isSessionToday(selectedBooking)
                              ? "text-blue-800"
                              : "text-gray-800"
                          }`}
                        >
                          {canGoLive(selectedBooking)
                            ? "Session is Live Now!"
                            : isSessionToday(selectedBooking)
                            ? "Session Today"
                            : "Upcoming Session"}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            canGoLive(selectedBooking)
                              ? "text-green-700"
                              : isSessionToday(selectedBooking)
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {canGoLive(selectedBooking)
                            ? "Your session is currently live. You can join the video call now."
                            : isSessionToday(selectedBooking)
                            ? `Your session starts at ${formatTimeRange(
                                selectedBooking.startTime,
                                selectedBooking.endTime
                              )}. Video call will be available 10 minutes before the session.`
                            : `Session scheduled for ${formatDate(
                                selectedBooking.date,
                                selectedBooking.startTime
                              )}`}
                        </p>

                        <div className="mt-3">
                          {canGoLive(selectedBooking) ? (
                            <Button
                              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 h-auto flex items-center gap-2"
                              onClick={() => handleGoLive(selectedBooking)}
                            >
                              <FontAwesomeIcon
                                icon={faPlay}
                                className="w-4 h-4"
                              />
                              Go Live Now
                            </Button>
                          ) : getTimeUntilGoLive(selectedBooking) ? (
                            <Button
                              className="bg-gray-300 text-gray-600 text-sm px-4 py-2 h-auto cursor-not-allowed"
                              disabled
                            >
                              <FontAwesomeIcon
                                icon={faClock}
                                className="w-4 h-4 mr-2"
                              />
                              Available in {getTimeUntilGoLive(selectedBooking)}
                            </Button>
                          ) : (
                            <Button
                              className="bg-gray-300 text-gray-600 text-sm px-4 py-2 h-auto cursor-not-allowed"
                              disabled
                            >
                              Session Not Available
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                    {selectedBooking.service?.price || "N/A"}
                  </div>
                </div>
                <h4 className="font-medium mb-2 break-words">
                  {selectedBooking.service?.service?.name || "N/A"}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {getServiceTypeName(getServiceType(selectedBooking))}
                </p>
                <p className="text-gray-600 mb-4">
                  {selectedBooking.service?.service?.description ||
                    "No description available"}
                </p>

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
                    {isSessionToday(selectedBooking) && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                        Today
                      </Badge>
                    )}
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
                      {formatTimeRange(
                        selectedBooking.startTime,
                        selectedBooking.endTime
                      )}
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
                    <div className="flex-1">
                      <p className="font-medium">Meeting Link:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={selectedBooking.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all text-sm"
                        >
                          {selectedBooking.meetLink}
                        </a>
                        {isPaid(selectedBooking) && (
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 h-auto"
                            onClick={() =>
                              window.open(
                                selectedBooking.meetLink,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={faVideo}
                              className="w-3 h-3 mr-1"
                            />
                            Open
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedBooking.status === "WAITING_EXPERT_APPROVAL" && (
                <div className="mb-5 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-2 mt-1 text-amber-600 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-amber-800">
                        Waiting for Expert Approval
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        Your booking request is pending approval from the
                        expert. You will be able to make payment once approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

                      {selectedBooking.service &&
                      selectedBooking.service?.serviceId === "1" ? (
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

                {selectedBooking.paymentIntentId && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment ID:</span>{" "}
                    {selectedBooking.paymentIntentId}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-wrap gap-3 justify-end">
              {isPaid(selectedBooking) &&
                canGoLive(selectedBooking) &&
                selectedBooking.agora &&
                !isSessionOver(selectedBooking) && (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                    onClick={() => handleGoLive(selectedBooking)}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Go Live Now
                  </Button>
                )}

              {needsPayment(selectedBooking) && (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handlePayment(selectedBooking.id)}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Pay Now (${selectedBooking.service?.price})
                </Button>
              )}

              {selectedBooking.status === "WAITING_EXPERT_APPROVAL" && (
                <Button
                  className="bg-gray-300 text-gray-600 cursor-not-allowed"
                  disabled
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Awaiting Expert Approval
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

      {selectedBookingForPayment && (
        <StripePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBookingForPayment(null);
          }}
          booking={selectedBookingForPayment}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          stripePromise={stripePromise}
        />
      )}

      {activeVideoCall && (
        <AgoraVideoModal
          isOpen={isAgoraModalOpen}
          onClose={handleEndCall}
          booking={activeVideoCall}
        />
      )}
    </div>
  );
};

export default MyBooking;
