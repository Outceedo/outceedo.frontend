import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfiles } from "../store/profile-slice";
import avatar from "../assets/images/avatar.png";
// Default images for fallback
import player from "../assets/images/player.jpg";
import player1 from "../assets/images/player1.jpg";
import player2 from "../assets/images/player2.jpg";
import player3 from "../assets/images/player3.jpg";
import player4 from "../assets/images/player4.jpg";
import player5 from "../assets/images/player5.jpg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

// Default image mapping
const defaultImages = [player, player1, player2, player3, player4, player5];

type Role = "player" | "expert" | "admin";

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
  services?: any[];
  documents?: DocumentItem[];
  uploads?: UploadItem[];
  socialLinks?: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
  // ...any additional fields
  [key: string]: any;
}

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

  return (
    <div className="flex justify-center mt-6 space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        ❮
      </Button>

      {[...Array(totalPages)].map((_, index) => (
        <span
          key={index}
          className={`px-3 py-1 rounded-md cursor-pointer ${
            currentPage === index + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-slate-600 dark:text-white"
          }`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </span>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        ❯
      </Button>
    </div>
  );
};

const TeamPlayerProfiles: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    city: "",
    country: "",
    gender: "",
    language: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8); // Number of profiles per page

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profiles from Redux store
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  // Extract users array from the profiles response
  const usersArray = profiles?.users || [];
  console.log(usersArray);

  // Determine total pages from response
  const totalPages = profiles?.totalPages || 1;

  // Determine user type to fetch opposite profiles (if expert, fetch players and vice versa)
  const userRole = localStorage.getItem("role") as Role;
  const profileType: Role = userRole === "expert" ? "player" : "expert";

  // Fetch profiles on mount and when filters/pagination change
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, limit, dispatch, profileType]);

  // Function to fetch profiles
  const fetchProfiles = () => {
    dispatch(
      getProfiles({
        page: currentPage,
        limit,
        userType: profileType,
      })
    );
  };

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters({
      ...filters,
      [filterType.toLowerCase()]: value,
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
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

  // Apply client-side filtering for search
  const filteredProfiles = usersArray.filter((profile: Profile) => {
    // Search query filtering
    const fullName = `${profile.firstName || ""} ${
      profile.lastName || ""
    }`.toLowerCase();
    const bio = profile.bio?.toLowerCase() || "";

    if (
      searchQuery &&
      !fullName.includes(searchQuery.toLowerCase()) &&
      !bio.includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply other filters if they're set
    if (
      filters.profession &&
      profile.profession &&
      profile.profession.toLowerCase() !== filters.profession.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.city &&
      profile.city &&
      profile.city.toLowerCase() !== filters.city.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.country &&
      profile.country &&
      profile.country.toLowerCase() !== filters.country.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.gender &&
      profile.gender &&
      profile.gender.toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }

    if (filters.language && profile.language) {
      const languages = Array.isArray(profile.language)
        ? profile.language
        : [profile.language];
      if (
        !languages.some(
          (lang) => lang.toLowerCase() === filters.language.toLowerCase()
        )
      ) {
        return false;
      }
    }

    return true;
  });

  // Extract unique filter values from profiles
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
      } else {
        const value = profile[key];
        if (value && typeof value === "string") options.add(value);
      }
    });

    return Array.from(options);
  };

  // Get profile filter options
  const professionOptions = extractFilterOptions("profession");
  const cityOptions = extractFilterOptions("city");
  const countryOptions = extractFilterOptions("country");
  const genderOptions = extractFilterOptions("gender");
  const languageOptions = extractFilterOptions("language");

  // Generate filter objects
  const filterConfig = [
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

  return (
    <div className="flex bg">
      {/* Main Content */}
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen p-6 mt-4 rounded-xl ">
          {/* Search Box */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder={`Search ${
                  profileType === "player" ? "players" : "experts"
                } by name, skills, or any keyword...`}
                className="pl-9 w-full bg-white dark:bg-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 justify-start items-center mb-6">
            {filterConfig.map((filter) => (
              <Select
                key={filter.name}
                onValueChange={(value) =>
                  handleFilterChange(value, filter.name)
                }
                value={
                  filters[filter.name.toLowerCase() as keyof typeof filters] ||
                  ""
                }
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-600">
                  <SelectValue placeholder={filter.name} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-600"
              >
                <X size={16} /> Clear Filters
              </Button>
            )}
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Error State */}
          {status === "failed" && error && (
            <div className="text-center p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              <p className="text-lg font-semibold">Failed to load profiles</p>
              <p>{error}</p>
              <Button
                className="mt-4 bg-red-600 hover:bg-red-700"
                onClick={fetchProfiles}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* No Profiles State */}
          {status === "succeeded" && filteredProfiles.length === 0 && (
            <div className="text-center p-10">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No {profileType}s found matching your criteria.
              </p>
            </div>
          )}

          {/* Profiles Grid */}
          {status === "succeeded" && filteredProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProfiles.map((profile: Profile, index: number) => {
                // Create a display name from available fields
                const displayName =
                  `${profile.firstName || ""} ${
                    profile.lastName || ""
                  }`.trim() ||
                  profile.username ||
                  "Anonymous User";

                // Calculate rating and reviews count (or use defaults)
                const rating = Math.floor(Math.random() * 2) + 3.5; // Random rating between 3.5-5.5
                const reviews = Math.floor(Math.random() * 150) + 50; // Random reviews between 50-200

                // Use photo from profile or fallback to default images in rotation
                const profileImage =
                  profile.photo || defaultImages[index % defaultImages.length];

                // Random verified status if not specified
                const isVerified = Math.random() > 0.5;

                return (
                  <Card
                    key={profile.id}
                    className="overflow-hidden dark:bg-gray-800"
                  >
                    <div className="relative">
                      <img
                        className="w-full h-50 p-2 rounded-lg object-cover"
                        src={profileImage || avatar}
                        alt={displayName}
                        onError={(e) => {
                          // If image fails to load, use default image
                          const target = e.target as HTMLImageElement;
                          target.src =
                            defaultImages[index % defaultImages.length];
                        }}
                      />
                      {isVerified && (
                        <Badge className="absolute top-2 right-4 rounded-full bg-green-400 hover:bg-green-500">
                          ✔
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <h3 className="text-lg font-semibold">{displayName}</h3>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        {profile.profession ||
                          (profileType === "player" ? "Player" : "Expert")}
                        {profile.city && profile.country
                          ? ` • ${profile.city}, ${profile.country}`
                          : ""}
                      </p>
                    </CardHeader>
                    <CardContent className="px-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-yellow-300 text-lg">
                            <FontAwesomeIcon icon={faStar} />
                          </span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">
                            {rating}/5
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 text-xl font-bold flex justify-center item-center">
                            {reviews}+
                          </p>
                          <p className="text-gray-700 text-sm dark:text-white">
                            {profileType === "player"
                              ? "Assessments"
                              : "Assessments Evaluated"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
          {status === "succeeded" && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamPlayerProfiles;
