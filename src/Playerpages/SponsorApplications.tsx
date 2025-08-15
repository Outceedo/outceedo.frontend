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
import { Circle, X, ArrowLeft } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/applications`;
const currentUserId =
  localStorage.getItem("userId") ||
  localStorage.getItem("userid") ||
  "22951a3363";

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
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "text-green-600 bg-green-200";
    case "PENDING":
    case "SUBMITTED":
      return "text-yellow-600 bg-yellow-200";
    case "REJECTED":
      return "text-red-600 bg-red-200";
    default:
      return "text-gray-600 bg-gray-200";
  }
};

const statusToDisplay = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "Sponsored";
    case "REJECTED":
      return "Disapproved";
    case "SUBMITTED":
    case "PENDING":
      return "Pending";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
};

const SponsorApplicationpage = () => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [allApplications, setAllApplications] = useState<any[]>([]); // Store all applications
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch all applications once on component mount
  useEffect(() => {
    fetchApplications();
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
        const sponsorName = `${app.sponsor?.firstName || ""} ${
          app.sponsor?.lastName || ""
        }`.toLowerCase();
        const sponsorUsername = app.sponsor?.username?.toLowerCase() || "";
        const appId = app.id?.toString().toLowerCase() || "";
        const sponsorshipType = app.sponsorshipType?.toLowerCase() || "";
        const budget = app.budget?.toString().toLowerCase() || "";

        return (
          sponsorName.includes(searchLower) ||
          sponsorUsername.includes(searchLower) ||
          appId.includes(searchLower) ||
          sponsorshipType.includes(searchLower) ||
          budget.includes(searchLower)
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
    if (!token) {
      console.error("Missing token");
      return;
    }

    setLoading(true);
    try {
      // Fetch all applications without pagination for local filtering
      const url = `${API_BASE_URL}?limit=1000&page=1`;

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
    <div className="p-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-700 hover:text-black text-sm font-medium mb-4 dark:text-white cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
      </button>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by ID, sponsor name, type, or budget..."
            className="pl-10 w-full"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Select onValueChange={handleStatusChange} value={statusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="ACCEPTED">Sponsored</SelectItem>
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
            Showing {Math.min(itemsPerPage, paginatedApplications.length)} of{" "}
            {filteredApplications.length} applications
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
              <TableHead>Application ID</TableHead>
              <TableHead>Sponsor Name</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Sponsorship Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Application View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && paginatedApplications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
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
                {/* Clamp ID */}
                <TableCell
                  className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  title={`Click to copy: ${app.id}`}
                  style={{
                    maxWidth: "160px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(app.id);
                    // Simple feedback - you could replace with a toast
                    const originalTitle = "Click to copy: " + app.id;
                    const element = document.querySelector(
                      `[title="${originalTitle}"]`
                    ) as HTMLElement;
                    if (element) {
                      element.setAttribute("title", "Copied!");
                      setTimeout(() => {
                        element.setAttribute("title", originalTitle);
                      }, 1000);
                    }
                  }}
                >
                  {app.id}
                </TableCell>

                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.sponsor?.photo} />
                    <AvatarFallback>
                      {app.sponsor?.firstName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => {
                      if (app.sponsor?.username) {
                        localStorage.setItem(
                          "viewsponsorusername",
                          app.sponsor.username
                        );
                        navigate(`/player/Sponsorinfo`);
                      }
                    }}
                  >
                    {app.sponsor
                      ? `${app.sponsor.firstName || ""} ${
                          app.sponsor.lastName || ""
                        }`.trim()
                      : "Unknown Sponsor"}
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

                <TableCell>{app.budget ? `$${app.budget}` : "-"}</TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-sm ${
                      app.status === "ACCEPTED"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : app.status === "REJECTED"
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-yellow-400 bg-yellow-50 text-yellow-700"
                    }`}
                    style={{
                      minWidth: "92px",
                      justifyContent: "center",
                    }}
                  >
                    <Circle size={14} className={getStatusDot(app.status)} />
                    {statusToDisplay(app.status)}
                  </span>
                </TableCell>

                <TableCell
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={() => openReportModal(app)}
                >
                  {app.sponsor
                    ? `${app.sponsor.firstName || ""}${
                        app.sponsor.lastName || ""
                      }.application`
                    : "View"}
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

      {/* Application Details Modal */}
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

              {/* Application Info */}
              <div className="mb-4 flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={modalData.user?.photo} />
                  <AvatarFallback>
                    {modalData.user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">Your Application</div>
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
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </div>
                  <div className="text-gray-500">
                    Status:
                    <span
                      className={`ml-2 inline-block px-2 py-1 rounded text-xs ${getBadgeColor(
                        modalData.status
                      )}`}
                    >
                      {statusToDisplay(modalData.status)}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="mb-4" />

              {/* Application Details */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sponsorship Type: </span>
                  {modalData.sponsorshipType || "-"}
                </div>

                {modalData.budget && (
                  <div>
                    <span className="font-semibold">Budget: </span>$
                    {modalData.budget}
                  </div>
                )}

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
                    What makes you stand out:{" "}
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
              </div>

              <hr className="my-4" />

              {/* Sponsor Information */}
              <div className="flex gap-4 items-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={modalData.sponsor?.photo} />
                  <AvatarFallback>
                    {modalData.sponsor?.firstName?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    Sponsor:{" "}
                    {modalData.sponsor
                      ? `${modalData.sponsor.firstName || ""} ${
                          modalData.sponsor.lastName || ""
                        }`.trim()
                      : "Unknown"}
                  </div>
                  <div className="text-gray-500">
                    {modalData.sponsor?.username && (
                      <>
                        Username: {modalData.sponsor.username}
                        <br />
                      </>
                    )}
                    Sponsor ID: {modalData.sponsor?.id || "N/A"}
                  </div>
                </div>
              </div>

              {/* Action buttons for the application if needed */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(modalData.id);
                    }}
                  >
                    Copy Application ID
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (modalData.sponsor?.username) {
                        localStorage.setItem(
                          "viewsponsorusername",
                          modalData.sponsor.username
                        );
                        navigate(`/player/Sponsorinfo`);
                      }
                    }}
                  >
                    View Sponsor Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorApplicationpage;
