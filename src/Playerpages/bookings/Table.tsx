import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faFileAlt,
  faEye,
  faEyeSlash,
  faVideoCamera,
  faLaptop,
  faChalkboardTeacher,
  faInfoCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
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
import { X } from "lucide-react";
import axios from "axios";
import profile from "../../assets/images/avatar.png";
import AssessmentReport from "../../Pages/common/AssessmentReport";
import Swal from "sweetalert2";

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
  startAt: string;
  endAt: string;
  timezone: string;
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
  price?: number;
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

interface BookingsTableProps {
  bookings: Booking[];
  visibilityMap: { [id: string]: boolean };
  onOpenBookingDetails: (booking: Booking) => void;
  onOpenVideoModal: (id: string, e?: React.MouseEvent) => void;
  onOpenReportModal: (id: string, e?: React.MouseEvent) => void;
  onToggleVisibility: (id: string, e?: React.MouseEvent) => void;
  onReviewClick: (bookingId: string) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  visibilityMap,
  onOpenBookingDetails,
  onOpenVideoModal,
  onToggleVisibility,
  onReviewClick,
}) => {
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
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
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
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
      case "COMPLETED":
        return "Paid";
      default:
        return "Pending";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // New: format date from startAt
  const formatShortDate = (startAt: string, timezone?: string) => {
    const date = new Date(startAt);
    // Optionally, you can use timezone param if you want
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExpertClick = (expertUsername: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("viewexpertusername", expertUsername);
    navigate("/player/exdetails");
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

  const handleReportClick = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookingId(bookingId);

    const success = await fetchReportData(bookingId);
    if (success) {
      setIsReportOpen(true);
    } else {
      Swal.fire({
        icon: "info",
        title: "No Report Available",
        text: "There is no assessment report available for this booking yet.",
      });
    }
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId("");
    setReportData([]);
  };

  return (
    <>
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
              <TableHead className="text-center w-[70px]">Review</TableHead>
              <TableHead className="text-center w-[70px]">View</TableHead>
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
                  onClick={() => onOpenBookingDetails(booking)}
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
                        className="truncate max-w-[80px] hover:text-blue-600 cursor-pointer"
                        title={booking.expert?.username || "Unknown Expert"}
                        onClick={(e) =>
                          handleExpertClick(booking.expert?.username || "", e)
                        }
                      >
                        {truncateText(
                          booking.expert?.username || "Unknown Expert",
                          12
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatShortDate(booking.startAt, booking.timezone)},
                    {booking.timezone}
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
                  <TableCell>£{booking.price || "N/A"}</TableCell>
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
                      className={getPaymentBadgeStyle(booking)}
                    >
                      {getPaymentStatusText(booking)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => onOpenVideoModal(booking.id, e)}
                      disabled={
                        booking.service
                          ? booking.service.service.id !== "1"
                          : true
                      }
                    >
                      <FontAwesomeIcon icon={faVideo} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => handleReportClick(booking.id, e)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewClick(booking.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => onToggleVisibility(booking.id, e)}
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
    </>
  );
};

export default BookingsTable;
