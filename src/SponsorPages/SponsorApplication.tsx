import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/applications`;
const sponsorid = localStorage.getItem("userId");

const getBadgeColor = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-100 text-green-600";
    case "REJECTED":
      return "bg-red-100 text-red-600";
    case "SUBMITTED":
    case "PENDING":
      return "bg-yellow-100 text-yellow-600";
    default:
      return "";
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "ACCEPTED":
      return "text-green-600 bg-green-200";
    case "PENDING":
    case "SUBMITTED":
      return "text-yellow-600 bg-yellow-200";
    case "DISAPPROVED":
    case "REJECTED":
      return "text-red-600 bg-red-200";
    default:
      return "text-gray-600 bg-gray-200";
  }
};

const statusToDisplay = (status: string) => {
  switch (status) {
    case "ACCEPTED":
    case "APPROVED":
      return "Approved";
    case "REJECTED":
    case "DISAPPROVED":
      return "Disapproved";
    case "SUBMITTED":
    case "PENDING":
      return "Pending";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
};

const SponsorApplication = () => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [allApplications, setAllApplications] = useState<any[]>([]); // Store all applications
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionedIds, setActionedIds] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    appId: string | null;
    action: "accept" | "reject" | null;
  }>({ open: false, appId: null, action: null });

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch all applications once on component mount
  useEffect(() => {
    fetchApplications();
    setActionedIds({});
  }, []);

  // Memoized filtered applications - handles both search and status filtering
  const filteredApplications = useMemo(() => {
    let filtered = [...allApplications];

    // Apply status filter
    if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((app) => {
        const fullName = `${app.user?.firstName || ""} ${
          app.user?.lastName || ""
        }`.toLowerCase();
        const username = app.user?.username?.toLowerCase() || "";
        const appId = app.id?.toString().toLowerCase() || "";
        const sponsorshipType = app.sponsorshipType?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          username.includes(searchLower) ||
          appId.includes(searchLower) ||
          sponsorshipType.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [allApplications, search, statusFilter]);

  // Calculate pagination for filtered results
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const fetchApplications = async () => {
    if (!sponsorid || !token) {
      console.error("Missing sponsorid or token");
      return;
    }

    setLoading(true);
    try {
      // Fetch all applications without pagination for local filtering
      const url = `${API_BASE_URL}/sponsor/${sponsorid}?limit=1000&page=1`;

      console.log("Fetching all applications from:", url);

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      console.log("API Response:", data);

      setAllApplications(data.applications || []);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setAllApplications([]);

      if (err.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please log in again.",
        });
      } else if (err.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch applications. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = (app: any) => {
    setModalData(app);
    setIsReportOpen(true);
  };

  const closeReportModal = () => setIsReportOpen(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  // Accept/Reject API logic
  const handleApplicationAction = async (
    appId: string,
    action: "accept" | "reject"
  ) => {
    setActionLoading(appId);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/${appId}/action`,
        { action: action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: `Application ${action === "accept" ? "Accepted" : "Rejected"}`,
        text:
          res.data?.message ||
          `Application has been ${
            action === "accept" ? "accepted" : "rejected"
          }.`,
        timer: 1500,
        showConfirmButton: false,
      });

      setActionedIds((prev) => ({ ...prev, [appId]: true }));

      // Update the application status locally
      setAllApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: action === "accept" ? "ACCEPTED" : "REJECTED" }
            : app
        )
      );
    } catch (err: any) {
      console.error("Action error:", err);
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: err?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setActionLoading(null);
      setConfirmModal({ open: false, appId: null, action: null });
    }
  };

  const openAcceptConfirm = (appId: string) => {
    setConfirmModal({ open: true, appId, action: "accept" });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, appId: null, action: null });
  };

  // Button should be disabled if already actioned OR already in a terminal status
  const isActionDisabled = (app: any) => {
    if (actionedIds[app.id]) return true;
    if (
      app.status === "ACCEPTED" ||
      app.status === "APPROVED" ||
      app.status === "REJECTED" ||
      app.status === "DISAPPROVED"
    )
      return true;
    return false;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show maximum 5 page numbers

    if (totalPages <= showPages) {
      // Show all pages if total is less than or equal to showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(totalPages, startPage + showPages - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage < showPages - 1) {
        startPage = Math.max(1, endPage - showPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <div className="relative w-1/2 md:w-[1/3]">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by name, username, ID, or type..."
            className="pl-10 w-full"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Select onValueChange={handleStatusChange} value={statusFilter}>
          <SelectTrigger className="w-1/3">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="ACCEPTED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Disapproved</SelectItem>
          </SelectContent>
        </Select>

        {(search || statusFilter !== "All") && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>


      {/* Results info */}
      <div className="mb-4 text-sm text-gray-600">
        {!loading && (
          <>
            {(search || statusFilter !== "All") && (
              <span className="ml-2">
                (filtered from {allApplications.length} total)
              </span>
            )}
          </>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      )}

      <div className="dark:bg-gray-800 w-xs md:w-full">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Sponsorship Type</TableHead>
              <TableHead>Application View</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && paginatedApplications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  {search || statusFilter !== "All"
                    ? "No applications found matching your criteria"
                    : "No applications found"}
                </TableCell>
              </TableRow>
            )}

            {paginatedApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.user?.photo} />
                    <AvatarFallback>
                      {app.user?.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => {
                      localStorage.setItem(
                        "viewplayerusername",
                        app.user.username
                      );
                      navigate(`/sponsor/playerinfo`);
                    }}
                  >
                    {app.user
                      ? app.user.firstName + " " + app.user.lastName
                      : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  {app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell>{app.sponsorshipType || "-"}</TableCell>
                <TableCell
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={() => openReportModal(app)}
                >
                  {app.user
                    ? `${app.user.firstName}${app.user.lastName}.application`
                    : "View"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className={`text-sm px-3 py-1 rounded border border-green-500 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition disabled:opacity-60`}
                      onClick={() => openAcceptConfirm(app.id)}
                      disabled={
                        isActionDisabled(app) || actionLoading === app.id
                      }
                    >
                      Accept
                    </button>
                    <button
                      className={`text-sm px-3 py-1 rounded border border-red-500 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition disabled:opacity-60`}
                      onClick={() => handleApplicationAction(app.id, "reject")}
                      disabled={
                        isActionDisabled(app) || actionLoading === app.id
                      }
                    >
                      Reject
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                      app.status === "APPROVED" || app.status === "ACCEPTED"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : app.status === "DISAPPROVED" ||
                          app.status === "REJECTED"
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-yellow-400 bg-yellow-50 text-yellow-700"
                    } font-medium text-sm`}
                    style={{
                      minWidth: "92px",
                      justifyContent: "center",
                    }}
                  >
                    <Circle size={14} className={getStatusDot(app.status)} />
                    {statusToDisplay(app.status)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages >= 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} | Showing {startIndex + 1}-
              {Math.min(endIndex, filteredApplications.length)} of{" "}
              {filteredApplications.length} results
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`px-3 py-2 rounded transition-colors text-sm font-medium min-w-[40px] ${
                      currentPage === pageNum
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Items per page info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Showing {itemsPerPage} items per page | All filtering done locally
        </div>
      </div>

      {/* Modal for Application Details */}
      {isReportOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 max-w-3xl w-full rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex justify-end p-4">
              <button onClick={closeReportModal}>
                <X className="w-7 h-7 cursor-pointer text-gray-800 hover:text-black dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-6 px-8">
              <h2 className="text-2xl font-bold mb-4">Application Details</h2>
              <div className="mb-4 flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={modalData.user?.photo} />
                  <AvatarFallback>
                    {modalData.user?.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">
                    {modalData.user
                      ? modalData.user.firstName + " " + modalData.user.lastName
                      : "-"}
                  </div>
                  <div className="text-gray-500">
                    Username: {modalData.user?.username || "-"}
                  </div>
                  <div className="text-gray-500 font-mono text-sm">
                    Application ID: {modalData.id}
                  </div>
                  <div className="text-gray-500">
                    Date:{" "}
                    {modalData.createdAt
                      ? new Date(modalData.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </div>
                </div>
              </div>
              <hr className="mb-4" />
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sponsorship Type: </span>
                  {modalData.sponsorshipType || "-"}
                </div>
                <div>
                  <span className="font-semibold">Budget: </span>
                  {modalData.budget ? `$${modalData.budget}` : "-"}
                </div>
                <div>
                  <span className="font-semibold">
                    Reason for Sponsorship:{" "}
                  </span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {modalData.reason || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">
                    What makes you/your team stand out:{" "}
                  </span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {modalData.uniqueFactor || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Additional Info: </span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {modalData.additionalInfo || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Profile/Website: </span>
                  {modalData.website ? (
                    <a
                      href={
                        modalData.website.startsWith("http")
                          ? modalData.website
                          : `https://${modalData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {modalData.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  <span className="font-semibold">Status: </span>
                  <span
                    className={`inline-block px-2 py-1 rounded ${getBadgeColor(
                      modalData.status
                    )}`}
                  >
                    {statusToDisplay(modalData.status)}
                  </span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex gap-4 items-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={modalData.sponsor?.photo} />
                  <AvatarFallback>
                    {modalData.sponsor?.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    Sponsor:{" "}
                    {modalData.sponsor
                      ? modalData.sponsor.firstName +
                        " " +
                        modalData.sponsor.lastName
                      : "-"}
                  </div>
                  <div className="text-gray-500">
                    {modalData.sponsor?.username && (
                      <>
                        Username: {modalData.sponsor.username}
                        <br />
                      </>
                    )}
                    Sponsor ID: {modalData.sponsor?.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirm Modal */}
      {confirmModal.open && confirmModal.action === "accept" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-center">
              Confirm Acceptance
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to{" "}
              <span className="text-green-700 font-semibold">ACCEPT</span> this
              application?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  if (confirmModal.appId)
                    handleApplicationAction(confirmModal.appId, "accept");
                }}
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                disabled={actionLoading !== null}
              >
                Yes, Accept
              </button>
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                disabled={actionLoading !== null}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorApplication;
