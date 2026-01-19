import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfiles } from "../../store/profile-slice";
import avatar from "../../assets/images/avatar.png";

// UI Components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

// --- Types ---

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
  company?: string; // Often used as Team Name
  bio?: string;
  photo?: string;
  city?: string;
  country?: string;
  sport?: string;
  sports?: string[];
  language?: string[];
  gender?: string; // Men's / Women's / Mixed
  teamType?: string; // Grassroot, Club, Academy, League, Premier League, Championship
  teamCategory?: string; // Men's, Women's, Others
  reviewsReceived?: Review[];
  verified?: boolean;
  [key: string]: any;
}

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// --- Helper Components ---

// Star Rating Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        <FontAwesomeIcon icon={faStar} className="text-sm" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300 ml-1 font-medium">
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
    </div>
  );
};

// Enhanced Pagination Component
const Pagination = React.memo(
  ({ totalPages, currentPage, onPageChange }: PaginationProps) => {
    const handlePrev = useCallback(() => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    }, [currentPage, totalPages, onPageChange]);

    const getVisiblePages = useCallback(() => {
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
    }, [totalPages, currentPage]);

    const visiblePages = useMemo(() => getVisiblePages(), [getVisiblePages]);

    return (
      <div className="flex justify-center mt-6 space-x-1 sm:space-x-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <div className="flex space-x-1 sm:space-x-2">
          {visiblePages.map((page, index) => (
            <button
              key={
                typeof page === "number" ? `page-${page}` : `ellipsis-${index}`
              }
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
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

// --- Main Component ---

export default function TeamProfiles() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux State
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  // Constants
  const dispatchRef = useRef(dispatch);
  const targetProfileType = "team"; // We are fetching TEAMS

  // Data Extraction
  const usersArray = profiles?.users || [];
  const backendTotalPages = profiles?.totalPages || 1;
  const backendPage = profiles?.page || 1;
  const totalCount = profiles?.totalCount || usersArray.length;

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const [filters, setFilters] = useState({
    sport: "",
    city: "",
    country: "",
    gender: "",
    language: "",
    teamType: "",
    teamCategory: "",
  });

  // Sync data
  useEffect(() => {
    if (usersArray.length > 0) {
      setAllProfiles(usersArray);
    } else if (usersArray.length === 0 && status === "succeeded") {
      setAllProfiles([]);
    }
  }, [usersArray, status]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Logic
  const fetchProfiles = useCallback(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit,
      userType: targetProfileType,
    };
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }
    dispatchRef.current(getProfiles(params));
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // --- Filtering Logic ---

  const extractFilterOptions = useCallback(
    (key: keyof Profile, dataArray: Profile[]): string[] => {
      const options = new Set<string>();
      dataArray.forEach((profile: Profile) => {
        if (key === "language" && profile.language) {
          const langs = Array.isArray(profile.language)
            ? profile.language
            : [profile.language];
          langs.forEach((lang) => {
            if (lang) options.add(lang.trim());
          });
        } else if (key === "sports" || key === "sport") {
          if (profile.sports && Array.isArray(profile.sports)) {
            profile.sports.forEach((sport) => {
              if (sport) options.add(sport.trim());
            });
          } else if (profile.sport && typeof profile.sport === "string") {
            options.add(profile.sport.trim());
          }
        } else {
          const value = profile[key];
          if (value && typeof value === "string") options.add(value.trim());
        }
      });
      return Array.from(options).sort();
    },
    [],
  );

  const filteredProfiles = useMemo(() => {
    let filtered = [...allProfiles];

    // Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((profile) => {
        const teamName = profile.company?.toLowerCase() || "";
        const username = profile.username?.toLowerCase() || "";
        const bio = profile.bio?.toLowerCase() || "";
        return (
          teamName.includes(query) ||
          username.includes(query) ||
          bio.includes(query)
        );
      });
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((profile) => {
          if (key === "sport") {
            if (profile.sports && Array.isArray(profile.sports)) {
              return profile.sports.some((s) => s?.trim() === value);
            }
            return profile.sport?.trim() === value;
          } else if (key === "language") {
            const langs = Array.isArray(profile.language)
              ? profile.language
              : [profile.language];
            return langs.some((l) => l?.trim() === value);
          } else if (key === "teamType") {
            return (
              profile.teamType?.trim().toLowerCase() === value.toLowerCase()
            );
          } else {
            return profile[key as keyof Profile]?.trim() === value;
          }
        });
      }
    });

    return filtered;
  }, [allProfiles, searchTerm, filters]);

  // Filter Options Generation
  const sportOptions = useMemo(
    () => [
      ...extractFilterOptions("sports", allProfiles),
      ...extractFilterOptions("sport", allProfiles),
    ],
    [allProfiles, extractFilterOptions],
  );
  const cityOptions = useMemo(
    () => extractFilterOptions("city", allProfiles),
    [allProfiles, extractFilterOptions],
  );
  const countryOptions = useMemo(
    () => extractFilterOptions("country", allProfiles),
    [allProfiles, extractFilterOptions],
  );
  const genderOptions = useMemo(
    () => extractFilterOptions("gender", allProfiles),
    [allProfiles, extractFilterOptions],
  );
  const teamTypeOptions = useMemo(
    () => extractFilterOptions("teamType", allProfiles),
    [allProfiles, extractFilterOptions],
  );
  const teamCategoryOptions = useMemo(
    () => extractFilterOptions("teamCategory", allProfiles),
    [allProfiles, extractFilterOptions],
  );

  // Default Fallbacks
  const defaultSports = ["Football", "Basketball", "Cricket", "Hockey"];
  const finalSportOptions =
    sportOptions.length > 0 ? [...new Set(sportOptions)].sort() : defaultSports;

  const defaultTeamTypes = [
    "Grassroot",
    "Club",
    "Academy",
    "League",
    "Premier League",
    "Championship",
  ];
  const finalTeamTypeOptions =
    teamTypeOptions.length > 0
      ? [...new Set(teamTypeOptions)].sort()
      : defaultTeamTypes;

  const defaultTeamCategories = ["Men's", "Women's", "Others"];
  const finalTeamCategoryOptions =
    teamCategoryOptions.length > 0
      ? [...new Set(teamCategoryOptions)].sort()
      : defaultTeamCategories;

  // Handlers
  const handleFilterChange = (value: string, filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      sport: "",
      city: "",
      country: "",
      gender: "",
      language: "",
      teamType: "",
      teamCategory: "",
    });
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" || Object.values(filters).some((value) => value !== "")
    );
  }, [searchTerm, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewProfile = (profile: Profile) => {
    localStorage.setItem("viewteamusername", profile.username);
    // Assuming you have a route for viewing a specific team profile
    // Determine current user role to route correctly
    const role = localStorage.getItem("role");
    if (role === "player") navigate("/player/teaminfo");
    else if (role === "team") navigate("/team/teaminfo");
    else if (role === "sponsor") navigate("/sponsor/teaminfo");
    else navigate("/expert/teaminfo");
  };

  const calculateAverageRating = (reviews: Review[] = []) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  };

  // Pagination display calculation
  const displayedProfiles = filteredProfiles;
  const startIndex = (backendPage - 1) * limit;
  const endIndex = startIndex + displayedProfiles.length;

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
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-1">
          {/* Sport Filter */}
          <div className="w-full">
            <Select
              value={filters.sport}
              onValueChange={(val) => handleFilterChange(val, "sport")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                {finalSportOptions.map((opt, i) => (
                  <SelectItem key={`sport-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="w-full">
            <Select
              value={filters.city}
              onValueChange={(val) => handleFilterChange(val, "city")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {(cityOptions.length > 0
                  ? cityOptions
                  : ["London", "Manchester"]
                ).map((opt, i) => (
                  <SelectItem key={`city-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="w-full">
            <Select
              value={filters.country}
              onValueChange={(val) => handleFilterChange(val, "country")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {(countryOptions.length > 0
                  ? countryOptions
                  : ["UK", "USA"]
                ).map((opt, i) => (
                  <SelectItem key={`country-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Type Filter */}
          <div className="w-full">
            <Select
              value={filters.teamType}
              onValueChange={(val) => handleFilterChange(val, "teamType")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Team Type" />
              </SelectTrigger>
              <SelectContent>
                {finalTeamTypeOptions.map((opt, i) => (
                  <SelectItem key={`teamType-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Category Filter */}
          <div className="w-full">
            <Select
              value={filters.teamCategory}
              onValueChange={(val) => handleFilterChange(val, "teamCategory")}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Team Category" />
              </SelectTrigger>
              <SelectContent>
                {finalTeamCategoryOptions.map((opt, i) => (
                  <SelectItem key={`teamCategory-${i}`} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="w-full flex items-center">
              <button
                onClick={clearAllFilters}
                className="w-full flex items-center justify-center gap-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-600 rounded-xl min-h-[48px] text-base px-4 py-2"
              >
                <X size={18} /> Clear Filters
              </button>
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
            Failed to load teams
          </p>
          <button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={fetchProfiles}
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Results States */}
      {status === "succeeded" &&
        displayedProfiles.length === 0 &&
        allProfiles.length > 0 && (
          <div className="text-center p-6 sm:p-10">
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              No teams found matching your criteria.
            </p>
          </div>
        )}

      {status === "succeeded" && allProfiles.length === 0 && (
        <div className="text-center p-6 sm:p-10">
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
            No teams available.
          </p>
        </div>
      )}

      {/* Team List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {status === "succeeded" &&
          displayedProfiles.map((profile) => {
            // For teams, 'company' is often the Team Name. Fallback to username.
            const displayName =
              profile.teamName?.trim() || profile.firstName?.trim();
            const avgRating = calculateAverageRating(profile.reviewsReceived);
            const reviewCount = profile.reviewsReceived?.length || 0;
            const teamSports = profile.sports
              ? Array.isArray(profile.sports)
                ? profile.sports.join(", ")
                : profile.sports
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
                      const target = e.target as HTMLImageElement;
                      target.src = avatar;
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
                    Team{" "}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 line-clamp-1">
                    {profile.city && profile.country
                      ? `${profile.city}, ${profile.country}`
                      : "Location N/A"}
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

      {/* Pagination Footer */}
      {status === "succeeded" && backendTotalPages >= 1 && (
        <div className="flex flex-col items-center mt-8 space-y-4 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Items per page:
            </span>
            <select
              value={limit}
              onChange={handleLimitChange}
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
            <span>
              Showing {Math.min(startIndex + 1, totalCount)} to{" "}
              {Math.min(endIndex, totalCount)} of {totalCount} teams
            </span>
            <span className="mx-2 hidden sm:inline">•</span>
            <span>
              Page {backendPage} of {backendTotalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
