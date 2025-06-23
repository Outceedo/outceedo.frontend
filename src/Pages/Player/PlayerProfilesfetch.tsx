import React, { useState, useEffect } from "react";
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
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  [key: string]: any;
}

// Enhanced Pagination Component
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

    // Always show first page
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

    return [...new Set(rangeWithDots)]; // Remove duplicates
  };

  if (totalPages <= 1) return null;

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

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profiles from Redux store
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  // Extract users array and pagination info from the profiles response
  const usersArray = profiles?.users || [];
  const totalPages = profiles?.totalPages || 1;
  const totalProfiles = profiles?.total || 0;

  console.log(usersArray);

  // Determine user type to fetch opposite profiles
  const userRole = localStorage.getItem("role") as Role;
  const profileType: Role =
    userRole === "expert"
      ? "player"
      : userRole === "sponsor"
      ? "player"
      : "player";

  // Fetch profiles when page, limit changes
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, limit, dispatch, profileType]);

  // Separate effect for filter and search changes to reset pagination
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProfiles();
    }
  }, [searchQuery, filters]);

  // Function to fetch profiles
  const fetchProfiles = () => {
    const params: any = {
      page: currentPage,
      limit,
      userType: profileType,
    };

    // Add search term if provided
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // Add filters if they have values
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params[key] = value;
      }
    });

    dispatch(getProfiles(params));
  };

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters({
      ...filters,
      [filterType.toLowerCase()]: value,
    });
  };

  // Clear all filters
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

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchQuery !== "" || Object.values(filters).some((value) => value !== "")
    );
  };

  // Since we're doing server-side pagination, we use the current page data
  const displayedProfiles = usersArray;

  // Extract unique filter values from current page profiles
  const extractFilterOptions = (key: keyof Profile): string[] => {
    const options = new Set<string>();

    usersArray.forEach((profile: Profile) => {
      if (key === "language" && profile.language) {
        const langs = Array.isArray(profile.language)
          ? profile.language
          : [profile.language];
        langs.forEach((lang) => {
          if (lang) options.add(lang);
        });
      } else if (key === "sports" || key === "sport") {
        // Handle sports (both array and single string formats)
        if (profile.sports && Array.isArray(profile.sports)) {
          profile.sports.forEach((sport) => {
            if (sport) options.add(sport);
          });
        } else if (profile.sport && typeof profile.sport === "string") {
          options.add(profile.sport);
        }
      } else {
        const value = profile[key];
        if (value && typeof value === "string") options.add(value);
      }
    });

    return Array.from(options);
  };

  // Get profile filter options
  const sportOptions = [
    ...extractFilterOptions("sports"),
    ...extractFilterOptions("sport"),
  ];
  const professionOptions = extractFilterOptions("profession");
  const cityOptions = extractFilterOptions("city");
  const countryOptions = extractFilterOptions("country");
  const genderOptions = extractFilterOptions("gender");
  const languageOptions = extractFilterOptions("language");

  // Default sports if none found in data
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
    sportOptions.length > 0 ? sportOptions : defaultSports;

  // Generate filter configuration
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

  // Handle profile view
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
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="flex bg">
      {/* Main Content */}
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

              {/* Clear Filters Button */}
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

          {/* No Profiles State */}
          {status === "succeeded" && displayedProfiles.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No {profileType}s found matching your criteria.
              </p>
            </div>
          )}

          {/* Profiles Grid */}
          {status === "succeeded" && displayedProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedProfiles.map((profile: Profile, index: number) => {
                // Create a display name from available fields
                const displayName = `${profile.firstName || ""} ${
                  profile.lastName || ""
                }`.trim();

                // Calculate rating and reviews count (or use defaults)
                const rating = profile.rating || 0;
                const reviews = profile.reviews || 0;

                // Use photo from profile or fallback to default images
                const profileImage = profile.photo || avatar;

                // Random verified status if not specified
                const isVerified = Math.random() > 0.5;

                // Get player sports
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

                      {/* Display sports */}
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
                        <div className="flex items-center">
                          <span className="text-yellow-300 text-sm sm:text-lg">
                            <FontAwesomeIcon icon={faStar} />
                          </span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                            {rating}/5
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 text-lg sm:text-xl font-bold flex justify-center item-center">
                            {reviews}+
                          </p>
                          <p className="text-gray-700 text-xs sm:text-sm dark:text-white">
                            {profileType === "player"
                              ? "Assessments"
                              : "Assessments Evaluated"}
                          </p>
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

export default PlayerProfiles;
