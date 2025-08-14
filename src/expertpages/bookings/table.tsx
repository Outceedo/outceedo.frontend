import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faCalendarAlt,
  faVideo,
  faFileAlt,
  faStar,
  faVideoCamera,
  faLaptop,
  faChalkboardTeacher,
  faInfoCircle,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";
import AssessmentEvaluationForm from "../evaluation";
import { FaWindowClose } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";
import AssessmentReport from "../../Pages/common/AssessmentReport";

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
  price?: number;
  paymentIntentId?: string | null;
  paymentIntentClientSecret?: string | null;
  agora?: any;
  playerMarkedComplete?: boolean;
  expertMarkedComplete?: boolean;
}

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  onBookingClick: (booking: Booking) => void;
  onAcceptBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onRescheduleBooking: (bookingId: string) => void;
  onPlayerClick: (username: string) => void;
  onVideoClick: (booking: Booking) => void;
  onReviewClick: (bookingId: string) => void;
}

interface ReportData {
  category: {
    id: string;
    name: string;
    description: string;
  };
  id: string;
  bookingId: string;
  attributes: Record<string, any>;
  overallScore: number;
  assessedAt: string;
  player: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
  };
  expert: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
  };
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  loading,
  onBookingClick,
  onAcceptBooking,
  onRejectBooking,
  onRescheduleBooking,
  onPlayerClick,
  onVideoClick,
}) => {
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalBooking, setEvalBooking] = useState<Booking | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const getServiceType = (booking: Booking): string => {
    if (booking.service?.serviceId === "1") {
      return "recorded-video";
    } else if (booking.service?.serviceId === "2") {
      return "online";
    } else if (booking.service?.serviceId === "3") {
      return "in-person";
    } else if (booking.service?.serviceId === "4") {
      return "on-ground";
    }
    return "other";
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "recorded-video":
        return faVideoCamera;
      case "online":
        return faLaptop;
      case "in-person":
        return faChalkboardTeacher;
      case "on-ground":
        return faChalkboardTeacher;
      default:
        return faInfoCircle;
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

  // Updated to use startAt (ISO) and timezone
  const formatDate = (startAt: string, timezone?: string) => {
    const date = new Date(startAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const hours = date.getHours();
    const minutes = date.getMinutes();
    let hour = hours % 12;
    hour = hour ? hour : 12;
    const ampm = hours >= 12 ? "pm" : "am";
    const mins = minutes.toString().padStart(2, "0");

    return `${formattedDate} ${hour}:${mins}${ampm}`;
  };

  const truncateUsername = (username: string, maxLength: number = 15) => {
    if (username.length <= maxLength) return username;
    return `${username.substring(0, maxLength)}...`;
  };

  const isRecordedVideoAssessment = (booking: Booking) => {
    return booking.service?.service?.id === "1" && booking.recordedVideo;
  };

  const fetchReportData = async (bookingId: string) => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/api/v1/user/reports/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setReportData(response.data);
          return true;
        } else {
          setReportData([]);
          return false;
        }
      }
      return false;
    } catch (error) {
      setReportData([]);
      return false;
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    booking: Booking
  ) => {
    e.stopPropagation();
    setSelectedBookingId(booking.id);

    const success = await fetchReportData(booking.id);
    if (success) {
      setIsReportOpen(true);
    } else {
      handleOpenEvaluation(e, booking);
    }
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId("");
    setReportData([]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  const handleOpenEvaluation = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    booking: Booking
  ) => {
    e.stopPropagation();
    if (booking.player?.username) {
      localStorage.setItem("playerName", booking.player.username);
    }
    if (booking.player?.photo) {
      localStorage.setItem("playerPhoto", booking.player.photo);
    }
    if (booking.service?.service?.name) {
      localStorage.setItem("serviceName", booking.service.service.name);
    }
    if (booking.player?.id) {
      localStorage.setItem("playerId", booking.player.id);
    }
    if (booking.id) {
      localStorage.setItem("bookingId", booking.id);
    }
    setEvalBooking(booking);
    setShowEvalModal(true);
  };

  const handleCloseEvalModal = () => {
    setShowEvalModal(false);
    setEvalBooking(null);
  };

  return (
    <>
      {showEvalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div className="absolute inset-0" onClick={handleCloseEvalModal} />
          <div className="relative z-10 bg-white rounded-xl max-w-4xl w-full mx-4 shadow-xl p-0 flex flex-col">
            <div className="flex justify-end px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseEvalModal}
                title="Close"
              >
                <FaWindowClose />
              </Button>
            </div>
            <AssessmentEvaluationForm onBack={handleCloseEvalModal} />
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
            {reportLoading ? (
              <div className="text-center py-8">Loading report...</div>
            ) : (
              <AssessmentReport
                bookingId={selectedBookingId}
                reportData={reportData}
              />
            )}
          </div>
        </div>
      )}

      
      <div className="rounded-md border w-full">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[140px]">Player</TableHead>
              <TableHead className="w-[160px]">Date</TableHead>
              <TableHead className="w-[140px]">Service</TableHead>
              <TableHead className="w-[80px]">Price</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px]">Payment</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
              <TableHead className="text-center w-[70px]">Session</TableHead>
              <TableHead className="text-center w-[70px]">Report</TableHead>
              <TableHead className="text-center w-[70px]">Claim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onBookingClick(booking)}
                >
                  <TableCell className="font-medium">
                    {booking.id.substring(0, 6)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate max-w-[100px] cursor-pointer hover:text-blue-600"
                        title={booking.player?.username}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerClick(booking.player?.username || "");
                        }}
                      >
                        {truncateUsername(
                          booking.player?.username || "Unknown Player"
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.startAt, booking.timezone)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={getServiceTypeIcon(getServiceType(booking))}
                        className="text-gray-500"
                      />
                      <span
                        className="truncate max-w-[100px]"
                        title={booking.service?.service?.name}
                      >
                        {booking.service?.service?.name || "Unknown Service"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    £{booking.price ?? booking.service?.price ?? "N/A"}
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
                    <div
                      className="flex justify-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptBooking(booking.id);
                        }}
                        title="Accept Booking"
                        disabled={booking.status !== "WAITING_EXPERT_APPROVAL"}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectBooking(booking.id);
                        }}
                        title="Reject Booking"
                        disabled={booking.status !== "WAITING_EXPERT_APPROVAL"}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRescheduleBooking(booking.id);
                        }}
                        title="Reschedule Booking"
                        disabled={
                          !["WAITING_EXPERT_APPROVAL", "ACCEPTED"].includes(
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
                      title={
                        isRecordedVideoAssessment(booking)
                          ? "View Video Assessment"
                          : "Start Video Session"
                      }
                      disabled={
                        !isRecordedVideoAssessment(booking) && !booking.meetLink
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onVideoClick(booking);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faVideo}
                        className={
                          isRecordedVideoAssessment(booking)
                            ? "text-black"
                            : booking.meetLink
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Create/View Report"
                      onClick={(e) => handleReportClick(e, booking)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Claim Payment"
                    >
                      <FontAwesomeIcon icon={faDollar} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default BookingTable;