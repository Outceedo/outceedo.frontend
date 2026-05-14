import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, X } from "lucide-react";
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
  rating: number;
  bookingId?: string;
}

interface Scout {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profession?: string | null;
  city?: string | null;
  country?: string | null;
  language?: string[] | null;
  sport?: string | null;
  photo?: string | null;
  verified?: boolean | null;
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

const ScoutProfiles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    city: "",
    country: "",
    language: "",
    sport: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const scoutsArray: Scout[] = profiles?.users || [];
  const totalPages = profiles?.totalPages || 1;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(
        searchProfiles({
          q: debouncedSearch.trim(),
          page: currentPage,
          limit,
          role: "scout",
        }),
      );
    } else {
      dispatch(getProfiles({ page: currentPage, limit, userType: "scout" }));
    }
  }, [dispatch, currentPage, limit, debouncedSearch]);

  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  const calculateAverageRating = useCallback(
    (reviews: Review[] = []): number => {
      if (!reviews?.length) return 0;
      return (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      );
    },
    [],
  );

  const getCompletedServicesCount = useCallback(
    (reviews: Review[] = []): number =>
      reviews?.filter((r) => r.bookingId)?.length || 0,
    [],
  );

  const filteredScouts = useMemo(() => {
    let filtered = [...scoutsArray];
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((scout) => {
          if (key === "language") {
            const langs = Array.isArray(scout.language)
              ? scout.language
              : [scout.language];
            return langs.some((l) => l?.trim() === value);
          }
          if (key === "sport") {
            return scout.sport?.trim() === value;
          }
          return (scout as any)[key]?.trim() === value;
        });
      }
    });
    return filtered;
  }, [scoutsArray, filters]);

  const extractOptions = useCallback(
    (key: keyof Scout, dataArray: Scout[]): string[] => {
      const opts = new Set<string>();
      dataArray.forEach((scout) => {
        if (key === "language" && scout.language) {
          const langs = Array.isArray(scout.language)
            ? scout.language
            : [scout.language];
          langs.forEach((l) => l && opts.add(l.trim()));
        } else {
          const value = scout[key];
          if (value && typeof value === "string") opts.add(value.trim());
        }
      });
      return Array.from(opts).sort();
    },
    [],
  );

  const filterConfig = useMemo(
    () => [
      {
        name: "Sport",
        options:
          extractOptions("sport", scoutsArray).length > 0
            ? extractOptions("sport", scoutsArray)
            : ["Football", "Basketball", "Cricket"],
      },
      {
        name: "Profession",
        options:
          extractOptions("profession", scoutsArray).length > 0
            ? extractOptions("profession", scoutsArray)
            : ["Scout"],
      },
      {
        name: "City",
        options:
          extractOptions("city", scoutsArray).length > 0
            ? extractOptions("city", scoutsArray)
            : ["London", "Manchester"],
      },
      {
        name: "Country",
        options:
          extractOptions("country", scoutsArray).length > 0
            ? extractOptions("country", scoutsArray)
            : ["UK", "Spain"],
      },
      {
        name: "Language",
        options:
          extractOptions("language", scoutsArray).length > 0
            ? extractOptions("language", scoutsArray)
            : ["English", "Spanish"],
      },
    ],
    [scoutsArray, extractOptions],
  );

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType.toLowerCase()]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      profession: "",
      city: "",
      country: "",
      language: "",
      sport: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" || Object.values(filters).some((v) => v !== "");

  const handleViewProfile = (scout: Scout) => {
    const role = localStorage.getItem("role");
    localStorage.setItem("viewscoutusername", scout.username);
    const routes: Record<string, string> = {
      player: "/player/scoutdetails",
      team: "/team/scoutdetails",
      sponsor: "/sponsor/scoutdetails",
    };
    navigate(routes[role || ""] || "/fan/scoutdetails");
  };

  return (
    <div className="flex">
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-3 sm:px-6 py-2 rounded-xl dark:bg-slate-800">
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full bg-white dark:bg-slate-600 rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search scouts by name or username..."
                className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full mb-4 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pt-1">
              {filterConfig.map((filter) => (
                <Select
                  key={filter.name}
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
                    {filter.options.map((option, idx) => (
                      <SelectItem key={`${filter.name}-${idx}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 rounded-xl min-h-[48px]"
                >
                  <X size={16} /> Clear
                </Button>
              )}
            </div>
          </div>

          {status === "loading" && (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600" />
            </div>
          )}
          {status === "failed" && error && (
            <div className="text-center p-4 sm:p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              <p className="text-base sm:text-lg font-semibold">
                Failed to load scout profiles
              </p>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}
          {status === "succeeded" && filteredScouts.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No scouts found matching your criteria.
              </p>
            </div>
          )}

          {status === "succeeded" && filteredScouts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredScouts.map((scout) => {
                const displayName =
                  `${scout.firstName || ""} ${scout.lastName || ""}`.trim() ||
                  scout.username ||
                  "Scout";
                const avgRating = calculateAverageRating(
                  scout.reviewsReceived || [],
                );
                const totalReviews = getCompletedServicesCount(
                  scout.reviewsReceived || [],
                );
                return (
                  <Card
                    key={scout.id}
                    className="overflow-hidden shadow-md dark:bg-slate-600 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full h-48 sm:h-60">
                      <img
                        className="w-full h-full object-contain"
                        src={scout.photo || avatar}
                        alt={displayName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = avatar;
                        }}
                      />
                      {scout.verified && (
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
                        {scout.profession || "Scout"}
                        {scout.city && scout.country
                          ? ` - ${scout.city}, ${scout.country}`
                          : ""}
                      </p>
                      {scout.sport && (
                        <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 mb-2 line-clamp-1">
                          {scout.sport}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <StarRating rating={avgRating} />
                        <div className="text-right">
                          <p className="text-red-600 text-lg font-bold">
                            {totalReviews}
                          </p>
                          <p className="text-gray-700 text-xs dark:text-gray-300">
                            Services
                          </p>
                        </div>
                      </div>
                      <Button
                        className="mt-3 bg-red-600 hover:bg-red-700 w-full text-xs sm:text-sm py-2"
                        onClick={() => handleViewProfile(scout)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {status === "succeeded" && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pb-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScoutProfiles;
