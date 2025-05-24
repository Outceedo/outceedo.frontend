import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfiles } from "../store/profile-slice";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle } from "lucide-react";
import avatar from "../assets/images/avatar.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import fallback profile images

// Default image mapping for fallbacks

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
  photo?: string;
  verified?: boolean;
  role?: string;
  [key: string]: any; // For other potential properties
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
    <div className="flex justify-center space-x-2">
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

const Expertspage: React.FC = () => {
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    city: "",
    country: "",
    gender: "",
    language: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8); // Number of experts per page

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profiles from Redux store
  const { profiles, status, error } = useAppSelector((state) => state.profile);

  // Extract experts array from the profiles response
  const expertsArray = profiles?.users || [];
  console.log(expertsArray);

  // Determine total pages from response
  const totalPages = profiles?.totalPages || 1;

  // Fetch profiles on component mount and when filters/pagination change
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, limit, dispatch]);

  // Function to fetch expert profiles
  const fetchProfiles = () => {
    dispatch(
      getProfiles({
        page: currentPage,
        limit,
        userType: "expert", // Specifically fetch expert profiles
      })
    );
  };

  // Handle filter changes
  const handleFilterChange = (value: string, filterType: string) => {
    setFilters({
      ...filters,
      [filterType.toLowerCase()]: value,
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Apply client-side filtering for search
  const filteredExperts = expertsArray.filter((expert: Expert) => {
    // Search query filtering
    const fullName = `${expert.firstName || ""} ${
      expert.lastName || ""
    }`.toLowerCase();
    const bio = expert.bio?.toLowerCase() || "";
    const username = expert.username?.toLowerCase() || "";

    if (
      searchQuery &&
      !fullName.includes(searchQuery.toLowerCase()) &&
      !bio.includes(searchQuery.toLowerCase()) &&
      !username.includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply other filters if they're set
    if (
      filters.profession &&
      expert.profession &&
      expert.profession.toLowerCase() !== filters.profession.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.city &&
      expert.city &&
      expert.city.toLowerCase() !== filters.city.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.country &&
      expert.country &&
      expert.country.toLowerCase() !== filters.country.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.gender &&
      expert.gender &&
      expert.gender.toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }

    if (filters.language && expert.language) {
      const languages = Array.isArray(expert.language)
        ? expert.language
        : [expert.language];
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
  const extractFilterOptions = (key: keyof Expert): string[] => {
    const options = new Set<string>();

    expertsArray.forEach((expert: Expert) => {
      if (key === "language" && expert.language) {
        const langs = Array.isArray(expert.language)
          ? expert.language
          : [expert.language];
        langs.forEach((lang) => {
          if (lang) options.add(lang);
        });
      } else {
        const value = expert[key];
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
  const role = localStorage.getItem("role");

  // Handle view expert profile
  const handleViewProfile = (expert: Expert) => {
    localStorage.setItem("viewexpertusername", expert.username);
    if (role === "player") {
      navigate("/player/exdetails");
    } else if (role === "sponsor") {
      navigate("/sponsor/exdetails");
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-6 py-4 rounded-xl dark:bg-slate-800">
          {/* Search Box */}
          <div className="mb-6">
            <div className="relative w-full bg-white dark:bg-slate-600 dark:text-white rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search experts by name"
                className="pl-9 w-full bg-white dark:bg-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 justify-start mb-8">
            {filterConfig.map((filter) => (
              <Select
                key={filter.name}
                onValueChange={(value) =>
                  handleFilterChange(value, filter.name)
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
              <p className="text-lg font-semibold">
                Failed to load expert profiles
              </p>
              <p>{error}</p>
              <Button
                className="mt-4 bg-red-600 hover:bg-red-700"
                onClick={fetchProfiles}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* No Experts State */}
          {status === "succeeded" && filteredExperts.length === 0 && (
            <div className="text-center p-10">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No experts found matching your criteria.
              </p>
            </div>
          )}

          {/* Experts Grid */}
          {status === "succeeded" && filteredExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperts.map((expert: Expert, index: number) => {
                // Create display name from available fields
                const displayName =
                  `${expert.firstName || ""} ${expert.lastName || ""}`.trim() ||
                  expert.username ||
                  "Expert User";

                // Calculate random rating and reviews count if not available
                const rating =
                  expert.rating || Math.floor(Math.random() * 2) + 3.5;
                const reviews =
                  expert.reviews || Math.floor(Math.random() * 150) + 50;

                // Use photo from profile or fallback to default images
                const expertImage = expert.photo || avatar;

                // Use verified status if available, or generate randomly
                const isVerified =
                  expert.verified !== undefined
                    ? expert.verified
                    : Math.random() > 0.5;

                return (
                  <Card
                    key={expert.id}
                    className="overflow-hidden shadow-md dark:bg-slate-600 dark:text-white"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-60">
                      <img
                        className="w-full h-full object-cover"
                        src={expertImage}
                        alt={displayName}
                        onError={(e) => {
                          // If image fails to load, use default image
                          const target = e.target as HTMLImageElement;
                          target.src =
                            defaultImages[index % defaultImages.length];
                        }}
                      />
                      {isVerified && (
                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 w-8 h-8 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{displayName}</h3>
                      <p className="text-gray-500 text-sm mb-3 dark:text-gray-300">
                        {expert.profession || "Expert Coach"}
                        {expert.city && expert.country
                          ? ` • ${expert.city}, ${expert.country}`
                          : ""}
                      </p>
                      {expert.subProfession}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            className="text-yellow-400"
                            icon={faStar}
                          />
                          <span className="ml-1 text-gray-700 dark:text-white">
                            {rating}/5
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 text-xl font-bold">
                            {reviews}+
                          </p>
                          <p className="text-gray-700 text-xs dark:text-gray-300">
                            Assessments Evaluated
                          </p>
                        </div>
                      </div>

                      <Button
                        className="mt-4 bg-red-600 hover:bg-red-700 w-full"
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
          {status === "succeeded" && (
            <div className="mt-8 mb-8 flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Expertspage;
