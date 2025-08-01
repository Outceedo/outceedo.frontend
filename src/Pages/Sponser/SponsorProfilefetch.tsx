import React, { useState, useEffect, useCallback, useMemo } from "react";
import sponsor2 from "../../assets/images/avatar.png";
import { Card, CardContent } from "@/components/ui/card";
import { X, Star, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfiles } from "@/store/profile-slice";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApplicationForm from "./ApplicationForm";
import Swal from "sweetalert2";

interface SponsorProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  photo?: string;
  country?: string;
  city?: string;
  sponsorshipType?: string;
  budgetRange?: string;
  reviewsReceived?: any[];
  role?: string;
  sponsorType?: string;
  sponsorshipCountryPreferred?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

// Enhanced Pagination Component (always show controls)
const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getVisiblePages = () => {
    const delta = window.innerWidth < 768 ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages === 1) return [1];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return [...new Set(rangeWithDots)];
  };

  // Always show pagination even if only 1 page
  return (
    <div className="flex justify-center mt-6 space-x-1 sm:space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-2 sm:px-3"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <div className="flex space-x-1 sm:space-x-2">
        {getVisiblePages().map((page, index) => (
          <span
            key={`page-${index}-${page}`}
            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer text-sm ${
              typeof page === "number" && currentPage === page
                ? "bg-red-500 text-white"
                : typeof page === "number"
                ? "bg-gray-200 dark:bg-slate-600 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-500"
                : "bg-transparent cursor-default"
            }`}
            onClick={() => typeof page === "number" && onPageChange(page)}
          >
            {page}
          </span>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default function SponsorProfiles() {
  const dispatch = useAppDispatch();
  const { profiles, status, error } = useAppSelector((state) => state.profile);
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  // Restriction check for player & premium
  const role = localStorage.getItem("role");
  const isUserOnPremiumPlan =
    isActive && planName && planName.toLowerCase() !== "free";
  const isPlayer = role === "player";

  // Extract sponsors and pagination info from profiles response
  const sponsorsArray = profiles?.users || [];
  const backendTotalPages = profiles?.totalPages || 1;
  const backendPage = profiles?.page || 1;
  const totalSponsorCount = profiles?.totalCount || sponsorsArray.length;

  const [searchTerm, setSearchTerm] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [activeSponsor, setActiveSponsor] = useState<SponsorProfile | null>(
    null
  );
  const [allSponsors, setAllSponsors] = useState<SponsorProfile[]>([]);

  const [filters, setFilters] = useState({
    country: "",
    sponsorType: "",
    sponsorshipType: "",
    budgetRange: "",
  });

  const navigate = useNavigate();

  // Store all sponsors when data is fetched
  useEffect(() => {
    if (sponsorsArray.length > 0) {
      setAllSponsors(sponsorsArray);
    }
  }, [sponsorsArray]);

  const extractFilterOptions = useCallback(
    (key: keyof SponsorProfile, dataArray: SponsorProfile[]): string[] => {
      const options = new Set<string>();
      dataArray.forEach((sponsor: SponsorProfile) => {
        const value = sponsor[key];
        if (value && typeof value === "string") options.add(value);
      });
      return Array.from(options);
    },
    []
  );

  // Fetch sponsors with backend paging
  const fetchSponsors = useCallback(() => {
    const params: any = {
      page: currentPage,
      limit,
      userType: "sponsor",
    };
    dispatch(getProfiles(params));
  }, [currentPage, limit, dispatch]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  // Client-side filtering and searching (only on current page)
  const filteredAndSearchedSponsors = useMemo(() => {
    let filtered = [...allSponsors];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((sponsor) => {
        const fullName = `${sponsor.firstName || ""} ${
          sponsor.lastName || ""
        }`.toLowerCase();
        const username = sponsor.username?.toLowerCase() || "";
        const company = sponsor.company?.toLowerCase() || "";
        const bio = sponsor.bio?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          username.includes(query) ||
          company.includes(query) ||
          bio.includes(query)
        );
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((sponsor) => {
          return sponsor[key] === value;
        });
      }
    });

    return filtered;
  }, [allSponsors, searchTerm, filters]);

  // For backend paging, just use filteredAndSearchedSponsors as displayed sponsors
  const displayedSponsors = filteredAndSearchedSponsors;

  // Pagination info: backend paging
  const startIndex = (backendPage - 1) * limit;
  const endIndex = startIndex + displayedSponsors.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const openReportModal = (sponsor: SponsorProfile) => {
    if (isPlayer && !isUserOnPremiumPlan) {
      Swal.fire({
        icon: "info",
        title: "Premium Required",
        html: `
          <p class="mb-3">Only players with a <strong>Premium Plan</strong> can apply for sponsorships.</p>
          <div class="bg-blue-50 p-3 rounded-lg mb-3 text-left">
            <h4 class="font-semibold text-blue-800 mb-2">Premium Plan Benefits:</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Apply for sponsorships</li>
              <li>• Access all premium features</li>
              <li>• Priority support</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#6B7280",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/plans");
        }
      });
      return;
    }
    setActiveSponsor(sponsor);
    localStorage.setItem("sponsorid", sponsor.id);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
  };

  const handleViewProfile = (sponsorId: string, username: string) => {
    localStorage.setItem("viewsponsorusername", username);

    const role = localStorage.getItem("role");

    if (role === "player") {
      navigate("/player/sponsorinfo");
    } else if (role === "sponsor") {
      navigate("/sponsor/sponsorinfo");
    } else if (role === "team") {
      navigate("/team/sponsorinfo");
    } else {
      navigate("/expert/sponsorinfo");
    }
  };

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data: Country[]) => {
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      })
      .catch((error) => {
        console.error("Failed to fetch countries:", error);
      });
  }, []);

  const handleFilterChange = (value: string, filterType: string) => {
    const normalizedKey = filterType.toLowerCase();
    let stateKey = "";
    switch (normalizedKey) {
      case "country":
        stateKey = "country";
        break;
      case "sponsortype":
        stateKey = "sponsorType";
        break;
      case "sponsorship type":
      case "sponsorshiptype":
        stateKey = "sponsorshipType";
        break;
      case "budget range":
      case "budgetrange":
        stateKey = "budgetRange";
        break;
      default:
        stateKey = normalizedKey;
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      [stateKey]: value,
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      country: "",
      sponsorType: "",
      sponsorshipType: "",
      budgetRange: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchTerm !== "" || Object.values(filters).some((value) => value !== "")
    );
  };

  // Get filter options from all sponsors (not just current page)
  const countryOptions = extractFilterOptions("country", allSponsors);
  const sponsorTypeOptions = extractFilterOptions("sponsorType", allSponsors);
  const sponsorshipTypeOptions = extractFilterOptions(
    "sponsorshipType",
    allSponsors
  );
  const budgetRangeOptions = extractFilterOptions("budgetRange", allSponsors);

  const defaultSponsorTypes = ["Individual", "Corporate", "Institution"];
  const defaultSponsorshipTypes = ["Cash", "Card", "Gift", "Professional Fee"];
  const defaultBudgetRanges = ["10K-50K", "50K-100K", "100K-500K", "500K+"];

  const calculateRating = (reviews: any[] = []) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Handle page change (backend paging)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle limit change (backend paging)
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="px-3 sm:px-6 py-2 w-full mx-auto dark:bg-gray-900">
      {/* Search Bar */}
      <div className="mb-4 sm:mb-6 w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search sponsors by name, company or description..."
            className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Filters */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
          {/* Country Filter */}
          <div className="w-full">
            <Select
              value={filters.country}
              onValueChange={(value) => handleFilterChange(value, "country")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.length > 0
                  ? countryOptions.map((country, index) => (
                      <SelectItem key={`country-${index}`} value={country}>
                        {country}
                      </SelectItem>
                    ))
                  : countries.map((c) => (
                      <SelectItem
                        key={`country-${c.cca2}`}
                        value={c.name.common}
                      >
                        {c.name.common}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sponsor Type Filter */}
          <div className="w-full">
            <Select
              value={filters.sponsorType}
              onValueChange={(value) =>
                handleFilterChange(value, "sponsorType")
              }
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Sponsor Type" />
              </SelectTrigger>
              <SelectContent>
                {sponsorTypeOptions.length > 0
                  ? sponsorTypeOptions.map((type, index) => (
                      <SelectItem key={`sponsorType-${index}`} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  : defaultSponsorTypes.map((type) => (
                      <SelectItem key={`sponsorType-${type}`} value={type}>
                        {type}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sponsorship Type Filter */}
          <div className="w-full">
            <Select
              value={filters.sponsorshipType}
              onValueChange={(value) =>
                handleFilterChange(value, "sponsorshipType")
              }
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Sponsorship Type" />
              </SelectTrigger>
              <SelectContent>
                {sponsorshipTypeOptions.length > 0
                  ? sponsorshipTypeOptions.map((type, index) => (
                      <SelectItem key={`sponsorshipType-${index}`} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  : defaultSponsorshipTypes.map((type) => (
                      <SelectItem key={`sponsorshipType-${type}`} value={type}>
                        {type}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range Filter */}
          <div className="w-full">
            <Select
              value={filters.budgetRange}
              onValueChange={(value) =>
                handleFilterChange(value, "budgetRange")
              }
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRangeOptions.length > 0
                  ? budgetRangeOptions.map((range, index) => (
                      <SelectItem key={`budgetRange-${index}`} value={range}>
                        {range}
                      </SelectItem>
                    ))
                  : defaultBudgetRanges.map((range) => (
                      <SelectItem key={`budgetRange-${range}`} value={range}>
                        {range}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters() && (
            <div className="w-full flex items-center">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full flex items-center justify-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-600 rounded-xl min-h-[48px] text-base"
              >
                <X size={18} /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <div className="flex justify-center items-center h-32 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Error State */}
      {status === "failed" && error && (
        <div className="text-center p-4 sm:p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          <p className="text-base sm:text-lg font-semibold">
            Failed to load sponsors
          </p>
          <p className="text-sm sm:text-base">{error}</p>
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={fetchSponsors}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* No Sponsors State */}
      {status === "succeeded" &&
        displayedSponsors.length === 0 &&
        allSponsors.length > 0 && (
          <div className="text-center p-6 sm:p-10">
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              No sponsors found matching your criteria.
            </p>
          </div>
        )}

      {/* No Sponsors Loaded */}
      {status === "succeeded" && allSponsors.length === 0 && (
        <div className="text-center p-6 sm:p-10">
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
            No sponsors available.
          </p>
        </div>
      )}

      {/* Sponsor List */}
      <div className="space-y-3 sm:space-y-4">
        {status === "succeeded" &&
          displayedSponsors.length > 0 &&
          displayedSponsors.map((sponsor: SponsorProfile) => {
            const rating = calculateRating(sponsor.reviewsReceived);
            const sponsoredCount = sponsor.reviewsReceived?.length || 0;
            const displayName =
              `${sponsor.firstName || ""} ${sponsor.lastName || ""}`.trim() ||
              sponsor.username ||
              "Anonymous Sponsor";

            return (
              <Card
                key={sponsor.id}
                className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-4 dark:bg-gray-800"
              >
                <div className="w-full sm:w-auto flex justify-center sm:block">
                  <img
                    src={sponsor.photo || sponsor2}
                    alt={displayName}
                    className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = sponsor2;
                    }}
                  />
                </div>
                <CardContent className="flex-1 p-0 w-full">
                  <h2 className="text-base sm:text-lg font-semibold dark:text-white text-center sm:text-left">
                    {displayName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
                    {sponsor.company ||
                      (sponsor.sponsorType === "individual"
                        ? "Individual Sponsor"
                        : "Organization")}
                    {sponsor.city && sponsor.country
                      ? ` • ${sponsor.city}, ${sponsor.country}`
                      : ""}
                  </p>
                  <p className="text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-3 dark:text-gray-300 text-center sm:text-left">
                    {sponsor.bio || "No description available."}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start mt-2 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center text-yellow-400 mr-2">
                      {Array.from({
                        length: Math.floor(Number(rating) || 0),
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-yellow-400 text-sm sm:text-lg">
                      {rating || "N/A"}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      (Sponsored - {sponsoredCount} players)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 justify-center sm:justify-start">
                    {sponsor.sponsorType && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-white">
                        {sponsor.sponsorType}
                      </span>
                    )}
                    {sponsor.budgetRange && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-white">
                        {sponsor.budgetRange}
                      </span>
                    )}
                    {sponsor.sponsorshipType && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-white">
                        {sponsor.sponsorshipType}
                      </span>
                    )}
                  </div>
                </CardContent>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center items-center gap-2 sm:gap-3">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white cursor-pointer w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2"
                    onClick={() =>
                      handleViewProfile(sponsor.id, sponsor.username)
                    }
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 flex items-center justify-center dark:bg-gray-700 dark:text-white w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2"
                    onClick={() => openReportModal(sponsor)}
                  >
                    Apply
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Modal for Application Form */}
      {isReportOpen && (
        <div className="fixed inset-0 lg:left-[260px] lg:top-0 lg:right-0 lg:bottom-0 z-50 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
          <div className="sticky top-0 w-full flex justify-between items-center p-3 sm:p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-lg font-semibold dark:text-white">
              Apply for Sponsorship
            </h2>
            <button
              onClick={closeReportModal}
              className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <ApplicationForm />
          </div>
          <div className="sticky bottom-0 w-full p-3 sm:p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 sm:mr-2"
              onClick={closeReportModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto order-1 sm:order-2"
              onClick={closeReportModal}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Pagination Section */}
      {status === "succeeded" && backendTotalPages >= 1 && (
        <div className="flex flex-col items-center mt-8 space-y-4 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Items per page:
            </span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 min-w-[80px] focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="20">20</option>
            </select>
          </div>

          <Pagination
            totalPages={backendTotalPages}
            currentPage={backendPage}
            onPageChange={handlePageChange}
          />

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span>
                Showing {Math.min(startIndex + 1, totalSponsorCount)} to{" "}
                {Math.min(endIndex, totalSponsorCount)} of {totalSponsorCount}{" "}
                sponsors
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                Page {backendPage} of {backendTotalPages}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
