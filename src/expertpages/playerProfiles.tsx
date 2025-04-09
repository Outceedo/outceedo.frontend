import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profile2 from "../assets/images/profile2.jpg";
import profile3 from "../assets/images/profile3.jpg";
import profile4 from "../assets/images/profile4.jpg";
import profile5 from "../assets/images/profile5.jpg";

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
import { Search } from "lucide-react";

interface Expert {
  name: string;
  rating: number;
  profilePic: string;
  reviews: number;
  verified: boolean;
}

const experts: Expert[] = [
  {
    name: "John Doe",
    rating: 3.5,
    profilePic: profile2,
    reviews: 100,
    verified: true,
  },
  {
    name: "Jane Smith",
    rating: 3.5,
    profilePic: profile3,
    reviews: 100,
    verified: false,
  },
  {
    name: "Mike Johnson",
    rating: 3.5,
    profilePic: profile4,
    reviews: 100,
    verified: true,
  },
  {
    name: "Kai Liddell",
    rating: 3.5,
    profilePic: profile5,
    reviews: 100,
    verified: false,
  },
  {
    name: "Jane Smith",
    rating: 3.5,
    profilePic: profile5,
    reviews: 100,
    verified: false,
  },
  {
    name: "Mike Johnson",
    rating: 3.5,
    profilePic: profile4,
    reviews: 100,
    verified: true,
  },
  {
    name: "Kai Liddell",
    rating: 3.5,
    profilePic: profile3,
    reviews: 100,
    verified: false,
  },
  {
    name: "Kai Liddell",
    rating: 3.5,
    profilePic: profile2,
    reviews: 100,
    verified: false,
  },
];

const Pagination: React.FC<{ totalPages: number }> = ({ totalPages }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
          onClick={() => setCurrentPage(index + 1)}
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

const PlayersProfile: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    city: "",
    country: "",
    gender: "",
    language: "",
  });
  const navigate = useNavigate();

  const handleFilterChange = (value: string, filterType: string) => {
    setFilters({
      ...filters,
      [filterType.toLowerCase()]: value,
    });
  };

  // Filter experts based on search query and filters
  const filteredExperts = experts.filter((expert) => {
    // If there's a search query, check if it matches the expert's name
    if (
      searchQuery &&
      !expert.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply other filters (simplified for example)
    return true;
  });

  return (
    <div className="flex">
      {/* Main Content */}
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen p-6 mt-4 rounded-xl ">
          {/* Search Box */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search players by name, skills, or any keyword..."
                className="pl-9 w-full bg-white dark:bg-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 justify-start mb-6">
            {[
              { name: "Profession", options: ["Profession 1", "Profession 2"] },
              { name: "City", options: ["City 1", "City 2"] },
              { name: "Country", options: ["Country 1", "Country 2"] },
              { name: "Gender", options: ["Male", "Female", "Other"] },
              { name: "Language", options: ["English", "Spanish", "French"] },
            ].map((filter) => (
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

          {/* Experts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-3">
            {filteredExperts.map((expert, index) => (
              <Card key={index} className="overflow-hidden dark:bg-gray-800 ">
                <div className="relative">
                  <img
                    className="w-full h-50 p-2 rounded-lg"
                    src={expert.profilePic}
                    alt={expert.name}
                  />
                  {expert.verified && (
                    <Badge className="absolute top-2 right-2 rounded-full bg-green-400 hover:bg-green-500">
                       ✔
                    </Badge>
                  )}
                </div>
                <CardHeader className="p-4 pb-0">
                  <h3 className="text-lg font-semibold">{expert.name}</h3>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="ml-1 text-gray-700 dark:text-gray-300">
                        {expert.rating}/5
                      </span>
                    </div>
                    <p className="text-red-600 text-xl font-bold">
                      {expert.reviews}+
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => navigate("/expert/playerinfo")}
                  >
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination totalPages={2} />
        </div>
      </main>
    </div>
  );
};

export default PlayersProfile;
