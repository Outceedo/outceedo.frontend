import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfiles } from "../../store/profile-slice";
import avatar from "../../assets/images/avatar.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

type Role = "player" | "expert" | "sponsor";

export interface DocumentItem {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type?: string;
  description?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadItem {
  id: string;
  title: string;
  url: string;
  type?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

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

export interface Profile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  birthYear?: number;
  bio?: string;
  gender?: string;
  photo?: string;
  city?: string;
  country?: string;
  height?: number;
  weight?: number;
  skinColor?: string | null;
  company?: string;
  profession?: string;
  subProfession?: string;
  role?: "player" | "expert" | "admin";
  language?: string[];
  interests?: string[];
  sports?: string[];
  sport?: string;
  services?: any[];
  documents?: DocumentItem[];
  uploads?: UploadItem[];
  socialLinks?: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviews?: number;
  reviewsReceived?: Review[];
  verified?: boolean;
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

// Pagination Component updated to always show controls
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

const PlayerProfiles: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
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
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profiles and pagination from Redux store
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  // Backend pagination info
  const usersArray = profiles?.users || [];
  const backendTotalPages = profiles?.totalPages || 1;
  const backendPage = profiles?.page || 1;

  // Store all profiles when data is fetched
  useEffect(() => {
    if (usersArray.length > 0) {
      setAllProfiles(usersArray);
    }
  }, [usersArray]);

  // Determine user type to fetch opposite profiles
  const userRole = localStorage.getItem("role") as Role;
  const profileType: Role =
    userRole === "expert"
      ? "player"
      : userRole === "sponsor"
      ? "player"
      : "player";

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

  // Helper function to get total reviews count
  const getTotalReviewsCount = useCallback((reviews: Review[] = []): number => {
    return reviews?.length || 0;
  }, []);

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
    []
  );

