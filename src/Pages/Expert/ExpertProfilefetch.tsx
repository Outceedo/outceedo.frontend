import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import avatar from "../../assets/images/avatar.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfiles } from "@/store/profile-slice";

const defaultImages = [avatar];

interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Expert {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
  bio?: string;
  city?: string;
  country?: string;
  gender?: string;
  language?: string[];
  sports?: string[];
  sport?: string;
  photo?: string;
  verified?: boolean;
  role?: string;
  rating?: number;
  reviews?: number;
  subProfession?: string;
  reviewsReceived?: Review[];
  [key: string]: any;
}

// Star Rating Component
const StarRating: React.FC<{
  rating: number;
  totalStars?: number;
  showRating?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ rating, totalStars = 5, showRating = true, size = "sm" }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full Stars */}

        <FontAwesomeIcon
          icon={faStar}
          className={`text-yellow-400 ${sizeClasses[size]}`}
        />
      </div>

      {showRating && (
        <span
          className={`text-gray-600 dark:text-gray-300 ${sizeClasses[size]} ml-1`}
        >
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

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

  return (
    <div className="flex justify-center items-center mt-6 space-x-1 sm:space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px]"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <div className="flex space-x-1 sm:space-x-2">
        {getVisiblePages().map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 py-1 sm:px-3 sm:py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center min-w-[32px] sm:min-w-[40px] h-8 sm:h-10"
              >
                {page}
              </span>
            );
          }

          return (
            <Button
              key={`page-${index}-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`px-2 py-1 sm:px-3 sm:py-2 text-sm min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 ${
                currentPage === page
                  ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                  : "bg-white dark:bg-slate-700 text-gray-700 dark:text-white border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px]"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

const ExpertProfiles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    city: "",
    country: "",
    gender: "",
    language: "",
    sport: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [allExperts, setAllExperts] = useState<Expert[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const expertsArray = profiles?.users || [];

  // Helper function to calculate average rating from reviews
  const calculateAverageRating = useCallback(
    (reviews: Review[] = []): number => {
      if (!reviews || reviews.length === 0) return 0;

      const totalRating = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      return totalRating / reviews.length;
    },
    []
  );

  // Helper function to get total completed services count
  const getCompletedServicesCount = useCallback(
    (reviews: Review[] = []): number => {
      if (!reviews || reviews.length === 0) return 0;

      return reviews.filter(
        (review) =>
          review.bookingId !== null &&
          review.bookingId !== undefined &&
          review.bookingId !== ""
      ).length;
    },
    []
  );

  // Store all experts when data is fetched - for client-side filtering
  useEffect(() => {
    if (expertsArray.length > 0) {
      const hasClientSideFilters =
        searchQuery.trim() !== "" ||
        Object.values(filters).some((value) => value !== "");

      if (!hasClientSideFilters) {
        setAllExperts(expertsArray);
      } else if (allExperts.length === 0) {
        setAllExperts(expertsArray);
      }
    }
  }, [expertsArray, searchQuery, filters, allExperts.length]);

  const extractFilterOptions = useCallback(
    (key: keyof Expert, dataArray: Expert[]): string[] => {
      const options = new Set<string>();

      dataArray.forEach((expert: Expert) => {
        if (key === "language" && expert.language) {
          const langs = Array.isArray(expert.language)
            ? expert.language
            : [expert.language];
          langs.forEach((lang) => {
            if (lang) options.add(lang.trim());
          });
        } else if (key === "sports" || key === "sport") {
          if (expert.sports && Array.isArray(expert.sports)) {
            expert.sports.forEach((sport) => {
              if (sport) options.add(sport.trim());
            });
          } else if (expert.sport && typeof expert.sport === "string") {
            options.add(expert.sport.trim());
          }
        } else {
          const value = expert[key];
          if (value && typeof value === "string") options.add(value.trim());
        }
      });

      return Array.from(options).sort();
    },
    []
  );

  // Fetch profiles only on initial load, page change, or limit change (not for filters/search)
  const fetchProfiles = useCallback(() => {
    const hasClientSideFilters =
      searchQuery.trim() !== "" ||
      Object.values(filters).some((value) => value !== "");

    if (!hasClientSideFilters) {
      const params: any = {
        page: currentPage,
        limit,
        userType: "expert",
      };

      console.log("Fetching profiles with params:", params);
      dispatch(getProfiles(params));
    }
  }, [currentPage, limit, dispatch, searchQuery, filters]);

  // Initial load only - don't refetch on filter/search changes
  useEffect(() => {
    const hasClientSideFilters =
      searchQuery.trim() !== "" ||
      Object.values(filters).some((value) => value !== "");

    if (!hasClientSideFilters || allExperts.length === 0) {
      fetchProfiles();
    }
  }, [currentPage, limit]);

  // Client-side filtering and searching
  const filteredAndSearchedExperts = useMemo(() => {
    let filtered = [...allExperts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((expert) => {
        const fullName = `${expert.firstName || ""} ${
          expert.lastName || ""
        }`.toLowerCase();
        const username = expert.username?.toLowerCase() || "";
        const bio = expert.bio?.toLowerCase() || "";
        const profession = expert.profession?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          username.includes(query) ||
          bio.includes(query) ||
          profession.includes(query)
        );
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((expert) => {
          if (key === "sport") {
            if (expert.sports && Array.isArray(expert.sports)) {
              return expert.sports.some((sport) => sport?.trim() === value);
            } else if (expert.sport) {
              return expert.sport.trim() === value;
            }
            return false;
          } else if (key === "language") {
            if (expert.language) {
              const langs = Array.isArray(expert.language)
                ? expert.language
                : [expert.language];
              return langs.some((lang) => lang?.trim() === value);
            }
            return false;
          } else {
            return expert[key]?.trim() === value;
          }
        });
      }
    });

    return filtered;
  }, [allExperts, searchQuery, filters]);

  // Get total pages from API response for server-side pagination
  const apiTotalPages = profiles?.totalPages || 1;
  const apiCurrentPage = profiles?.page || 1;

  // If we have filters or search active, use client-side pagination
  const hasClientSideFilters =
    searchQuery.trim() !== "" ||
    Object.values(filters).some((value) => value !== "");

  let totalPages, displayedExperts, totalFilteredExperts, startIndex, endIndex;

  if (hasClientSideFilters) {
    // Client-side pagination for filtered results
    totalFilteredExperts = filteredAndSearchedExperts.length;
    totalPages = Math.ceil(totalFilteredExperts / limit);
    startIndex = (currentPage - 1) * limit;
    endIndex = startIndex + limit;
    displayedExperts = filteredAndSearchedExperts.slice(startIndex, endIndex);
  } else {
    // Server-side pagination for unfiltered results
    totalPages = apiTotalPages;
    totalFilteredExperts = allExperts.length;
    startIndex = (apiCurrentPage - 1) * limit;
    endIndex = startIndex + Math.min(limit, allExperts.length);
    displayedExperts = allExperts;
  }

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleFilterChange = (value: string, filterType: string) => {
    console.log("Filter changed:", filterType, value);
    const normalizedKey = filterType.toLowerCase();
    let stateKey = "";

    switch (normalizedKey) {
      case "profession":
        stateKey = "profession";
        break;
      case "city":
        stateKey = "city";
        break;
      case "country":
        stateKey = "country";
        break;
      case "gender":
        stateKey = "gender";
        break;
      case "language":
        stateKey = "language";
        break;
      case "sport":
        stateKey = "sport";
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
    console.log("Clearing all filters");
    setSearchQuery("");
    setFilters({
      profession: "",
      city: "",
      country: "",
      gender: "",
      language: "",
      sport: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchQuery !== "" || Object.values(filters).some((value) => value !== "")
    );
  };

  // Get filter options from all experts
  const professionOptions = extractFilterOptions("profession", allExperts);
  const cityOptions = extractFilterOptions("city", allExperts);
  const countryOptions = extractFilterOptions("country", allExperts);
  const genderOptions = extractFilterOptions("gender", allExperts);
  const languageOptions = extractFilterOptions("language", allExperts);
  const sportOptions = [
    ...extractFilterOptions("sports", allExperts),
    ...extractFilterOptions("sport", allExperts),
  ];

  const defaultSports = [
    "Football",
    "Basketball",
    "Tennis",
    "Golf",
    "Rugby",
    "Cricket",
    "Hockey",
    "Swimming",
  ];

  const finalSportOptions =
    sportOptions.length > 0 ? [...new Set(sportOptions)].sort() : defaultSports;

  const filterConfig = [
    {
      name: "Sport",
      options: finalSportOptions,
    },
    {
      name: "Profession",
      options:
        professionOptions.length > 0
          ? professionOptions
          : ["Coach", "Trainer", "Scout"],
    },
    {
      name: "City",
      options:
        cityOptions.length > 0
          ? cityOptions
          : ["London", "Manchester", "Liverpool"],
    },
    {
      name: "Country",
      options:
        countryOptions.length > 0 ? countryOptions : ["UK", "Spain", "Germany"],
    },
    {
      name: "Gender",
      options:
        genderOptions.length > 0 ? genderOptions : ["Male", "Female", "Other"],
    },
    {
      name: "Language",
      options:
        languageOptions.length > 0
          ? languageOptions
          : ["English", "Spanish", "French"],
    },
  ];

  const handleViewProfile = (expert: Expert) => {
    const role = localStorage.getItem("role");
    localStorage.setItem("viewexpertusername", expert.username);
    if (role === "player") {
      navigate("/player/exdetails");
    } else if (role === "sponsor") {
      navigate("/sponsor/exdetails");
    } else if (role === "team") {
      navigate("/team/exdetails");
    } else {
      navigate("/fan/exdetails");
    }
  };

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    setCurrentPage(page);

    const hasClientSideFilters =
      searchQuery.trim() !== "" ||
      Object.values(filters).some((value) => value !== "");

    if (!hasClientSideFilters) {
      const params: any = {
        page: page,
        limit,
        userType: "expert",
      };
      dispatch(getProfiles(params));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    console.log("Limit changed to:", newLimit);
    setLimit(newLimit);
    setCurrentPage(1);

    const params: any = {
      page: 1,
      limit: newLimit,
      userType: "expert",
    };
    dispatch(getProfiles(params));
  };

  console.log("Current state:", {
    searchQuery,
    filters,
    currentPage,
    totalPages,
    apiTotalPages,
    hasClientSideFilters,
    status,
    totalFilteredExperts,
    displayedCount: displayedExperts.length,
    allExpertsCount: allExperts.length,
  });

  return (
    <div className="flex">
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-3 sm:px-6 py-2 rounded-xl dark:bg-slate-800">
          {/* Search Box */}
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full bg-white dark:bg-slate-600 dark:text-white rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search experts by name, username, or bio..."
                className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Responsive Filters Section */}
          <div className="w-full mb-4 sm:mb-8">
            <div
              className="
              grid grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-6
              gap-3 sm:gap-4 pt-1
            "
            >
              {filterConfig.map((filter) => (
                <div key={filter.name} className="w-full">
                  <Select
                    value={
                      filters[filter.name.toLowerCase() as keyof typeof filters]
                    }
                    onValueChange={(value) =>
                      handleFilterChange(value, filter.name)
                    }
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                      <SelectValue placeholder={filter.name} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option, index) => (
                        <SelectItem
                          key={`${filter.name}-${index}`}
                          value={option}
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {hasActiveFilters() && (
                <div className="w-full flex items-center">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full flex items-center justify-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-600 rounded-xl min-h-[48px] text-sm sm:text-base"
                  >
                    <X size={16} /> Clear Filters
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
                Failed to load expert profiles
              </p>
              <p className="text-sm sm:text-base">{error}</p>
              <Button
                className="mt-4 bg-red-600 hover:bg-red-700"
                onClick={fetchProfiles}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* No Experts State */}
          {status === "succeeded" &&
            displayedExperts.length === 0 &&
            allExperts.length > 0 && (
              <div className="text-center p-6 sm:p-10">
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                  No experts found matching your criteria.
                </p>
              </div>
            )}

          {/* No Experts Loaded */}
          {status === "succeeded" && allExperts.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No experts available.
              </p>
            </div>
          )}

          {/* Experts Grid */}
          {status === "succeeded" && displayedExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedExperts.map((expert: Expert, index: number) => {
                const displayName =
                  `${expert.firstName || ""} ${expert.lastName || ""}`.trim() ||
                  expert.username ||
                  "Expert User";

                // Calculate average rating from reviewsReceived
                const avgRating = calculateAverageRating(
                  expert.reviewsReceived
                );
                const totalReviews = getCompletedServicesCount(
                  expert.reviewsReceived
                );

                const expertImage = expert.photo || avatar;
                const isVerified = expert.verified || false;

                const expertSports = expert.sports
                  ? Array.isArray(expert.sports)
                    ? expert.sports.join(", ")
                    : expert.sports
                  : expert.sport || "";

                return (
                  <Card
                    key={expert.id}
                    className="overflow-hidden shadow-md dark:bg-slate-600 dark:text-white hover:shadow-lg transition-shadow duration-200"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-48 sm:h-60">
                      <img
                        className="w-full h-full object-cover"
                        src={expertImage}
                        alt={displayName}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            defaultImages[index % defaultImages.length];
                        }}
                      />
                      {isVerified && (
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 rounded-full p-1 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-1">
                        {displayName}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2 dark:text-gray-300 line-clamp-1">
                        {expert.profession || "Expert Coach"}
                        {expert.city && expert.country
                          ? ` • ${expert.city}, ${expert.country}`
                          : ""}
                      </p>

                      {/* Display sports */}
                      {expertSports && (
                        <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 mb-2 line-clamp-1">
                          {expertSports}
                        </p>
                      )}

                      {expert.subProfession && (
                        <p className="text-gray-600 text-xs sm:text-sm dark:text-gray-300 line-clamp-1 mb-2">
                          {expert.subProfession}
                        </p>
                      )}

                      {/* Star Rating and Reviews */}
                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <div className="flex flex-col">
                          {totalReviews > 0 ? (
                            <>
                              <StarRating
                                rating={avgRating}
                                size="sm"
                                showRating={false}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {avgRating.toFixed(1)}/5
                              </span>
                            </>
                          ) : (
                            <>
                              <StarRating
                                rating={0}
                                size="sm"
                                showRating={false}
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                No reviews yet
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 text-lg sm:text-xl font-bold">
                            {totalReviews}
                          </p>
                          <p className="text-gray-700 text-xs dark:text-gray-300">
                            Services Completed
                          </p>
                        </div>
                      </div>

                      <Button
                        className="mt-3 sm:mt-4 bg-red-600 hover:bg-red-700 w-full text-xs sm:text-sm py-2"
                        onClick={() => handleViewProfile(expert)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Enhanced Pagination Section */}
          {status === "succeeded" && totalPages > 0 && (
            <div className="flex flex-col items-center mt-8 space-y-4 pb-6">
              {/* Items per page selector */}
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

              {/* Pagination Controls */}
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />

              {/* Results Info */}
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span>
                    Showing {Math.min(startIndex + 1, totalFilteredExperts)} to{" "}
                    {Math.min(endIndex, totalFilteredExperts)} of{" "}
                    {totalFilteredExperts} experts
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExpertProfiles;
