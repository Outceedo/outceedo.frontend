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

interface Expert {
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
  expert?: Expert;
  service?: Service;
}

const MyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [experts, setExperts] = useState<{ [key: string]: Expert }>({});
  const [services, setServices] = useState<{ [key: string]: Service }>({});
  const [bookingStatus, setBookingStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const [visibilityMap, setVisibilityMap] = useState<{ [id: string]: boolean }>(
    {}
  );

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Dummy data for demonstration when API fails
  const dummyBookings: Booking[] = [
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
    },
    {
      id: "c2b3d4e5-f6g7-8901-hijk-lm2345678901",
      playerId: "p1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
      expertId: "e2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
      serviceId: "s2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
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
    },
  ];

  // Dummy expert data
  const dummyExperts: { [key: string]: Expert } = {
    "e1a2b3c4-d5e6-7890-fghi-jklmnopqrst1": {
      id: "e1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
      name: "John Smith",
      profileImage: "https://i.pravatar.cc/150?u=john",
    },
    "e2b3c4d5-e6f7-8901-ijkl-mnopqrstu2": {
      id: "e2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
      name: "Emma Johnson",
      profileImage: "https://i.pravatar.cc/150?u=emma",
    },
    "e3c4d5e6-f7g8-9012-jklm-nopqrstuv3": {
      id: "e3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
      name: "Miguel Rodriguez",
      profileImage: "https://i.pravatar.cc/150?u=miguel",
    },
    "e4d5e6f7-g8h9-0123-klmn-opqrstuvw4": {
      id: "e4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
      name: "Sarah Lee",
      profileImage: "https://i.pravatar.cc/150?u=sarah",
    },
  };

  // Dummy service data
  const dummyServices: { [key: string]: Service } = {
    "s1a2b3c4-d5e6-7890-fghi-jklmnopqrst1": {
      id: "s1a2b3c4-d5e6-7890-fghi-jklmnopqrst1",
      name: "Technical Training Session",
      description: "One-on-one technical skills training",
      price: "$35",
    },
    "s2b3c4d5-e6f7-8901-ijkl-mnopqrstu2": {
      id: "s2b3c4d5-e6f7-8901-ijkl-mnopqrstu2",
      name: "Strategy Session",
      description: "Game strategy and tactical analysis",
      price: "$40",
    },
    "s3c4d5e6-f7g8-9012-jklm-nopqrstuv3": {
      id: "s3c4d5e6-f7g8-9012-jklm-nopqrstuv3",
      name: "Field Training",
      description: "On-field practice and drills",
      price: "$45",
    },
    "s4d5e6f7-g8h9-0123-klmn-opqrstuvw4": {
      id: "s4d5e6f7-g8h9-0123-klmn-opqrstuvw4",
      name: "Video Analysis",
      description: "Detailed analysis of gameplay footage",
      price: "$50",
    },
  };

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_BASE_URL, {
          method: "GET",
          withCredentials: true,
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

        // Fetch additional data for experts and services
        // await Promise.all(data.bookings.map(fetchRelatedData));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Could not connect to server. Showing demo data instead.");

        // Set dummy data if API fails
        setBookings(dummyBookings);
        setExperts(dummyExperts);
        setServices(dummyServices);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Fetch related data for each booking (expert and service details)
  // const fetchRelatedData = async (booking: Booking) => {
  //   try {
  //     // Fetch expert data if not already fetched
  //     if (booking.expertId && !experts[booking.expertId]) {
  //       const token = localStorage.getItem("token");
  //       const expertResponse = await fetch(
  //         `${import.meta.env.VITE_PORT}/api/v1/experts/${booking.expertId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (expertResponse.ok) {
  //         const expertData = await expertResponse.json();
  //         setExperts((prev) => ({
  //           ...prev,
  //           [booking.expertId]: {
  //             id: expertData.id,
  //             name: expertData.name || "Unknown Expert",
  //             profileImage: expertData.profileImage,
  //           },
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching related data:", error);
  //   }
  // };

  const openVideoModal = (id: string) => {
    setSelectedBookingId(id);
    setIsVideoOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
    setSelectedBookingId(null);
  };

  const openReportModal = (id: string) => {
    setSelectedBookingId(id);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId(null);
  };

  const toggleVisibility = (id: string) => {
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
      case "PAID":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "NOT_PAID":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "PENDING":
      case "WAITING_EXPERT_APPROVAL":
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

  // Filter bookings based on search and status filter
  const filteredBookings = bookings.filter((booking) => {
    const expertName = experts[booking.expertId]?.name || "";
    const matchesSearch = expertName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      bookingStatus === "all" ||
      (bookingStatus === "PAID" && booking.status === "COMPLETED") ||
      (bookingStatus === "NOT_PAID" &&
        booking.status === "WAITING_EXPERT_APPROVAL") ||
      (bookingStatus === "PENDING" &&
        (booking.status === "CONFIRMED" || booking.status === "ACCEPTED"));

    return matchesSearch && matchesStatus;
  });

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
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="NOT_PAID">Not Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
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
                    <TableCell className="font-medium">
                      {booking.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>
                          {experts[booking.expertId]?.name || "Unknown Expert"}
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
                        {booking.status === "COMPLETED"
                          ? "Paid"
                          : booking.status === "WAITING_EXPERT_APPROVAL"
                          ? "Not Paid"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => openVideoModal(booking.id)}
                        disabled={
                          !booking.recordedVideo && !booking.meetingRecording
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
      )}

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
            {selectedBookingId && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Recorded Session</h2>
                {bookings.find((b) => b.id === selectedBookingId)
                  ?.recordedVideo ? (
                  <Video
                    url={
                      bookings.find((b) => b.id === selectedBookingId)
                        ?.recordedVideo || ""
                    }
                  />
                ) : bookings.find((b) => b.id === selectedBookingId)
                    ?.meetingRecording ? (
                  <Video
                    url={
                      bookings.find((b) => b.id === selectedBookingId)
                        ?.meetingRecording || ""
                    }
                  />
                ) : (
                  <p className="text-center text-gray-500">
                    No video recording available for this session.
                  </p>
                )}
              </div>
            )}
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
            <AssessmentReport bookingId={selectedBookingId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
