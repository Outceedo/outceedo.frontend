import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfiles, searchProfiles } from "../../store/profile-slice";
import avatar from "../../assets/images/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
}

interface Profile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  teamName?: string;
  company?: string;
  bio?: string;
  photo?: string;
  city?: string;
  country?: string;
  sport?: string;
  sports?: string[];
  language?: string[];
  gender?: string;
  teamType?: string;
  teamCategory?: string;
  reviewsReceived?: Review[];
  verified?: boolean;
  [key: string]: any;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1">
    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
    <span className="text-sm text-gray-600 dark:text-gray-300 ml-1 font-medium">
      {rating > 0 ? rating.toFixed(1) : "New"}
    </span>
  </div>
);

const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = React.memo(({ totalPages, currentPage, onPageChange }) => {
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
    <div className="flex justify-center mt-6 space-x-1 sm:space-x-2">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      <div className="flex space-x-1 sm:space-x-2">
        {getVisiblePages().map((page, index) => (
          <button
            key={typeof page === "number" ? `page-${page}` : `ellipsis-${index}`}
            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer text-sm ${
              typeof page === "number" && currentPage === page
                ? "bg-red-600 text-white"
                : typeof page === "number"
                  ? "bg-gray-200 dark:bg-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
                  : "bg-transparent cursor-default dark:text-gray-400"
            }`}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={typeof page !== "number"}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
});

Pagination.displayName = "Pagination";

export default function TeamProfiles() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const usersArray = (profiles?.users || []) as Profile[];
  const backendTotalPages = profiles?.totalPages || 1;
  const backendPage = profiles?.page || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const [filters, setFilters] = useState({
    sport: "",
    city: "",
    country: "",
    teamType: "",
    teamCategory: "",
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch teams - use search API when there's a search query
  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(
        searchProfiles({
          q: debouncedSearch.trim(),
          page: currentPage,
          limit,
          role: "team",
        })
      );
    } else {
      dispatch(getProfiles({ page: currentPage, limit, userType: "team" }));
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

  // Client-side filtering for dropdown filters
  const filteredProfiles = useMemo(() => {
    let filtered = [...usersArray];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((profile) => {
          if (key === "sport") {
            if (Array.isArray(profile.sports)) {
              return profile.sports.some((s) => s?.trim() === value);
            }
            return profile.sport?.trim() === value;
          }
          if (key === "teamType") {
            return profile.teamType?.trim().toLowerCase() === value.toLowerCase();
          }
          return profile[key]?.trim() === value;
        });
      }
    });

    return filtered;
  }, [usersArray, filters]);

  const extractFilterOptions = useCallback(
    (key: keyof Profile, dataArray: Profile[]): string[] => {
      const options = new Set<string>();
      dataArray.forEach((profile) => {
        if (key === "sports" || key === "sport") {
          if (Array.isArray(profile.sports)) {
            profile.sports.forEach((s) => s && options.add(s.trim()));
          } else if (profile.sport) {
            options.add(profile.sport.trim());
          }
        } else {
          const value = profile[key];
          if (value && typeof value === "string") options.add(value.trim());
        }
      });
      return Array.from(options).sort();
    },
    []
  );

  const defaultSports = ["Football", "Basketball", "Cricket", "Hockey"];
  const defaultTeamTypes = ["Grassroot", "Club", "Academy", "League", "Premier League", "Championship"];
  const defaultTeamCategories = ["Men's", "Women's", "Others"];

  const sportOptions = useMemo(() => {
    const opts = [
      ...extractFilterOptions("sports", usersArray),
      ...extractFilterOptions("sport", usersArray),
    ];
    return opts.length ? [...new Set(opts)].sort() : defaultSports;
  }, [usersArray, extractFilterOptions]);

  const cityOptions = useMemo(
    () => extractFilterOptions("city", usersArray).length ? extractFilterOptions("city", usersArray) : ["London", "Manchester"],
    [usersArray, extractFilterOptions]
  );
  const countryOptions = useMemo(
    () => extractFilterOptions("country", usersArray).length ? extractFilterOptions("country", usersArray) : ["UK", "USA"],
    [usersArray, extractFilterOptions]
  );
  const teamTypeOptions = useMemo(
    () => extractFilterOptions("teamType", usersArray).length ? extractFilterOptions("teamType", usersArray) : defaultTeamTypes,
    [usersArray, extractFilterOptions]
  );
  const teamCategoryOptions = useMemo(
    () => extractFilterOptions("teamCategory", usersArray).length ? extractFilterOptions("teamCategory", usersArray) : defaultTeamCategories,
    [usersArray, extractFilterOptions]
  );

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ sport: "", city: "", country: "", teamType: "", teamCategory: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || Object.values(filters).some((v) => v !== "");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleViewProfile = (profile: Profile) => {
    localStorage.setItem("viewteamusername", profile.username);
    const role = localStorage.getItem("role");
    const routes: Record<string, string> = {
      player: "/player/teaminfo",
      team: "/team/teaminfo",
      sponsor: "/sponsor/teaminfo",
    };
    navigate(routes[role || ""] || "/expert/teaminfo");
  };

  return (
    <div className="px-3 sm:px-6 py-2 w-full mx-auto dark:bg-gray-900">
      {/* Search Bar */}
      <div className="mb-4 sm:mb-6 w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search teams by name, sport, or city..."
            className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-1">
          {/* Sport Filter */}
          <Select value={filters.sport} onValueChange={(val) => handleFilterChange(val, "sport")}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent>
              {sportOptions.map((opt, i) => (
                <SelectItem key={`sport-${i}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City Filter */}
          <Select value={filters.city} onValueChange={(val) => handleFilterChange(val, "city")}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((opt, i) => (
                <SelectItem key={`city-${i}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country Filter */}
          <Select value={filters.country} onValueChange={(val) => handleFilterChange(val, "country")}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((opt, i) => (
                <SelectItem key={`country-${i}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Team Type Filter */}
          <Select value={filters.teamType} onValueChange={(val) => handleFilterChange(val, "teamType")}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
              <SelectValue placeholder="Team Type" />
            </SelectTrigger>
            <SelectContent>
              {teamTypeOptions.map((opt, i) => (
                <SelectItem key={`teamType-${i}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Team Category Filter */}
          <Select value={filters.teamCategory} onValueChange={(val) => handleFilterChange(val, "teamCategory")}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
              <SelectValue placeholder="Team Category" />
            </SelectTrigger>
            <SelectContent>
              {teamCategoryOptions.map((opt, i) => (
                <SelectItem key={`teamCategory-${i}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 rounded-xl min-h-[48px] text-base px-4 py-2"
            >
              <X size={18} /> Clear Filters
            </button>
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
          <p className="text-base sm:text-lg font-semibold">Failed to load teams</p>
        </div>
      )}

      {/* No Results */}
      {status === "succeeded" && filteredProfiles.length === 0 && (
        <div className="text-center p-6 sm:p-10">
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
            No teams found matching your criteria.
          </p>
        </div>
      )}

      {/* Team List Grid */}
      {status === "succeeded" && filteredProfiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProfiles.map((profile) => {
            const displayName = profile.teamName?.trim() || profile.firstName?.trim() || profile.username;
            const avgRating = calculateAverageRating(profile.reviewsReceived);
            const reviewCount = profile.reviewsReceived?.length || 0;
            const teamSports = Array.isArray(profile.sports)
              ? profile.sports.join(", ")
              : profile.sport || "";

            return (
              <Card
                key={profile.id}
                className="overflow-hidden dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative">
                  <img
                    src={profile.photo || avatar}
                    alt={displayName}
                    className="w-full h-52 sm:h-56 p-2 rounded-lg object-contain bg-gray-50 dark:bg-gray-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = avatar;
                    }}
                  />
                  {profile.verified && (
                    <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <CardHeader className="px-3 sm:px-4 pb-0 pt-2">
                  <h3 className="text-base sm:text-lg font-semibold line-clamp-1 dark:text-white">
                    {displayName}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 line-clamp-1">
                    Team
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 line-clamp-1">
                    {profile.city && profile.country ? `${profile.city}, ${profile.country}` : "Location N/A"}
                  </p>
                  {teamSports && (
                    <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 my-1 line-clamp-1">
                      {teamSports.toUpperCase()}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="px-3 sm:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <StarRating rating={avgRating} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="px-3 sm:px-4 pt-0 pb-4">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                    onClick={() => handleViewProfile(profile)}
                  >
                    View Team
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {status === "succeeded" && backendTotalPages >= 1 && (
        <div className="flex flex-col items-center mt-8 space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Items per page:
            </span>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 min-w-[80px]"
            >
              {[4, 8, 12, 16, 20].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <Pagination
            totalPages={backendTotalPages}
            currentPage={backendPage}
            onPageChange={handlePageChange}
          />

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
            Page {backendPage} of {backendTotalPages}
          </div>
        </div>
      )}
    </div>
  );
}
