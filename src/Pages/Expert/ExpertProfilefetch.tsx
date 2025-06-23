import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { profiles, status, error } = useAppSelector((state) => state.profile);

  const expertsArray = profiles?.users || [];
  const totalPages = profiles?.totalPages || 1;
  const totalExperts = profiles?.total || 0;

  console.log(expertsArray);

  useEffect(() => {
    fetchProfiles();
  }, [currentPage, limit, dispatch]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProfiles();
    }
  }, [searchQuery, filters]);

  const fetchProfiles = () => {
    const params: any = {
      page: currentPage,
      limit,
      userType: "expert",
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params[key] = value;
      }
    });

    dispatch(getProfiles(params));
  };

  const handleFilterChange = (value: string, filterType: string) => {
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

  const displayedExperts = expertsArray;

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
      } else if (key === "sports" || key === "sport") {
        if (expert.sports && Array.isArray(expert.sports)) {
          expert.sports.forEach((sport) => {
            if (sport) options.add(sport);
          });
        } else if (expert.sport && typeof expert.sport === "string") {
          options.add(expert.sport);
        }
      } else {
        const value = expert[key];
        if (value && typeof value === "string") options.add(value);
      }
    });

    return Array.from(options);
  };

  const professionOptions = extractFilterOptions("profession");
  const cityOptions = extractFilterOptions("city");
  const countryOptions = extractFilterOptions("country");
  const genderOptions = extractFilterOptions("gender");
  const languageOptions = extractFilterOptions("language");

  const sportOptions = [
    ...extractFilterOptions("sports"),
    ...extractFilterOptions("sport"),
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
    sportOptions.length > 0 ? sportOptions : defaultSports;

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

  return (
    <div className="flex">
      {/* Main Content */}
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
          {status === "succeeded" && displayedExperts.length === 0 && (
            <div className="text-center p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No experts found matching your criteria.
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

                const rating =
                  expert.rating || Math.floor(Math.random() * 2) + 3.5;
                const reviews = expert.reviews || 0;

                const expertImage = expert.photo || avatar;

                const isVerified =
                  expert.verified !== undefined
                    ? expert.verified
                    : Math.random() > 0.5;

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
                        <p className="text-gray-600 text-xs sm:text-sm dark:text-gray-300 line-clamp-1">
                          {expert.subProfession}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            className="text-yellow-400 text-sm"
                            icon={faStar}
                          />
                          <span className="ml-1 text-gray-700 dark:text-white text-xs sm:text-sm">
                            {rating}/5
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 text-lg sm:text-xl font-bold">
                            {reviews}+
                          </p>
                          <p className="text-gray-700 text-xs dark:text-gray-300">
                            Assessments
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
