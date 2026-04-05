import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfiles, searchProfiles } from "../../store/profile-slice";
import avatar from "../../assets/images/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  bookingId?: string;
}

interface Profile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  photo?: string;
  city?: string;
  country?: string;
  profession?: string;
  subProfession?: string;
  sports?: string[];
  sport?: string;
  language?: string[];
  gender?: string;
  reviewsReceived?: Review[];
  verified?: boolean;
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
    <div className="flex justify-center mt-6 space-x-1 sm:space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
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
                  ? "bg-gray-200 dark:bg-slate-600 dark:text-white hover:bg-gray-300"
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
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

const PlayerProfiles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    sport: "",
    profession: "",
    city: "",
    country: "",
    gender: "",
    language: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const usersArray = (profiles?.users || []) as Profile[];
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
          role: "player",
        })
      );
    } else {
      dispatch(getProfiles({ page: currentPage, limit, userType: "player" }));
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
          if (key === "language") {
            const langs = Array.isArray(profile.language)
              ? profile.language
              : [profile.language];
            return langs.some((l) => l?.trim() === value);
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
        if (key === "language" && profile.language) {
          const langs = Array.isArray(profile.language)
            ? profile.language
            : [profile.language];
          langs.forEach((l) => l && options.add(l.trim()));
        } else if (key === "sports" || key === "sport") {
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

  const filterConfig = useMemo(() => {
    const defaultSports = ["Football", "Basketball", "Tennis", "Cricket", "Rugby", "Swimming"];
    const sportOpts = [
      ...extractFilterOptions("sports", usersArray),
      ...extractFilterOptions("sport", usersArray),
    ];

    return [
      { name: "Sport", options: sportOpts.length ? [...new Set(sportOpts)].sort() : defaultSports },
      { name: "Profession", options: extractFilterOptions("profession", usersArray).length ? extractFilterOptions("profession", usersArray) : ["Footballer", "Basketball Player"] },
      { name: "City", options: extractFilterOptions("city", usersArray).length ? extractFilterOptions("city", usersArray) : ["London", "Manchester"] },
      { name: "Country", options: extractFilterOptions("country", usersArray).length ? extractFilterOptions("country", usersArray) : ["UK", "Spain", "Germany"] },
      { name: "Gender", options: extractFilterOptions("gender", usersArray).length ? extractFilterOptions("gender", usersArray) : ["Male", "Female", "Other"] },
      { name: "Language", options: extractFilterOptions("language", usersArray).length ? extractFilterOptions("language", usersArray) : ["English", "Spanish", "French"] },
    ];
  }, [usersArray, extractFilterOptions]);

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType.toLowerCase()]: value }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({ sport: "", profession: "", city: "", country: "", gender: "", language: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || Object.values(filters).some((v) => v !== "");

  const handleViewProfile = (profile: Profile) => {
    localStorage.setItem("viewplayerusername", profile.username);
    const role = localStorage.getItem("role");
    const routes: Record<string, string> = {
      player: "/player/playerinfo",
      expert: "/expert/playerinfo",
      team: "/team/playerinfo",
      sponsor: "/sponsor/playerinfo",
    };
    navigate(routes[role || ""] || "/fan/playerinfo");
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
    <div className="flex bg">
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-3 sm:px-6 mt-2 rounded-xl">
          {/* Search Box */}
          <div className="mb-4 sm:mb-6 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search players by name or username..."
                className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="w-full mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pt-1">
              {filterConfig.map((filter) => (
                <div key={filter.name} className="w-full">
                  <Select
                    onValueChange={(value) => handleFilterChange(value, filter.name)}
                    value={filters[filter.name.toLowerCase() as keyof typeof filters] || ""}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                      <SelectValue placeholder={filter.name} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option, index) => (
                        <SelectItem key={`${filter.name}-${index}`} value={option}>
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
              <p className="text-base sm:text-lg font-semibold">Failed to load profiles</p>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* No Results */}
          {status === "succeeded" && filteredProfiles.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No players found matching your criteria.
              </p>
            </div>
          )}

          {/* Players Grid */}
          {status === "succeeded" && filteredProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProfiles.map((profile) => {
                const displayName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
                const avgRating = calculateAverageRating(profile.reviewsReceived);
                const playerSports = Array.isArray(profile.sports)
                  ? profile.sports.join(", ")
                  : profile.sport || "";

                return (
                  <Card
                    key={profile.id}
                    className="overflow-hidden dark:bg-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        className="w-full h-50 sm:h-56 p-2 rounded-lg object-contain"
                        src={profile.photo || avatar}
                        alt={displayName}
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
                    <CardHeader className="px-3 sm:px-4 pb-0">
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-1">
                        {displayName || profile.username}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 line-clamp-1">
                        {profile.profession || "Player"}
                        {profile.city && profile.country ? ` - ${profile.city}, ${profile.country}` : ""}
                      </p>
                      {playerSports && (
                        <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 my-1 line-clamp-1">
                          {playerSports.toUpperCase()}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="px-2 sm:px-3 -mt-4">
                      <StarRating rating={avgRating} />
                    </CardContent>
                    <CardFooter className="px-3 sm:px-4 pt-0">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-2"
                        onClick={() => handleViewProfile(profile)}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {status === "succeeded" && totalPages >= 1 && (
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

export default PlayerProfiles;
