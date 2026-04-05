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
import { getProfiles, searchProfiles } from "@/store/profile-slice";

interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Expert {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profession?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  gender?: string | null;
  language?: string[] | null;
  sports?: string[] | null;
  sport?: string | null;
  photo?: string | null;
  verified?: boolean | null;
  subProfession?: string | null;
  reviewsReceived?: Review[] | null;
  [key: string]: any;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1">
    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
    <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
      {rating > 0 ? `${rating.toFixed(1)}/5` : "No reviews yet"}
    </span>
  </div>
);

const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
  const getVisiblePages = useCallback(() => {
    const delta = window.innerWidth < 768 ? 1 : 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

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
  }, [totalPages, currentPage]);

  return (
    <div className="flex justify-center items-center mt-6 space-x-1 sm:space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 h-8 sm:h-10 min-w-[32px] sm:min-w-[40px]"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <div className="flex space-x-1 sm:space-x-2">
        {getVisiblePages().map((page, index) =>
          typeof page === "string" ? (
            <span
              key={`dots-${index}`}
              className="px-2 py-1 sm:px-3 sm:py-2 text-sm text-gray-500 dark:text-gray-400"
            >
              {page}
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`px-2 py-1 sm:px-3 sm:py-2 text-sm min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 ${
                currentPage === page
                  ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                  : "bg-white dark:bg-slate-700 text-gray-700 dark:text-white border-gray-300 dark:border-slate-600"
              }`}
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const expertsArray = profiles?.users || [];
  const totalPages = profiles?.totalPages || 1;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch profiles - use search API when there's a search query
  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(
        searchProfiles({
          q: debouncedSearch.trim(),
          page: currentPage,
          limit,
          role: "expert",
        })
      );
    } else {
      dispatch(getProfiles({ page: currentPage, limit, userType: "expert" }));
    }
  }, [dispatch, currentPage, limit, debouncedSearch]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const calculateAverageRating = useCallback((reviews: Review[] = []): number => {
    if (!reviews?.length) return 0;
    return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  }, []);

  const getCompletedServicesCount = useCallback((reviews: Review[] = []): number => {
    return reviews?.filter((r) => r.bookingId)?.length || 0;
  }, []);

  // Client-side filtering for dropdown filters
  const filteredExperts = useMemo(() => {
    let filtered = [...expertsArray];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((expert) => {
          if (key === "sport") {
            if (Array.isArray(expert.sports)) {
              return expert.sports.some((s) => s?.trim() === value);
            }
            return expert.sport?.trim() === value;
          }
          if (key === "language") {
            const langs = Array.isArray(expert.language)
              ? expert.language
              : [expert.language];
            return langs.some((l) => l?.trim() === value);
          }
          return expert[key]?.trim() === value;
        });
      }
    });

    return filtered;
  }, [expertsArray, filters]);

  const extractFilterOptions = useCallback(
    (key: keyof Expert, dataArray: Expert[]): string[] => {
      const options = new Set<string>();
      dataArray.forEach((expert) => {
        if (key === "language" && expert.language) {
          const langs = Array.isArray(expert.language)
            ? expert.language
            : [expert.language];
          langs.forEach((l) => l && options.add(l.trim()));
        } else if (key === "sports" || key === "sport") {
          if (Array.isArray(expert.sports)) {
            expert.sports.forEach((s) => s && options.add(s.trim()));
          } else if (expert.sport) {
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

  const filterConfig = useMemo(() => {
    const defaultSports = ["Football", "Basketball", "Tennis", "Golf", "Rugby", "Cricket"];
    const sportOpts = [
      ...extractFilterOptions("sports", expertsArray),
      ...extractFilterOptions("sport", expertsArray),
    ];

    return [
      { name: "Sport", options: sportOpts.length ? [...new Set(sportOpts)].sort() : defaultSports },
      { name: "Profession", options: extractFilterOptions("profession", expertsArray).length ? extractFilterOptions("profession", expertsArray) : ["Coach", "Trainer", "Scout"] },
      { name: "City", options: extractFilterOptions("city", expertsArray).length ? extractFilterOptions("city", expertsArray) : ["London", "Manchester"] },
      { name: "Country", options: extractFilterOptions("country", expertsArray).length ? extractFilterOptions("country", expertsArray) : ["UK", "Spain", "Germany"] },
      { name: "Gender", options: extractFilterOptions("gender", expertsArray).length ? extractFilterOptions("gender", expertsArray) : ["Male", "Female", "Other"] },
      { name: "Language", options: extractFilterOptions("language", expertsArray).length ? extractFilterOptions("language", expertsArray) : ["English", "Spanish", "French"] },
    ];
  }, [expertsArray, extractFilterOptions]);

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType.toLowerCase()]: value }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({ profession: "", city: "", country: "", gender: "", language: "", sport: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || Object.values(filters).some((v) => v !== "");

  const handleViewProfile = (expert: Expert) => {
    const role = localStorage.getItem("role");
    localStorage.setItem("viewexpertusername", expert.username);
    const routes: Record<string, string> = {
      player: "/player/exdetails",
      sponsor: "/sponsor/exdetails",
      team: "/team/exdetails",
    };
    navigate(routes[role || ""] || "/fan/exdetails");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="flex">
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-3 sm:px-6 py-2 rounded-xl dark:bg-slate-800">
          {/* Search Box */}
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full bg-white dark:bg-slate-600 rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search experts by name or username..."
                className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="w-full mb-4 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pt-1">
              {filterConfig.map((filter) => (
                <div key={filter.name} className="w-full">
                  <Select
                    value={filters[filter.name.toLowerCase() as keyof typeof filters]}
                    onValueChange={(value) => handleFilterChange(value, filter.name)}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                      <SelectValue placeholder={filter.name} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option, idx) => (
                        <SelectItem key={`${filter.name}-${idx}`} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {hasActiveFilters && (
                <div className="w-full flex items-center">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full flex items-center justify-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 rounded-xl min-h-[48px]"
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
              <p className="text-base sm:text-lg font-semibold">Failed to load expert profiles</p>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* No Results */}
          {status === "succeeded" && filteredExperts.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No experts found matching your criteria.
              </p>
            </div>
          )}

          {/* Experts Grid */}
          {status === "succeeded" && filteredExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredExperts.map((expert) => {
                const displayName =
                  `${expert.firstName || ""} ${expert.lastName || ""}`.trim() ||
                  expert.username ||
                  "Expert User";
                const avgRating = calculateAverageRating(expert.reviewsReceived);
                const totalReviews = getCompletedServicesCount(expert.reviewsReceived);
                const expertSports = Array.isArray(expert.sports)
                  ? expert.sports.join(", ")
                  : expert.sport || "";

                return (
                  <Card
                    key={expert.id}
                    className="overflow-hidden shadow-md dark:bg-slate-600 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full h-48 sm:h-60">
                      <img
                        className="w-full h-full object-contain"
                        src={expert.photo || avatar}
                        alt={displayName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = avatar;
                        }}
                      />
                      {expert.verified && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-1">
                        {displayName}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2 dark:text-gray-300 line-clamp-1">
                        {expert.profession || "Expert Coach"}
                        {expert.city && expert.country ? ` - ${expert.city}, ${expert.country}` : ""}
                      </p>

                      {expertSports && (
                        <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 mb-2 line-clamp-1">
                          {expertSports}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <StarRating rating={avgRating} />
                        <div className="text-right">
                          <p className="text-red-600 text-lg font-bold">{totalReviews}</p>
                          <p className="text-gray-700 text-xs dark:text-gray-300">Services</p>
                        </div>
                      </div>

                      <Button
                        className="mt-3 bg-red-600 hover:bg-red-700 w-full text-xs sm:text-sm py-2"
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

          {/* Pagination */}
          {status === "succeeded" && totalPages > 0 && (
            <div className="flex flex-col items-center mt-8 space-y-4 pb-6">
              <div className="flex items-center gap-4">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Items per page:
                </span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                >
                  {[4, 8, 12, 16, 20].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />

              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExpertProfiles;