  // Fetch profiles from backend with pagination params
  const fetchProfiles = useCallback(() => {
    const params: any = {
      page: currentPage,
      limit,
      userType: profileType,
    };
    dispatch(getProfiles(params));
  }, [currentPage, limit, profileType, dispatch]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Client-side filtering and searching (only on current page for backend paging)
  const filteredAndSearchedProfiles = useMemo(() => {
    let filtered = [...allProfiles];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((profile) => {
        const fullName = `${profile.firstName || ""} ${
          profile.lastName || ""
        }`.toLowerCase();
        const username = profile.username?.toLowerCase() || "";
        const bio = profile.bio?.toLowerCase() || "";
        const profession = profile.profession?.toLowerCase() || "";
        const subProfession = profile.subProfession?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          username.includes(query) ||
          bio.includes(query) ||
          profession.includes(query) ||
          subProfession.includes(query)
        );
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((profile) => {
          if (key === "sport") {
            if (profile.sports && Array.isArray(profile.sports)) {
              return profile.sports.some((sport) => sport?.trim() === value);
            } else if (profile.sport) {
              return profile.sport.trim() === value;
            }
            return false;
          } else if (key === "language") {
            if (profile.language) {
              const langs = Array.isArray(profile.language)
                ? profile.language
                : [profile.language];
              return langs.some((lang) => lang?.trim() === value);
            }
            return false;
          } else {
            return profile[key]?.trim() === value;
          }
        });
      }
    });

    return filtered;
  }, [allProfiles, searchQuery, filters]);

  // For backend paging, show only the profiles returned for the current page
  const displayedProfiles = filteredAndSearchedProfiles;

  // Filter options from all current loaded profiles
  const sportOptions = [
    ...extractFilterOptions("sports", allProfiles),
    ...extractFilterOptions("sport", allProfiles),
  ];
  const professionOptions = extractFilterOptions("profession", allProfiles);
  const cityOptions = extractFilterOptions("city", allProfiles);
  const countryOptions = extractFilterOptions("country", allProfiles);
  const genderOptions = extractFilterOptions("gender", allProfiles);
  const languageOptions = extractFilterOptions("language", allProfiles);

  const defaultSports = [
    "Football",
    "Basketball",
    "Tennis",
    "Cricket",
    "Rugby",
    "Swimming",
    "Athletics",
    "Volleyball",
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
          : ["Footballer", "Basketball Player", "Tennis Player"],
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

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters({
      ...filters,
      [filterType.toLowerCase()]: value,
    });
  };

  const clearAllFilters = () => {
    setFilters({
      sport: "",
      profession: "",
      city: "",
      country: "",
      gender: "",
      language: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchQuery !== "" || Object.values(filters).some((value) => value !== "")
    );
  };

  const handleViewProfile = (profile: Profile) => {
    localStorage.setItem("viewplayerusername", profile.username);

    if (localStorage.getItem("role") === "player") {
      navigate(`/player/playerinfo`);
    } else if (localStorage.getItem("role") === "expert") {
      navigate(`/expert/playerinfo`);
    } else if (localStorage.getItem("role") === "team") {
      navigate(`/team/playerinfo`);
    } else if (localStorage.getItem("role") === "sponsor") {
      navigate(`/sponsor/playerinfo`);
    } else {
      navigate("/fan/playerinfo");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  // Info for results display (for current page only, since backend does paging)
  const totalFilteredProfiles =
    profiles?.totalCount || displayedProfiles.length;
  const startIndex = (backendPage - 1) * limit;
  const endIndex = startIndex + displayedProfiles.length;

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
                placeholder={`Search ${
                  profileType === "player" ? "players" : "experts"
                } by name, skills, or any keyword...`}
                className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Responsive Filters Section */}
          <div className="w-full mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pt-1">
              {filterConfig.map((filter) => (
                <div key={filter.name} className="w-full">
                  <Select
                    onValueChange={(value) =>
                      handleFilterChange(value, filter.name)
                    }
                    value={
                      filters[
                        filter.name.toLowerCase() as keyof typeof filters
                      ] || ""
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

          {status === "loading" && (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}

          {status === "failed" && error && (
            <div className="text-center p-4 sm:p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              <p className="text-base sm:text-lg font-semibold">
                Failed to load profiles
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

          {status === "succeeded" &&
            displayedProfiles.length === 0 &&
            allProfiles.length > 0 && (
              <div className="text-center p-6 sm:p-10">
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                  No {profileType}s found matching your criteria.
                </p>
              </div>
            )}

          {status === "succeeded" && allProfiles.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No {profileType}s available.
              </p>
            </div>
          )}

          {status === "succeeded" && displayedProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedProfiles.map((profile: Profile, index: number) => {
                const displayName = `${profile.firstName || ""} ${
                  profile.lastName || ""
                }`.trim();

                // Calculate average rating from reviewsReceived
                const avgRating = calculateAverageRating(
                  profile.reviewsReceived
                );
                const totalReviews = getTotalReviewsCount(
                  profile.reviewsReceived
                );

                const profileImage = profile.photo || avatar;
                const isVerified = profile.verified || false;
                const playerSports = profile.sports
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
                        className="w-full h-50 sm:h-56 p-2 rounded-lg object-contain"
                        src={profileImage || avatar}
                        alt={displayName}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = avatar;
                        }}
                      />
                      {isVerified && (
                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="px-3 sm:px-4 pb-0">
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-1">
                        {displayName}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 line-clamp-1">
                        {profile.profession ||
                          (profileType === "player" ? "Player" : "Expert")}
                        {profile.city && profile.country
                          ? ` • ${profile.city}, ${profile.country}`
                          : ""}
                      </p>
                      {playerSports && (
                        <p className="text-blue-600 text-xs sm:text-sm font-medium dark:text-blue-300 my-1 line-clamp-1">
                          {playerSports.toUpperCase()}
                        </p>
                      )}
                      <p className="text-gray-600 text-xs sm:text-sm dark:text-gray-300 line-clamp-1">
                        {profile.subProfession
                          ? profile.subProfession.charAt(0).toUpperCase() +
                            profile.subProfession.slice(1)
                          : ""}
                      </p>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-3 -mt-4">
                      <div className="flex justify-between items-center">
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
                      </div>
                    </CardContent>
                    <CardFooter className="px-3 sm:px-4 pt-0">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs sm:text-sm py-2"
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

          {/* Pagination Section - always show if there is at least one page */}
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
                    Showing {Math.min(startIndex + 1, totalFilteredProfiles)} to{" "}
                    {Math.min(endIndex, totalFilteredProfiles)} of{" "}
                    {totalFilteredProfiles} {profileType}s
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
      </main>
    </div>
  );
};

export default PlayerProfiles;
