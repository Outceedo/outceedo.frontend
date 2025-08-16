import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faTimes,
  faCalendarAlt,
  faVideo,
  faStar,
  faCheckCircle,
  faUser,
  faMoneyBill,
  faClock,
  faMapMarkerAlt,
  faLink,
  faExclamationTriangle,
  faPager,
  faTrash,
  faLaptop,
  faVideoCamera,
  faChalkboardTeacher,
  faInfoCircle,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import BookingTable from "./table";
import AgoraVideoModal from "./AgoraVideoModal";
import avatar from "@/assets/images/avatar.png";

interface Expert {
  id: string;
  username: string;
  photo: string | null;
}

interface Player {
  id: string;
  username: string;
  photo: string | null;
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
  startAt: string;
  endAt: string;
  timezone: string;
  location: string | null;
  meetLink: string | null;
  recordedVideo: string | null;
  meetingRecording: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  expert: Expert;
  player: Player;
  service: Service;
  review?: string;
  paymentIntentId?: string;
  paymentIntentClientSecret?: string;
  agora?: AgoraCredentials;
  expertMarkedComplete?: boolean;
  playerMarkedComplete?: boolean;
  price?: number;
}

const BookingExpertside: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);

  const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);
  const [bookingToAccept, setBookingToAccept] = useState<string | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<string | null>(
    null
  );
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartAt, setRescheduleStartAt] = useState("");
  const [rescheduleEndAt, setRescheduleEndAt] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");

  const [isFullscreenVideoOpen, setIsFullscreenVideoOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isAgoraModalOpen, setIsAgoraModalOpen] = useState(false);
  const [agora, setAgora] = useState<AgoraCredentials | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;
  const navigate = useNavigate();

  useEffect(() => {
    setFiltersApplied(
      bookingStatus !== "all" ||
        actionFilter !== "all" ||
        serviceTypeFilter !== "all" ||
        dateFilter !== "" ||
        search !== ""
    );
  }, [bookingStatus, actionFilter, serviceTypeFilter, dateFilter, search]);

  const isRecordedVideoAssessment = (booking: Booking) => {
    return booking.service?.service?.id === "1" && booking.recordedVideo;
  };

  const isPaid = (booking: Booking) => booking.status === "SCHEDULED";
  const canGoLive = (booking: Booking): boolean => {
    if (!booking) return false;
    if (booking.service?.serviceId !== "2") return false;
    if (!isPaid(booking)) return false;

    try {
      const now = new Date();
      const sessionStart = new Date(booking.startAt);
      const sessionEnd = new Date(booking.endAt);

      // Calculate go-live time (10 minutes before session start)
      const goLiveTime = new Date(sessionStart.getTime() - 10 * 60 * 1000);

      // Use UTC timestamps for accurate comparison
      const nowTime = now.getTime();
      const goLiveTimestamp = goLiveTime.getTime();
      const sessionEndTimestamp = sessionEnd.getTime();

      const isOver = nowTime > sessionEndTimestamp;
      const isTooEarly = nowTime < goLiveTimestamp;

      return !isTooEarly && !isOver;
    } catch (error) {
      console.warn("Error checking if can go live:", error);
      return false;
    }
  };

  const isUpcomingSession = (booking: Booking): boolean => {
    if (!booking || !isPaid(booking)) return false;

    try {
      const now = new Date();
      const sessionStart = new Date(booking.startAt);
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const nowTime = now.getTime();
      const sessionStartTime = sessionStart.getTime();
      const next7DaysTime = next7Days.getTime();

      return (
        sessionStartTime >= nowTime &&
        sessionStartTime <= next7DaysTime &&
        !isSessionOver(booking)
      );
    } catch (error) {
      console.warn("Error checking if upcoming session:", error);
      return false;
    }
  };

  const isSessionToday = (booking: Booking): boolean => {
    if (!booking?.startAt) return false;

    try {
      const now = new Date();

      if (booking.timezone) {
        // Get today's date in the booking's timezone
        const todayInTz = new Date(
          now.toLocaleString("en-US", { timeZone: booking.timezone })
        );
        const sessionInTz = new Date(
          new Date(booking.startAt).toLocaleString("en-US", {
            timeZone: booking.timezone,
          })
        );

        return (
          todayInTz.getFullYear() === sessionInTz.getFullYear() &&
          todayInTz.getMonth() === sessionInTz.getMonth() &&
          todayInTz.getDate() === sessionInTz.getDate()
        );
      } else {
        const sessionDate = new Date(booking.startAt);
        return (
          now.getFullYear() === sessionDate.getFullYear() &&
          now.getMonth() === sessionDate.getMonth() &&
          now.getDate() === sessionDate.getDate()
        );
      }
    } catch (error) {
      console.warn("Error checking if session is today:", error);
      return false;
    }
  };

  const getTimeUntilGoLive = (booking: Booking): string | null => {
    if (!booking?.startAt) return null;

    try {
      const now = new Date();
      const sessionStart = new Date(booking.startAt);
      const goLiveTime = new Date(sessionStart.getTime() - 10 * 60 * 1000);

      const timeDiff = goLiveTime.getTime() - now.getTime();

      if (timeDiff <= 0) return null;

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      console.warn("Error calculating time until go live:", error);
      return null;
    }
  };

  const isSessionOver = (booking: Booking): boolean => {
    if (!booking?.endAt) return false;

    try {
      const now = new Date();
      const sessionEnd = new Date(booking.endAt);

      // Use UTC timestamps for accurate comparison regardless of timezone
      return now.getTime() > sessionEnd.getTime();
    } catch (error) {
      console.warn("Error checking if session is over:", error);
      return false;
    }
  };

  const handleGoLive = async (booking: Booking) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/booking/${booking.id}/agora-token`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const agoraCredentials = response.data;
      if (
        !agoraCredentials ||
        !agoraCredentials.token ||
        !agoraCredentials.channel ||
        !agoraCredentials.uid
      ) {
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
      const agoraConfig: AgoraCredentials = {
        channel: agoraCredentials.channel,
        token: agoraCredentials.token,
        uid: agoraCredentials.uid,
      };
      setAgora(agoraConfig);
      setBooking(booking);
      setIsAgoraModalOpen(true);
      setIsBookingDetailsOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Failed to get meeting credentials. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleEndCall = () => {
    setIsAgoraModalOpen(false);
    setAgora(null);
    setBooking(null);
  };

  const formatTimeRange = (
    startAt: string,
    endAt: string,
    timezone?: string
  ): string => {
    const formatTime = (iso: string): string => {
      if (!iso) return "Invalid Time";

      try {
        const date = new Date(iso);

        if (timezone) {
          const options: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: timezone,
          };
          return date.toLocaleTimeString("en-US", options);
        } else {
          let hour = date.getHours();
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const ampm = hour >= 12 ? "PM" : "AM";
          hour = hour % 12;
          hour = hour ? hour : 12;
          return `${hour}:${minutes} ${ampm}`;
        }
      } catch (error) {
        console.warn("Error formatting time in formatTimeRange:", error);
        return "Invalid Time";
      }
    };

    return `${formatTime(startAt)} - ${formatTime(endAt)}`;
  };

  const formatShortDate = (iso: string, timezone?: string): string => {
    if (!iso) return "Invalid Date";

    try {
      const date = new Date(iso);
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        ...(timezone && { timeZone: timezone }),
      };

      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.warn("Error formatting short date:", error);
      return "Invalid Date";
    }
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
      default:
        return "ON GROUND TRAINING";
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

  const clearAllFilters = () => {
    setBookingStatus("all");
    setActionFilter("all");
    setServiceTypeFilter("all");
    setDateFilter("");
    setSearch("");
  };

  const openFullscreenVideo = (booking: Booking) => {
    if (isRecordedVideoAssessment(booking)) {
      setVideoError(null);
      setCurrentVideoUrl(booking.recordedVideo);
      setIsFullscreenVideoOpen(true);
    }
  };

  const closeFullscreenVideo = () => {
    setIsFullscreenVideoOpen(false);
    setCurrentVideoUrl(null);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/booking`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(response.data.bookings);
      } catch (err) {
        setError("Could not load bookings. Please try refreshing the page.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleVideoError = () => {
    setVideoError(
      "Failed to load video. The URL might be invalid or the video may no longer be available."
    );
  };

  const handleBookingClick = (booking: Booking) => {
    openBookingDetails(booking);
  };

  const handleAcceptBookingClick = (bookingId: string) => {
    openAcceptConfirmDialog(bookingId);
  };

  const handleRejectBookingClick = (bookingId: string) => {
    openRejectConfirmDialog(bookingId);
  };

  const handleRescheduleBookingClick = (bookingId: string) => {
    openRescheduleModal(bookingId);
  };

  const handlePlayerClick = (username: string) => {
    localStorage.setItem("viewplayerusername", username);
    navigate("/expert/playerinfo");
  };

  const handleVideoClick = (booking: Booking) => {
    if (isRecordedVideoAssessment(booking)) {
      openFullscreenVideo(booking);
    } else if (booking.status === "SCHEDULED" && canGoLive(booking)) {
      handleGoLive(booking);
    } else if (booking.meetLink) {
      window.open(booking.meetLink, "_blank");
    }
  };

  const handleReviewClick = (bookingId: string) => {};

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

  const openRejectConfirmDialog = (bookingId: string) => {
    setBookingToReject(bookingId);
    setIsRejectConfirmOpen(true);
    if (selectedBooking?.id !== bookingId) {
      setIsBookingDetailsOpen(false);
    }
  };

  const closeRejectConfirmDialog = () => {
    setIsRejectConfirmOpen(false);
    setBookingToReject(null);
  };

  const openAcceptConfirmDialog = (bookingId: string) => {
    setBookingToAccept(bookingId);
    setIsAcceptConfirmOpen(true);
    if (selectedBooking?.id !== bookingId) {
      setIsBookingDetailsOpen(false);
    }
  };

  const closeAcceptConfirmDialog = () => {
    setIsAcceptConfirmOpen(false);
    setBookingToAccept(null);
  };

  const openRescheduleModal = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setBookingToReschedule(bookingId);
      setRescheduleDate(booking.startAt.split("T")[0]);
      setRescheduleStartAt(booking.startAt.substring(11, 16));
      setRescheduleEndAt(booking.endAt.substring(11, 16));
      setIsRescheduleModalOpen(true);
      if (selectedBooking?.id !== bookingId) {
        setIsBookingDetailsOpen(false);
      }
    }
  };

  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setBookingToReschedule(null);
    setRescheduleDate("");
    setRescheduleStartAt("");
    setRescheduleEndAt("");
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/booking/${bookingId}/accept`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "ACCEPTED" }
            : booking
        )
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "ACCEPTED" });
      }
      closeAcceptConfirmDialog();
      if (isBookingDetailsOpen) {
        closeBookingDetails();
      }
      await Swal.fire({
        icon: "success",
        title: "Booking Accepted!",
        text: "The booking has been successfully accepted. The player has been notified.",
        confirmButtonColor: "#10B981",
        timer: 2500,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Accept Failed",
        text: "Failed to accept booking. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/booking/${bookingId}/reject`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "REJECTED" }
            : booking
        )
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "REJECTED" });
      }
      closeRejectConfirmDialog();
      closeBookingDetails();
      await Swal.fire({
        icon: "info",
        title: "Booking Rejected",
        text: "The booking has been rejected. The player has been notified.",
        confirmButtonColor: "#6B7280",
        timer: 2500,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Reject Failed",
        text: "Failed to reject booking. Please try again.",
        confirmButtonColor: "#EF4444",
      });
      closeRejectConfirmDialog();
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (
      !bookingToReschedule ||
      !rescheduleDate ||
      !rescheduleStartAt ||
      !rescheduleEndAt
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all the required fields.",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }
    try {
      setRescheduling(true);
      const token = localStorage.getItem("token");
      const startAt = `${rescheduleDate}T${rescheduleStartAt}:00.000Z`;
      const endAt = `${rescheduleDate}T${rescheduleEndAt}:00.000Z`;
      const rescheduleData = {
        startAt,
        endAt,
      };
      await axios.patch(
        `${API_BASE_URL}/booking/${bookingToReschedule}/reschedule`,
        rescheduleData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingToReschedule
            ? {
                ...booking,
                status: "RESCHEDULED",
                startAt,
                endAt,
              }
            : booking
        )
      );
      if (selectedBooking && selectedBooking.id === bookingToReschedule) {
        setSelectedBooking({
          ...selectedBooking,
          status: "RESCHEDULED",
          startAt,
          endAt,
        });
      }
      closeRescheduleModal();
      closeBookingDetails();
      await Swal.fire({
        icon: "success",
        title: "Booking Rescheduled!",
        text: "The booking has been successfully rescheduled. The player will be notified of the changes.",
        confirmButtonColor: "#10B981",
        timer: 3000,
        showConfirmButton: true,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Reschedule Failed",
        text: "Failed to reschedule booking. Please try again or contact support if the problem persists.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/booking/${bookingId}/complete`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "COMPLETED" }
            : booking
        )
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "COMPLETED" });
      }
      closeBookingDetails();
      await Swal.fire({
        icon: "success",
        title: "Session Marked Complete!",
        text: "Thank you for confirming the session completion.",
        confirmButtonColor: "#10B981",
        timer: 2500,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark session as complete. Please try again.",
        confirmButtonColor: "#EF4444",
      });
      setError("Failed to complete booking. Please try again.");
    } finally {
      setLoading(false);
    }
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
      case "SCHEDULED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "SCHEDULED":
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

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Paid";
      case "REJECTED":
      case "CANCELLED":
        return "Not Paid";
      case "SCHEDULED":
        return "Paid";
      default:
        return "Pending";
    }
  };
  const getZonedDate = (iso: string, timezone?: string): Date => {
    if (!iso) return new Date();

    try {
      const date = new Date(iso);

      // If no timezone specified, return the original date
      if (!timezone) return date;

      // Use Intl.DateTimeFormat for accurate timezone conversion
      const formatter = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timezone,
        hour12: false,
      });

      const parts = formatter.formatToParts(date);
      const values: Record<string, string> = {};
      parts.forEach((p) => (values[p.type] = p.value));

      return new Date(
        `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
      );
    } catch (error) {
      console.warn("Error handling timezone in getZonedDate:", error);
      return new Date(iso);
    }
  };

  const formatDate = (iso: string, timezone?: string): string => {
    if (!iso) return "Invalid Date";

    try {
      const date = new Date(iso);

      if (timezone) {
        const dateOptions: Intl.DateTimeFormatOptions = {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: timezone,
        };

        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: timezone,
        };

        const formattedDate = date.toLocaleDateString("en-US", dateOptions);
        const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

        return `${formattedDate} at ${formattedTime}`;
      } else {
        // Fallback to local timezone
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        let hour = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hour >= 12 ? "pm" : "am";
        hour = hour % 12;
        hour = hour ? hour : 12;

        return `${formattedDate} at ${hour}:${minutes}${ampm}`;
      }
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const truncateUsername = (
    username: string,
    maxLength: number = 15
  ): string => {
    if (!username) return "";
    if (username.length <= maxLength) return username;
    return `${username.substring(0, maxLength)}...`;
  };

  const matchesDateFilter = (booking: Booking, dateFilter: string): boolean => {
    if (!dateFilter || !booking?.startAt) return true;

    try {
      if (booking.timezone) {
        const date = new Date(booking.startAt);
        const bookingDate = date.toLocaleDateString("en-CA", {
          timeZone: booking.timezone,
        }); // Returns YYYY-MM-DD format
        return bookingDate === dateFilter;
      } else {
        const bookingDate = new Date(booking.startAt);
        bookingDate.setHours(0, 0, 0, 0);
        const filterDate = new Date(dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === filterDate.getTime();
      }
    } catch (error) {
      console.warn("Error matching date filter:", error);
      return false;
    }
  };

  const matchesServiceTypeFilter = (booking: Booking) => {
    if (serviceTypeFilter === "all") return true;
    return getServiceType(booking) === serviceTypeFilter;
  };

  const filteredBookings = bookings.filter((booking) => {
    const playerName = booking.player?.username || "";
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
        booking.status === "WAITING_EXPERT_APPROVAL") ||
      (actionFilter === "Scheduled" && booking.status === "SCHEDULED");
    return (
      matchesSearch &&
      matchesStatus &&
      matchesAction &&
      matchesDateFilter(booking) &&
      matchesServiceTypeFilter(booking)
    );
  });

  const activeSessionsForCompletion = bookings.filter((booking) => {
    const isScheduled = booking.status === "SCHEDULED";
    const isOverAndPaid =
      isPaid(booking) &&
      isSessionOver(booking) &&
      booking.status !== "COMPLETED";
    return (
      (isScheduled || isOverAndPaid) &&
      booking.status !== "REJECTED" &&
      booking.status !== "CANCELLED" &&
      booking.status !== "COMPLETED" &&
      !booking.expertMarkedComplete
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
      const dateA = new Date(a.startAt);
      const dateB = new Date(b.startAt);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md w-full">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>

      {/* Helper function to check if service is recorded video assessment */}
      {(() => {
        const isRecordedVideoAssessment = (booking) => {
          const serviceType =
            booking?.service?.serviceType ||
            booking?.service?.service?.type ||
            booking?.service?.type ||
            booking?.serviceType;
          const serviceName =
            booking?.service?.service?.name?.toLowerCase() || "";
          const serviceId = booking?.service?.serviceId;

          return (
            serviceId === "1" || // Assuming serviceId "1" is recorded video
            (serviceType && serviceType.toLowerCase() === "recorded-video") ||
            serviceName.includes("recorded video assessment")
          );
        };

        return null; // This is just for the helper function
      })()}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative w-full sm:w-1/5">
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
        <div className="relative sm:w-auto flex min-w-[120px]">
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
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Not Paid">Not Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Re-Scheduled">Re-Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
            className="flex items-center text-red-600 border-red-600"
            onClick={clearAllFilters}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            <span>Clear Filters</span>
          </Button>
        )}
      </div>
      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
          {error}
        </div>
      )}
      <div className="w-xs md:w-full mx-auto">
      <BookingTable
        bookings={filteredBookings}
        loading={loading}
        onBookingClick={handleBookingClick}
        onAcceptBooking={handleAcceptBookingClick}
        onRejectBooking={handleRejectBookingClick}
        onRescheduleBooking={handleRescheduleBookingClick}
        onPlayerClick={handlePlayerClick}
        onVideoClick={handleVideoClick}
        onReviewClick={handleReviewClick}
      />
      </div>
    
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Live Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingPaidSessions.slice(0, 6).map((booking) => {
            const isRecorded = (() => {
              const serviceType =
                booking?.service?.serviceType ||
                booking?.service?.service?.type ||
                booking?.service?.type ||
                booking?.serviceType;
              const serviceName =
                booking?.service?.service?.name?.toLowerCase() || "";
              const serviceId = booking?.service?.serviceId;

              return (
                serviceId === "1" || // Assuming serviceId "1" is recorded video
                (serviceType &&
                  serviceType.toLowerCase() === "recorded-video") ||
                serviceName.includes("recorded video assessment")
              );
            })();

            return (
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
                        src={booking.player?.photo || avatar}
                        alt={booking.player?.username || "Player"}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = avatar;
                        }}
                      />
                      <p
                        className="text-sm text-gray-500 truncate cursor-pointer hover:text-blue-600"
                        title={`with ${booking.player?.username || "Player"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const player = booking.player?.username;
                          localStorage.setItem(
                            "viewplayerusername",
                            player || ""
                          );
                          navigate("/expert/playerinfo");
                        }}
                      >
                        with{" "}
                        {truncateUsername(
                          booking.player?.username || "Player",
                          15
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                      Paid ✓
                    </Badge>
                    {/* Don't show date for recorded video */}
                    {!isRecorded && (
                      <div className="text-xs text-gray-500">
                        {formatShortDate(booking.startAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Don't show time/session info for recorded video */}
                {!isRecorded && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      {formatTimeRange(booking.startAt, booking.endAt)}
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
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    £{booking.price || "N/A"}
                  </span>

                  {/* Different buttons based on service type */}
                  {isRecorded ? (
                    <span className="text-xs text-gray-500 italic bg-gray-100 px-2 py-1 rounded">
                      Assessment ready
                    </span>
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
                  ) : booking.status === "SCHEDULED" ? (
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

                {/* Don't show session timing info for recorded video */}
                {!isRecorded &&
                  isSessionToday(booking) &&
                  !canGoLive(booking) &&
                  booking.status === "SCHEDULED" && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                      Meeting will be available 10 minutes before session starts
                    </div>
                  )}
              </div>
            );
          })}
          {upcomingPaidSessions.length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="w-12 h-12 mb-3 text-gray-300"
              />
              <p className="text-lg">No upcoming live sessions</p>
              <p className="text-sm">
                Your confirmed sessions will appear here
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-medium mb-2">Active Sessions</h3>
        <div className="space-y-2">
          {activeSessionsForCompletion.map((booking) => {
            const isRecorded = (() => {
              const serviceType =
                booking?.service?.serviceType ||
                booking?.service?.service?.type ||
                booking?.service?.type ||
                booking?.serviceType;
              const serviceName =
                booking?.service?.service?.name?.toLowerCase() || "";
              const serviceId = booking?.service?.serviceId;

              return (
                serviceId === "1" || // Assuming serviceId "1" is recorded video
                (serviceType &&
                  serviceType.toLowerCase() === "recorded-video") ||
                serviceName.includes("recorded video assessment")
              );
            })();

            return (
              <div
                key={`complete-${booking.id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => openBookingDetails(booking)}
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <img
                    src={booking.player?.photo || avatar}
                    alt="Player"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = avatar;
                    }}
                  />
                  <div>
                    <p
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        const player = booking.player?.username;
                        localStorage.setItem(
                          "viewplayerusername",
                          player || ""
                        );
                        navigate("/expert/playerinfo");
                      }}
                    >
                      {booking.player?.username || "Unknown Player"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.service?.service?.name}
                      {!isRecorded && (
                        <>
                          {" - "}
                          {formatDate(booking.startAt)}
                          {isSessionOver(booking) && (
                            <span className="ml-2 text-red-600 font-medium">
                              (Session Ended)
                            </span>
                          )}
                        </>
                      )}
                      {isRecorded && (
                        <span className="ml-2 text-blue-600 font-medium">
                          (Assessment Ready)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border-purple-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteBooking(booking.id);
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Mark as Completed
                </Button>
              </div>
            );
          })}
          {activeSessionsForCompletion.length === 0 && (
            <p className="text-gray-500 text-center py-2">
              No active sessions to complete
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800">Total Bookings</h3>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800">Scheduled</h3>
          <p className="text-2xl font-bold">
            {bookings.filter((b) => ["SCHEDULED"].includes(b.status)).length}
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
              {(() => {
                const isRecorded = (() => {
                  const serviceType =
                    selectedBooking?.service?.serviceType ||
                    selectedBooking?.service?.service?.type ||
                    selectedBooking?.service?.type ||
                    selectedBooking?.serviceType;
                  const serviceName =
                    selectedBooking?.service?.service?.name?.toLowerCase() ||
                    "";
                  const serviceId = selectedBooking?.service?.serviceId;

                  return (
                    serviceId === "1" || // Assuming serviceId "1" is recorded video
                    (serviceType &&
                      serviceType.toLowerCase() === "recorded-video") ||
                    serviceName.includes("recorded video assessment")
                  );
                })();

                return (
                  <>
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
                        {getPaymentStatus(selectedBooking.status)}
                      </Badge>
                    </div>

                    {/* Live session info - only for non-recorded video */}
                    {!isRecorded &&
                      isPaid(selectedBooking) &&
                      selectedBooking.status === "SCHEDULED" && (
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
                                  : isSessionOver(selectedBooking)
                                  ? "Session Over"
                                  : null}
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
                                  ? "Your session is currently live. You can start the video call now."
                                  : isSessionToday(selectedBooking)
                                  ? `Your session starts at ${formatTimeRange(
                                      selectedBooking.startAt,
                                      selectedBooking.endAt
                                    )}. Video call will be available 10 minutes before the session.`
                                  : `Session scheduled for ${formatDate(
                                      selectedBooking.startAt
                                    )}`}
                              </p>
                              <div className="mt-3">
                                {canGoLive(selectedBooking) ? (
                                  <Button
                                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 h-auto flex items-center gap-2"
                                    onClick={() =>
                                      handleGoLive(selectedBooking)
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faPlay}
                                      className="w-4 h-4"
                                    />
                                    Start Live Session
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
                                    Available in{" "}
                                    {getTimeUntilGoLive(selectedBooking)}
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

                    {/* Special message for recorded video assessments */}
                    {isRecorded && isPaid(selectedBooking) && (
                      <div className="mb-5 p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-start">
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="mr-2 mt-1 flex-shrink-0 text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-blue-800">
                              Recorded Video Assessment
                            </p>
                            <p className="text-sm mt-1 text-blue-700">
                              This assessment has been submitted and is ready
                              for your evaluation. You can review the video and
                              provide feedback at any time.
                            </p>
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
                        Player Information
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={selectedBooking.player?.photo || avatar}
                          alt="Player"
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = avatar;
                          }}
                        />
                        <div>
                          <h4 className="font-medium">
                            {selectedBooking.player?.username}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Player ID:{" "}
                            {selectedBooking.playerId.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FontAwesomeIcon
                            icon={getServiceTypeIcon(
                              getServiceType(selectedBooking)
                            )}
                            className="mr-2 text-gray-600"
                          />
                          Service Details
                        </h3>
                        <div className="text-lg font-bold text-green-700">
                          <FontAwesomeIcon
                            icon={faMoneyBill}
                            className="mr-1"
                          />
                          £{selectedBooking.price || "N/A"}
                        </div>
                      </div>
                      <p className="font-medium break-words">
                        {selectedBooking.service?.service?.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type:{" "}
                        {getServiceTypeName(getServiceType(selectedBooking))}
                      </p>
                      {selectedBooking.service?.service?.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedBooking.service.service.description}
                        </p>
                      )}
                    </div>

                    {/* Session info - only for non-recorded video */}
                    {!isRecorded && (
                      <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="mr-2 text-gray-600"
                          />
                          Session Information
                        </h3>
                        <p className="mb-1">
                          <span className="font-medium">Date & Time:</span>{" "}
                          {formatDate(selectedBooking.startAt)}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Duration:</span>{" "}
                          {formatTimeRange(
                            selectedBooking.startAt,
                            selectedBooking.endAt
                          )}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Time Zone:</span>{" "}
                          {selectedBooking.timezone}
                        </p>
                        {selectedBooking.location && (
                          <p className="mb-1 flex items-start">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="mr-2 mt-1 text-gray-600"
                            />
                            <span className="break-words">
                              {selectedBooking.location}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Assessment info for recorded video */}
                    {isRecorded && (
                      <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="mr-2 text-gray-600"
                          />
                          Assessment Information
                        </h3>
                        <p className="text-gray-600 mb-2">
                          This is a recorded video assessment that has been
                          submitted by the player for your evaluation.
                        </p>
                      </div>
                    )}

                    {selectedBooking.description && (
                      <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <FontAwesomeIcon
                            icon={faPager}
                            className="mr-2 text-gray-600"
                          />
                          Description
                        </h3>
                        <p className="mb-1 flex items-start">
                          {selectedBooking.description}
                        </p>
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
                          Media
                        </h3>

                        {selectedBooking.recordedVideo && (
                          <div className="mb-2">
                            <p className="font-medium mb-2">Recorded Video:</p>

                            {selectedBooking.service?.serviceId === "1" ? (
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
                                    Uploaded by:{" "}
                                    {selectedBooking.player?.username}
                                  </p>
                                  <p>
                                    Date:{" "}
                                    {new Date(
                                      selectedBooking.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  {selectedBooking.description && (
                                    <div className="mt-2">
                                      <p className="font-medium">
                                        Description:
                                      </p>
                                      <p className="italic">
                                        {selectedBooking.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <a
                                href={selectedBooking.recordedVideo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                View Video
                              </a>
                            )}
                          </div>
                        )}

                        {selectedBooking.meetingRecording && (
                          <div>
                            <p className="font-medium">Meeting Recording:</p>
                            <a
                              href={selectedBooking.meetingRecording}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              View Recording
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      <p>Booking ID: {selectedBooking.id}</p>
                      <p>
                        Created:{" "}
                        {new Date(selectedBooking.createdAt).toLocaleString()}
                      </p>
                      <p>
                        Last Updated:{" "}
                        {new Date(selectedBooking.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <DialogFooter className="flex flex-wrap gap-2 justify-end">
              {(() => {
                const isRecorded = (() => {
                  const serviceType =
                    selectedBooking?.service?.serviceType ||
                    selectedBooking?.service?.service?.type ||
                    selectedBooking?.service?.type ||
                    selectedBooking?.serviceType;
                  const serviceName =
                    selectedBooking?.service?.service?.name?.toLowerCase() ||
                    "";
                  const serviceId = selectedBooking?.service?.serviceId;

                  return (
                    serviceId === "1" || // Assuming serviceId "1" is recorded video
                    (serviceType &&
                      serviceType.toLowerCase() === "recorded-video") ||
                    serviceName.includes("recorded video assessment")
                  );
                })();

                return (
                  <>
                    {/* Go Live button - only for non-recorded video */}
                    {!isRecorded &&
                      isPaid(selectedBooking) &&
                      canGoLive(selectedBooking) &&
                      selectedBooking.status === "SCHEDULED" && (
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                          onClick={() => handleGoLive(selectedBooking)}
                        >
                          <FontAwesomeIcon icon={faPlay} />
                          Start Live Session
                        </Button>
                      )}

                    {selectedBooking.status === "WAITING_EXPERT_APPROVAL" && (
                      <>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() =>
                            openRejectConfirmDialog(selectedBooking.id)
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                          onClick={() =>
                            openRescheduleModal(selectedBooking.id)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-2"
                          />
                          Reschedule
                        </Button>
                        <Button
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={() =>
                            openAcceptConfirmDialog(selectedBooking.id)
                          }
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          Accept
                        </Button>
                      </>
                    )}

                    {selectedBooking.status === "ACCEPTED" && (
                      <>
                        <Button
                          variant="outline"
                          className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                          onClick={() =>
                            openRescheduleModal(selectedBooking.id)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-2"
                          />
                          Reschedule
                        </Button>
                        {selectedBooking.meetLink && (
                          <Button
                            variant="outline"
                            className="border-blue-500 text-blue-500 hover:bg-blue-50"
                            onClick={() =>
                              window.open(selectedBooking.meetLink, "_blank")
                            }
                          >
                            <FontAwesomeIcon icon={faVideo} className="mr-2" />
                            Join Session
                          </Button>
                        )}
                        <Button
                          className="bg-purple-500 text-white hover:bg-purple-600"
                          onClick={() =>
                            handleCompleteBooking(selectedBooking.id)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-2"
                          />
                          Mark Completed
                        </Button>
                      </>
                    )}

                    {selectedBooking.status === "COMPLETED" &&
                      !selectedBooking.review && (
                        <>
                          <Button
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={(e) => {
                              handleEvaluation(e, selectedBooking);
                            }}
                          >
                            Evaluate
                          </Button>
                        </>
                      )}

                    <Button
                      variant="outline"
                      onClick={closeBookingDetails}
                      className="ml-2"
                    >
                      Close
                    </Button>
                  </>
                );
              })()}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isRejectConfirmOpen} onOpenChange={setIsRejectConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Rejection
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {bookingToReject && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  <span className="font-semibold">Player:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToReject)?.player
                      ?.username
                  }
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Service:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToReject)?.service
                      ?.service?.name
                  }
                </p>
                {/* Only show date for non-recorded video */}
                {(() => {
                  const booking = bookings.find(
                    (b) => b.id === bookingToReject
                  );
                  const isRecorded = (() => {
                    const serviceType =
                      booking?.service?.serviceType ||
                      booking?.service?.service?.type ||
                      booking?.service?.type ||
                      booking?.serviceType;
                    const serviceName =
                      booking?.service?.service?.name?.toLowerCase() || "";
                    const serviceId = booking?.service?.serviceId;

                    return (
                      serviceId === "1" || // Assuming serviceId "1" is recorded video
                      (serviceType &&
                        serviceType.toLowerCase() === "recorded-video") ||
                      serviceName.includes("recorded video assessment")
                    );
                  })();

                  return (
                    !isRecorded && (
                      <p className="text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(booking?.startAt || "")}
                      </p>
                    )
                  );
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRejectConfirmDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                bookingToReject && handleRejectBooking(bookingToReject)
              }
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAcceptConfirmOpen} onOpenChange={setIsAcceptConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              Confirm Acceptance
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this booking? You'll be committed
              to providing this service at the scheduled time.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {bookingToAccept && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  <span className="font-semibold">Player:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToAccept)?.player
                      ?.username
                  }
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Service:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToAccept)?.service
                      ?.service?.name
                  }
                </p>
                {/* Only show date for non-recorded video */}
                {(() => {
                  const booking = bookings.find(
                    (b) => b.id === bookingToAccept
                  );
                  const isRecorded = (() => {
                    const serviceType =
                      booking?.service?.serviceType ||
                      booking?.service?.service?.type ||
                      booking?.service?.type ||
                      booking?.serviceType;
                    const serviceName =
                      booking?.service?.service?.name?.toLowerCase() || "";
                    const serviceId = booking?.service?.serviceId;

                    return (
                      serviceId === "1" || // Assuming serviceId "1" is recorded video
                      (serviceType &&
                        serviceType.toLowerCase() === "recorded-video") ||
                      serviceName.includes("recorded video assessment")
                    );
                  })();

                  return (
                    !isRecorded && (
                      <p className="text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(booking?.startAt || "")}
                      </p>
                    )
                  );
                })()}
                <p className="text-sm">
                  <span className="font-semibold">Price:</span> £
                  {bookings.find((b) => b.id === bookingToAccept)?.price ||
                    "N/A"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeAcceptConfirmDialog}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() =>
                bookingToAccept && handleAcceptBooking(bookingToAccept)
              }
            >
              Accept Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              Reschedule Booking
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-4">
              Select a new date and time for this booking session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {bookingToReschedule && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm">
                  <span className="font-semibold">Player:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToReschedule)?.player
                      ?.username
                  }
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Service:</span>{" "}
                  {
                    bookings.find((b) => b.id === bookingToReschedule)?.service
                      ?.service?.name
                  }
                </p>
                {/* Only show current date for non-recorded video */}
                {(() => {
                  const booking = bookings.find(
                    (b) => b.id === bookingToReschedule
                  );
                  const isRecorded = (() => {
                    const serviceType =
                      booking?.service?.serviceType ||
                      booking?.service?.service?.type ||
                      booking?.service?.type ||
                      booking?.serviceType;
                    const serviceName =
                      booking?.service?.service?.name?.toLowerCase() || "";
                    const serviceId = booking?.service?.serviceId;

                    return (
                      serviceId === "1" || // Assuming serviceId "1" is recorded video
                      (serviceType &&
                        serviceType.toLowerCase() === "recorded-video") ||
                      serviceName.includes("recorded video assessment")
                    );
                  })();

                  return (
                    !isRecorded && (
                      <p className="text-sm">
                        <span className="font-semibold">Current Date:</span>{" "}
                        {booking && formatDate(booking?.startAt || "")}
                      </p>
                    )
                  );
                })()}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Date
              </label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={rescheduleStartTime}
                onChange={(e) => setRescheduleStartTime(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={rescheduleEndTime}
                onChange={(e) => setRescheduleEndTime(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end mt-6">
            <Button
              variant="outline"
              onClick={closeRescheduleModal}
              disabled={rescheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleBooking}
              disabled={
                rescheduling ||
                !rescheduleDate ||
                !rescheduleStartTime ||
                !rescheduleEndTime
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {rescheduling ? (
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
                  Rescheduling...
                </>
              ) : (
                "Reschedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isFullscreenVideoOpen &&
        currentVideoUrl &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={closeFullscreenVideo}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </Button>
            </div>

            <div className="w-full h-full max-w-6xl max-h-[80vh] p-4">
              <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
                {videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-red-700 max-w-md">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="mr-2"
                      />
                      <span>{videoError}</span>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    onError={handleVideoError}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <div className="mt-4 text-white text-center">
                <p className="text-sm">
                  If the video doesn't play properly, you can{" "}
                  <a
                    href={currentVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    download it
                  </a>{" "}
                  and play it locally.
                </p>
                <div className="flex justify-end">
                  <Button
                    className="bg-red-500 hover:bg-red-600 w-24"
                    onClick={closeFullscreenVideo}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {agora && booking && (
        <AgoraVideoModal
          isOpen={isAgoraModalOpen}
          onClose={handleEndCall}
          agora={agora}
          booking={booking}
        />
      )}
    </div>
  );
};

export default BookingExpertside;
