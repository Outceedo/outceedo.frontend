import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilePdf,
  faFileUpload,
  faCalendarAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ScoutBookingTable, { ScoutBooking } from "./Table";
import ScoutReportPreviewModal from "@/Pages/common/ScoutReportPreviewModal";

const API_BASE = `${import.meta.env.VITE_PORT}/api/v1`;

const authHeaders = (extra: Record<string, string> = {}) => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  ...extra,
});

const ScoutMyBooking: React.FC = () => {
  const [bookings, setBookings] = useState<ScoutBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ScoutBooking | null>(
    null,
  );

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(
    null,
  );
  const [reDate, setReDate] = useState("");
  const [reStart, setReStart] = useState("");
  const [reEnd, setReEnd] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBooking, setUploadBooking] = useState<ScoutBooking | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBooking, setPreviewBooking] = useState<ScoutBooking | null>(
    null,
  );

  const openPreview = (booking: ScoutBooking) => {
    setPreviewBooking(booking);
    setPreviewOpen(true);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/booking?limit=100&page=1`, {
        headers: authHeaders(),
      });
      const items: ScoutBooking[] = res.data?.bookings || [];
      setBookings(items);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load bookings",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (id: string) => {
    const ok = await Swal.fire({
      title: "Accept booking?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, accept",
      confirmButtonColor: "#16a34a",
    });
    if (!ok.isConfirmed) return;
    try {
      await axios.patch(
        `${API_BASE}/booking/${id}/accept`,
        {},
        { headers: authHeaders() },
      );
      Swal.fire({
        icon: "success",
        title: "Booking accepted",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBookings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to accept",
        text: err.response?.data?.error || err.message,
      });
    }
  };

  const handleReject = async (id: string) => {
    const ok = await Swal.fire({
      title: "Reject booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      confirmButtonColor: "#dc2626",
    });
    if (!ok.isConfirmed) return;
    try {
      await axios.patch(
        `${API_BASE}/booking/${id}/reject`,
        {},
        { headers: authHeaders() },
      );
      Swal.fire({
        icon: "success",
        title: "Booking rejected",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBookings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to reject",
        text: err.response?.data?.error || err.message,
      });
    }
  };

  const openReschedule = (id: string) => {
    setRescheduleBookingId(id);
    setReDate("");
    setReStart("");
    setReEnd("");
    setRescheduleOpen(true);
  };

  const submitReschedule = async () => {
    if (!rescheduleBookingId || !reDate || !reStart || !reEnd) {
      Swal.fire({ icon: "error", title: "Fill date and times" });
      return;
    }
    setRescheduling(true);
    try {
      await axios.patch(
        `${API_BASE}/booking/${rescheduleBookingId}/reschedule`,
        {
          date: reDate,
          startTime: reStart,
          endTime: reEnd,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        { headers: authHeaders() },
      );
      Swal.fire({
        icon: "success",
        title: "Reschedule requested",
        timer: 1500,
        showConfirmButton: false,
      });
      setRescheduleOpen(false);
      fetchBookings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to reschedule",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setRescheduling(false);
    }
  };

  const handleComplete = async (id: string) => {
    const ok = await Swal.fire({
      title: "Mark this booking as complete?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (!ok.isConfirmed) return;
    try {
      await axios.patch(
        `${API_BASE}/booking/${id}/complete`,
        {},
        { headers: authHeaders() },
      );
      Swal.fire({
        icon: "success",
        title: "Marked complete",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBookings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.error || err.message,
      });
    }
  };

  const openUpload = (booking: ScoutBooking) => {
    setUploadBooking(booking);
    setUploadFile(null);
    setUploadOpen(true);
  };

  const submitUpload = async () => {
    if (!uploadBooking || !uploadFile) {
      Swal.fire({ icon: "error", title: "Choose a PDF file first" });
      return;
    }
    if (uploadFile.type !== "application/pdf") {
      Swal.fire({ icon: "error", title: "Only PDF files are allowed" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", uploadFile);
      await axios.patch(
        `${API_BASE}/booking/${uploadBooking.id}/scout-report`,
        fd,
        {
          headers: authHeaders({ "Content-Type": "multipart/form-data" }),
        },
      );
      Swal.fire({
        icon: "success",
        title: "Report uploaded",
        timer: 1500,
        showConfirmButton: false,
      });
      setUploadOpen(false);
      fetchBookings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const getLocalDateString = (iso: string, timezone?: string): string => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-CA", {
        timeZone: timezone || "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const isPaid = (b: ScoutBooking) =>
    b.status === "SCHEDULED" || b.status === "COMPLETED";

  const filtersApplied =
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    dateFilter !== "" ||
    search !== "";

  const clearAllFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("");
    setSearch("");
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (paymentFilter === "PAID" && !isPaid(b)) return false;
    if (
      paymentFilter === "NOT_PAID" &&
      b.status !== "WAITING_EXPERT_APPROVAL"
    )
      return false;
    if (
      paymentFilter === "PENDING" &&
      !["ACCEPTED", "CONFIRMED"].includes(b.status)
    )
      return false;
    if (
      dateFilter &&
      getLocalDateString(b.startAt, b.timezone) !== dateFilter
    )
      return false;
    if (search) {
      const q = search.toLowerCase();
      const player = b.player?.username?.toLowerCase() || "";
      const title = (
        b.customServiceTitle ||
        b.service?.title ||
        ""
      ).toLowerCase();
      if (!player.includes(q) && !title.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 dark:text-white">
        My Bookings
      </h1>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-1/5">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search by Player Name"
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
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="WAITING_EXPERT_APPROVAL">
              Waiting Approval
            </SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="RESCHEDULE_REQUESTED">
              Reschedule Requested
            </SelectItem>
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

      <ScoutBookingTable
        bookings={filtered}
        loading={loading}
        onAccept={handleAccept}
        onReject={handleReject}
        onReschedule={openReschedule}
        onComplete={handleComplete}
        onPreviewReport={openPreview}
        onRowClick={(b) => {
          setSelectedBooking(b);
          setDetailsOpen(true);
        }}
      />

      {/* Details modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>
              {selectedBooking?.customServiceTitle ||
                selectedBooking?.service?.title ||
                ""}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Player:</span>{" "}
                {selectedBooking.player?.username || "—"}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {selectedBooking.description || "—"}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedBooking.status}
              </p>
              <p>
                <span className="font-medium">Price:</span> £
                {selectedBooking.price ?? 0}
              </p>
              <p>
                <span className="font-medium">Starts at:</span>{" "}
                {new Date(selectedBooking.startAt).toLocaleString("en-US", {
                  timeZone:
                    selectedBooking.expertTimeZone ||
                    selectedBooking.timezone ||
                    "UTC",
                })}
              </p>
              <p>
                <span className="font-medium">Ends at:</span>{" "}
                {new Date(selectedBooking.endAt).toLocaleString("en-US", {
                  timeZone:
                    selectedBooking.expertTimeZone ||
                    selectedBooking.timezone ||
                    "UTC",
                })}
              </p>
              {selectedBooking.scoutReportUrl && (
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      const b = selectedBooking;
                      setDetailsOpen(false);
                      openPreview(b);
                    }}
                    className="text-red-600 hover:underline inline-flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faFilePdf} /> Preview uploaded report
                  </button>
                </p>
              )}

              {(selectedBooking.status === "SCHEDULED" ||
                selectedBooking.status === "COMPLETED") && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">
                    {selectedBooking.scoutReportUrl
                      ? "Replace report"
                      : "Upload a scouting report (PDF)"}
                  </p>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setDetailsOpen(false);
                      openUpload(selectedBooking);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedBooking.scoutReportUrl
                          ? faFilePdf
                          : faFileUpload
                      }
                      className="mr-2"
                    />
                    {selectedBooking.scoutReportUrl
                      ? "Replace report"
                      : "Upload report"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    The player will be able to download this PDF from their
                    booking details.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose a new time</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={reDate}
                onChange={(e) => setReDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start time</label>
                <Input
                  type="time"
                  value={reStart}
                  onChange={(e) => setReStart(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End time</label>
                <Input
                  type="time"
                  value={reEnd}
                  onChange={(e) => setReEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleOpen(false)}
              disabled={rescheduling}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={submitReschedule}
              disabled={rescheduling}
            >
              {rescheduling ? "Submitting…" : "Propose new time"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScoutReportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        url={previewBooking?.scoutReportUrl || null}
        title={
          previewBooking?.customServiceTitle ||
          previewBooking?.service?.title ||
          undefined
        }
      />

      {/* Upload report modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload scouting report (PDF)</DialogTitle>
            <DialogDescription>
              {uploadBooking?.customServiceTitle ||
                uploadBooking?.service?.title ||
                ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            {uploadFile && (
              <p className="text-sm text-gray-600">
                Selected: {uploadFile.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={submitUpload}
              disabled={uploading || !uploadFile}
            >
              {uploading ? "Uploading…" : "Upload report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScoutMyBooking;
