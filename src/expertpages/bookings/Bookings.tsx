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
import { Textarea } from "@/components/ui/textarea";
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

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

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

  const isPaid = (booking: Booking) => {
    return booking.status === "SCHEDULED";
  };

  const canGoLive = (booking: Booking) => {
    if (booking.service?.serviceId !== "2") return false;

    if (!isPaid(booking)) return false;

    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHours, startMinutes, 0, 0);

    const sessionEnd = new Date(sessionDate);
    if (endHours < startHours) {
      sessionEnd.setDate(sessionEnd.getDate() + 1);
    }
    sessionEnd.setHours(endHours, endMinutes, 0, 0);

    const goLiveTime = new Date(sessionStart.getTime() - 10 * 60 * 1000);
    const isSessionOver = now > sessionEnd;
    const isTooEarly = now < goLiveTime;
    const canGoLiveNow = !isTooEarly && !isSessionOver;

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

    return sessionStart >= now && sessionStart <= next7Days;
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

  const isSessionOver = (booking: Booking) => {
    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHours, endMinutes, 0, 0);

    return now > sessionEnd;
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

      const expertUID = agoraCredentials.uid;

      const agoraConfig: AgoraCredentials = {
        channel: agoraCredentials.channel,
        token: agoraCredentials.token,
        uid: expertUID,
      };
      console.log(agoraConfig);

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

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  const handleReviewClick = (bookingId: string) => {
    openReviewModal(bookingId);
  };

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
      setRescheduleDate(booking.date.split("T")[0]);
      setRescheduleStartTime(booking.startTime);
      setRescheduleEndTime(booking.endTime);
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
    setRescheduleStartTime("");
    setRescheduleEndTime("");
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
      !rescheduleStartTime ||
      !rescheduleEndTime
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

      const rescheduleData = {
        date: rescheduleDate,
        startTime: rescheduleStartTime,
        endTime: rescheduleEndTime,
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
                date: `${rescheduleDate}T00:00:00.000Z`,
                startTime: rescheduleStartTime,
                endTime: rescheduleEndTime,
              }
            : booking
        )
      );

      if (selectedBooking && selectedBooking.id === bookingToReschedule) {
        setSelectedBooking({
          ...selectedBooking,
          status: "RESCHEDULED",
          date: `${rescheduleDate}T00:00:00.000Z`,
          startTime: rescheduleStartTime,
          endTime: rescheduleEndTime,
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

  const openReviewModal = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setSelectedBookingId(bookingId);
    setReviewText(booking?.review || "");
    setIsReviewModalOpen(true);
    setIsBookingDetailsOpen(false);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBookingId(null);
    setReviewText("");
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingId) return;

    setSubmittingReview(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/booking/${selectedBookingId}/review`,
        { review: reviewText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, review: reviewText }
            : booking
        )
      );

      if (selectedBooking && selectedBooking.id === selectedBookingId) {
        setSelectedBooking({ ...selectedBooking, review: reviewText });
      }

      closeReviewModal();
    } catch (error) {
      setError("Failed to submit review. Please try again.");
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
      case "COMPLETED":
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

  const formatDate = (dateStr: string, startTime: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const [hours, minutes] = startTime.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${formattedDate} at ${hour}:${minutes}${ampm}`;
  };

  const truncateUsername = (username: string, maxLength: number = 15) => {
    if (username.length <= maxLength) return username;
    return `${username.substring(0, maxLength)}...`;
  };

  const matchesDateFilter = (booking: Booking) => {
    if (!dateFilter) return true;

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);

    return bookingDate.getTime() === filterDate.getTime();
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
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>

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

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Live Sessions</h2>
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
                      src={
                        booking.player?.photo ||
                        `https://i.pravatar.cc/60?u=${booking.playerId}`
                      }
                      alt={booking.player?.username}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://i.pravatar.cc/60?u=${booking.playerId}`;
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
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  ${booking.service?.price || "N/A"}
                </span>

                {canGoLive(booking) ? (
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

              {isSessionToday(booking) &&
                !canGoLive(booking) &&
                booking.status === "SCHEDULED" && (
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
          {activeSessionsForCompletion.map((booking) => (
            <div
              key={`complete-${booking.id}`}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => openBookingDetails(booking)}
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <img
                  src={
                    booking.player?.photo ||
                    `https://i.pravatar.cc/60?u=${booking.playerId}`
                  }
                  alt="Player"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://i.pravatar.cc/60?u=${booking.playerId}`;
                  }}
                />
                <div>
                  <p
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      const player = booking.player?.username;
                      localStorage.setItem("viewplayerusername", player || "");
                      navigate("/expert/playerinfo");
                    }}
                  >
                    {booking.player?.username || "Unknown Player"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.service?.service?.name} -{" "}
                    {formatDate(booking.date, booking.startTime)}
                    {isSessionOver(booking) && (
                      <span className="ml-2 text-red-600 font-medium">
                        (Session Ended)
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
          ))}
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
                  className={getPaymentBadgeStyle(selectedBooking.status)}
                >
                  {getPaymentStatus(selectedBooking.status)}
                </Badge>
              </div>

              {isPaid(selectedBooking) &&
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
                  Player Information
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      selectedBooking.player?.photo ||
                      `https://i.pravatar.cc/60?u=${selectedBooking.playerId}`
                    }
                    alt="Player"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://i.pravatar.cc/60?u=${selectedBooking.playerId}`;
                    }}
                  />
                  <div>
                    <h4 className="font-medium">
                      {selectedBooking.player?.username}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Player ID: {selectedBooking.playerId.substring(0, 8)}...
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
                <p className="font-medium break-words">
                  {selectedBooking.service?.service?.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Type: {getServiceTypeName(getServiceType(selectedBooking))}
                </p>
                {selectedBooking.service?.service?.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedBooking.service.service.description}
                  </p>
                )}
              </div>

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
                  {formatDate(selectedBooking.date, selectedBooking.startTime)}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Duration:</span>{" "}
                  {selectedBooking.startTime} - {selectedBooking.endTime}
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
                {selectedBooking.meetLink && (
                  <p className="mb-1 flex items-start">
                    <FontAwesomeIcon
                      icon={faLink}
                      className="mr-2 mt-1 text-gray-600"
                    />
                    <a
                      href={selectedBooking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedBooking.meetLink}
                    </a>
                  </p>
                )}
              </div>

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
                              Uploaded by: {selectedBooking.player?.username}
                            </p>
                            <p>
                              Date:{" "}
                              {new Date(
                                selectedBooking.createdAt
                              ).toLocaleDateString()}
                            </p>
                            {selectedBooking.description && (
                              <div className="mt-2">
                                <p className="font-medium">Description:</p>
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

              {selectedBooking.review && (
                <div className="mb-5 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="mr-2 text-yellow-500"
                    />
                    Your Review
                  </h3>
                  <p className="text-gray-700 italic">
                    "{selectedBooking.review}"
                  </p>
                  <button
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => openReviewModal(selectedBooking.id)}
                  >
                    Edit Review
                  </button>{" "}
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
            </div>

            <DialogFooter className="flex flex-wrap gap-2 justify-end">
              {isPaid(selectedBooking) &&
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
                    onClick={() => openRejectConfirmDialog(selectedBooking.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                    onClick={() => openRescheduleModal(selectedBooking.id)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                    Reschedule
                  </Button>
                  <Button
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={() => openAcceptConfirmDialog(selectedBooking.id)}
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
                    onClick={() => openRescheduleModal(selectedBooking.id)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
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
                    onClick={() => handleCompleteBooking(selectedBooking.id)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Mark Completed
                  </Button>
                </>
              )}

              {selectedBooking.status === "COMPLETED" &&
                !selectedBooking.review && (
                  <Button
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                    onClick={() => openReviewModal(selectedBooking.id)}
                  >
                    <FontAwesomeIcon icon={faStar} className="mr-2" />
                    Add Review
                  </Button>
                )}

              <Button
                variant="outline"
                onClick={closeBookingDetails}
                className="ml-2"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                  {bookings.find((b) => b.id === selectedBookingId)?.service
                    ?.service?.name || "Service"}{" "}
                  with{" "}
                  {bookings.find((b) => b.id === selectedBookingId)?.player
                    ?.username || "Player"}{" "}
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
                <p className="text-sm">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(
                    bookings.find((b) => b.id === bookingToReject)?.date || "",
                    bookings.find((b) => b.id === bookingToReject)?.startTime ||
                      ""
                  )}
                </p>
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
                <p className="text-sm">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(
                    bookings.find((b) => b.id === bookingToAccept)?.date || "",
                    bookings.find((b) => b.id === bookingToAccept)?.startTime ||
                      ""
                  )}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Price:</span> $
                  {bookings.find((b) => b.id === bookingToAccept)?.service
                    ?.price || "N/A"}
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
                <p className="text-sm">
                  <span className="font-semibold">Current Date:</span>{" "}
                  {bookings.find((b) => b.id === bookingToReschedule) &&
                    formatDate(
                      bookings.find((b) => b.id === bookingToReschedule)
                        ?.date || "",
                      bookings.find((b) => b.id === bookingToReschedule)
                        ?.startTime || ""
                    )}
                </p>
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
