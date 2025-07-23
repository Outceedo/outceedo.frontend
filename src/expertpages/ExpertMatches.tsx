import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  BookOpen,
  X,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function formatDateDMY(isoDate) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return isoDate;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}

interface Match {
  id?: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  status: string;
  result: string;
  goals?: string;
  assists?: string;
  shots?: string;
  shotsOnTarget?: string;
  shotsontarget?: string;
  passes?: string;
  yellowcards?: string;
  redcards?: string;
}

const ExpertMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<Match>({
    date: "",
    homeTeam: "",
    awayTeam: "",
    type: "",
    status: "",
    result: "",
    goals: "",
    assists: "",
    shots: "",
    shotsOnTarget: "",
    passes: "",
    yellowcards: "",
    redcards: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Look for user ID in multiple localStorage keys to handle different naming conventions
  const userId =
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    localStorage.getItem("user_id");

  const token = localStorage.getItem("token");

  // API base URL with proper fallback
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/matches`;

  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  // Configure axios instance with auth token
  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Log current configuration for debugging
  useEffect(() => {
    console.log("Configuration:", {
      userId,
      apiBaseUrl: API_BASE_URL,
      hasToken: !!token,
    });
  }, []);

  // Fetch matches on component mount
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      toast.error("User ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching matches from: ${API_BASE_URL}/user/${userId}`);

      const response = await axiosInstance.get(
        `${API_BASE_URL}/user/${userId}`
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.matches) {
        // Sort matches by date (newest first)
        const sortedMatches = response.data.matches.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMatches(sortedMatches);
      } else {
        setMatches([]);
        console.log("No matches found in response data");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to load match data. Please try again later.");
      toast.error("Failed to load match data");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.homeTeam || !formData.awayTeam) {
      toast.error(
        "Please fill in required fields (Date, Home Team, Away Team)"
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing match
        await axiosInstance.patch(`${API_BASE_URL}/${editingId}`, formData);
        toast.success("Match updated successfully");
      } else {
        // Create new match
        await axiosInstance.post(API_BASE_URL, formData);
        toast.success("Match added successfully");
      }

      // Refresh matches
      fetchMatches();

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving match:", error);
      toast.error(editingId ? "Failed to update match" : "Failed to add match");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    const matchToEdit = matches.find((match) => match.id === id);
    if (matchToEdit) {
      setFormData({
        ...matchToEdit,
        // Make sure to use the correct property names that match API
        shotsOnTarget:
          matchToEdit.shotsOnTarget || matchToEdit.shotsontarget || "",
      });
      setEditingId(id);

      // Scroll to form
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteClick = (id: string) => {
    setMatchToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!matchToDelete) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${matchToDelete}`);

      // Update local state
      setMatches(matches.filter((match) => match.id !== matchToDelete));
      toast.success("Match deleted successfully");

      // Close modal
      setDeleteModalOpen(false);
      setMatchToDelete(null);
    } catch (error) {
      console.error("Error deleting match:", error);
      toast.error("Failed to delete match");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewStats = (match: Match) => {
    setSelectedMatch(match);
    setStatsModalOpen(true);
  };

  const getMatchDetails = (id: string | null): Match | undefined => {
    if (id === null) return undefined;
    return matches.find((match) => match.id === id);
  };

  const matchToDeleteDetails = getMatchDetails(matchToDelete);

  const resetForm = () => {
    setFormData({
      date: "",
      homeTeam: "",
      awayTeam: "",
      type: "",
      status: "",
      result: "",
      goals: "",
      assists: "",
      shots: "",
      shotsOnTarget: "",
      passes: "",
      yellowcards: "",
      redcards: "",
    });
    setEditingId(null);
  };

  const handleRetry = () => {
    fetchMatches();
  };

  return (
    <div className="container mx-auto p-4 space-y-6 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-6">
        {/* Match Form */}
        <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Match" : "Add New Match"}
            </h2>
          </CardHeader>
          <CardContent className="dark:text-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Home Team <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="homeTeam"
                    value={formData.homeTeam}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Away Team <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="awayTeam"
                    value={formData.awayTeam}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Result
                  </label>
                  <textarea
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              {/* Stats Inputs */}
              <div className="mt-4 mb-2">
                <h3 className="text-md font-semibold dark:text-gray-200">
                  Performance Statistics
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Goals
                  </label>
                  <input
                    type="text"
                    name="goals"
                    value={formData.goals || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Assists
                  </label>
                  <input
                    type="text"
                    name="assists"
                    value={formData.assists || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Shots
                  </label>
                  <input
                    type="text"
                    name="shots"
                    value={formData.shots || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Shots on Target
                  </label>
                  <input
                    type="text"
                    name="shotsOnTarget"
                    value={formData.shotsOnTarget || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Passes
                  </label>
                  <input
                    type="text"
                    name="passes"
                    value={formData.passes || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Yellow Cards
                  </label>
                  <input
                    type="text"
                    name="yellowcards"
                    value={formData.yellowcards || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Red Cards
                  </label>
                  <input
                    type="text"
                    name="redcards"
                    value={formData.redcards || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingId ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>{editingId ? "Update" : "Submit"}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Match Table */}
        <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Match History</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <span>Refresh</span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-md">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-1">
                  Error Loading Matches
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="dark:bg-gray-800 dark:text-gray-300">
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Date</TableHead>
                      <TableHead className="dark:text-gray-300">
                        Home Team
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        Away Team
                      </TableHead>
                      <TableHead className="dark:text-gray-300">Type</TableHead>
                      <TableHead className="dark:text-gray-300">
                        Status
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        Result
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        Stats
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow className="dark:border-gray-700">
                        <TableCell
                          colSpan={8}
                          className="text-center dark:text-gray-300"
                        >
                          No matches found
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match, index) => (
                        <TableRow
                          key={match.id || index}
                          className={
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-100 dark:bg-gray-700"
                          }
                        >
                          <TableCell className="font-medium dark:text-gray-300">
                            {formatDateDMY(match.date)}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {match.homeTeam}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {match.awayTeam}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {match.type}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {match.status}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {match.result}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewStats(match)}
                              className="dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700"
                            >
                              <BookOpen className="h-4 w-4" />
                              <span className="sr-only">View Stats</span>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(match.id || "")}
                                className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                                disabled={!match.id}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteClick(match.id || "")
                                }
                                className="text-destructive dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                                disabled={!match.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Modal */}
      {statsModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setStatsModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold dark:text-white">
                Match Statistics
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatsModalOpen(false)}
                className="dark:text-gray-400 hover:dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              {/* Match Details Section */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-lg dark:text-white mb-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date:</p>
                    <p className="font-medium dark:text-white">
                      {formatDateDMY(selectedMatch.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.type || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.status || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Result:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.result || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Statistics Section */}
              <div>
                <h4 className="font-medium dark:text-white mb-4 text-lg border-b border-gray-200 dark:border-gray-600 pb-2">
                  Performance Statistics
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Goals
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedMatch.goals || "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Assists
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedMatch.assists || "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Shots
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedMatch.shots || "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Shots on Target
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedMatch.shotsOnTarget ||
                        selectedMatch.shotsontarget ||
                        "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Passes
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedMatch.passes || "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Yellow Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.yellowcards || "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Red Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.redcards || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStatsModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && matchToDeleteDetails && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50">
            <div className="flex items-center p-4 border-b dark:border-gray-700">
              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">
                Confirm Delete
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModalOpen(false)}
                className="ml-auto dark:text-gray-400 hover:dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-gray-700 dark:text-gray-200 mb-4">
                  Are you sure you want to delete this match record?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="font-medium dark:text-white">
                    {matchToDeleteDetails.homeTeam} vs{" "}
                    {matchToDeleteDetails.awayTeam}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateDMY(matchToDeleteDetails.date)} •{" "}
                    {matchToDeleteDetails.type}
                  </p>
                  <p className="text-sm font-bold mt-1 dark:text-gray-300">
                    Result: {matchToDeleteDetails.result}
                  </p>
                </div>
                <p className="text-red-500 dark:text-red-400 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertMatches;
