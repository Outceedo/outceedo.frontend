import React from "react";
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
  faFilePdf,
  faCheckCircle,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

export interface ScoutBooking {
  id: string;
  playerId: string;
  scoutId?: string | null;
  expertId?: string | null;
  providerType?: "EXPERT" | "SCOUT";
  serviceId: string;
  status: string;
  startAt: string;
  endAt: string;
  timezone: string;
  expertTimeZone?: string;
  customServiceTitle?: string | null;
  scoutReportUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  player?: { id: string; username: string; photo: string | null } | null;
  expert?: { id: string; username: string; photo: string | null } | null;
  service?: {
    id?: string;
    title?: string;
    price?: number;
    serviceId?: string;
    service?: { name?: string };
  } | null;
  price?: number;
  playerMarkedComplete?: boolean;
  expertMarkedComplete?: boolean;
}

interface Props {
  bookings: ScoutBooking[];
  loading: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onRowClick: (booking: ScoutBooking) => void;
  onPreviewReport: (booking: ScoutBooking) => void;
  onUploadReport: (booking: ScoutBooking) => void;
}

const formatDate = (iso: string, tz: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: tz || "UTC",
    });
  } catch {
    return "—";
  }
};

const formatTimeRange = (
  startAt: string,
  endAt: string,
  tz: string,
): string => {
  if (!startAt || !endAt) return "—";
  try {
    const opt: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz || "UTC",
    };
    return `${new Date(startAt).toLocaleTimeString(
      "en-US",
      opt,
    )} – ${new Date(endAt).toLocaleTimeString("en-US", opt)}`;
  } catch {
    return "—";
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "ACCEPTED":
    case "SCHEDULED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "RESCHEDULE_REQUESTED":
      return "bg-yellow-100 text-yellow-800";
    case "WAITING_EXPERT_APPROVAL":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ScoutBookingTable: React.FC<Props> = ({
  bookings,
  loading,
  onAccept,
  onReject,
  onComplete,
  onRowClick,
  onPreviewReport,
  onUploadReport,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-red-600 rounded-full" />
      </div>
    );
  }
  if (bookings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No bookings found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Report</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => {
            const serviceTitle =
              b.customServiceTitle ||
              b.service?.title ||
              b.service?.service?.name ||
              "Scout Service";
            const status = b.status;
            return (
              <TableRow
                key={b.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <TableCell onClick={() => onRowClick(b)}>
                  {b.player?.username || "—"}
                </TableCell>
                <TableCell onClick={() => onRowClick(b)}>
                  {serviceTitle}
                </TableCell>
                <TableCell onClick={() => onRowClick(b)}>
                  {b.startAt === b.endAt
                    ? "—"
                    : formatDate(b.startAt, b.expertTimeZone || b.timezone)}
                </TableCell>
                <TableCell onClick={() => onRowClick(b)}>
                  {b.startAt === b.endAt
                    ? "No fixed time"
                    : formatTimeRange(
                        b.startAt,
                        b.endAt,
                        b.expertTimeZone || b.timezone,
                      )}
                </TableCell>
                <TableCell onClick={() => onRowClick(b)}>
                  £{b.price ?? b.service?.price ?? 0}
                </TableCell>
                <TableCell onClick={() => onRowClick(b)}>
                  <Badge className={statusBadge(status)}>
                    {status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {b.scoutReportUrl ? (
                    <button
                      type="button"
                      title="Preview uploaded report"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewReport(b);
                      }}
                      className="text-red-600 text-lg hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Upload scouting report"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadReport(b);
                      }}
                      className="text-gray-500 text-lg hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faFileUpload} />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {status === "WAITING_EXPERT_APPROVAL" && (
                      <>
                        <Button
                          size="icon"
                          title="Accept"
                          className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAccept(b.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Reject"
                          className="h-8 w-8 text-red-600 border-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(b.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </>
                    )}
                    {status === "SCHEDULED" && !b.expertMarkedComplete && (
                      <Button
                        size="icon"
                        title="Mark complete"
                        className="h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(b.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScoutBookingTable;
