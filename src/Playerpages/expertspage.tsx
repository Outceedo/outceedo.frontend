import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profile2 from "../assets/images/profile2.jpg";
import profile3 from "../assets/images/profile3.jpg";
import profile4 from "../assets/images/profile4.jpg";
import profile5 from "../assets/images/profile5.jpg";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Expertspage: React.FC = () => {
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

  // Filter experts based on search query
  // const filteredExperts = experts.filter((expert) => {
  //   if (
  //     searchQuery &&
  //     !expert.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   ) {
  //     return false;
  //   }

  //   // Apply other filters (simplified for example)
  //   return true;
  // });

  // Handler for View Profile button
  // const handleViewProfile = (expert: Expert) => {
  //   // Store expert details in localStorage
  //   localStorage.setItem("selectedExpert", JSON.stringify(expert));
  //   // Navigate to expert details page
  //   navigate("/player/exdetails");
  // };

  return (
    <div className="flex">
      {/* Main Content */}
      <main className="flex-1 dark:bg-gray-900 dark:text-white">
        <div className="min-h-screen px-6 rounded-xl dark:bg-slate-800">
          {/* Search Box */}
          <div className="flex mr-5">
          <div className="relative mb-2 w-full bg-white dark:bg-slate-600 dark:text-white rounded-lg ">
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
                }>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {experts.map((expert, index) => (
              <Card
                key={index}
                className="w-80 shadow-md dark:bg-slate-600 dark:text-white"  >
                <CardHeader className="relative ">
                  <img
                    className="rounded-lg w-full h-50 object-cover -mb-7"
                    src={expert.profilePic}
                    alt={expert.name}  />
                  {expert.verified && (
                    <span className="absolute top-4 right-10 bg-green-400 text-white text-xs px-2 py-1 rounded-full">
                      ✔
                    </span>
                  )}
                </CardHeader>
                <CardContent className="text-center p-3">
                  <h3 className="text-lg font-semibold text-left">
                    {expert.name}
                  </h3>
                  <p className="text-gray-500 text-sm text-left dark:text-white">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-lg"><FontAwesomeIcon className="text-amber-300" icon={faStar}/></span>
                      <span className="ml-1 text-gray-700 dark:text-white">
                        {expert.rating}/5
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 text-xl font-bold flex justify-center item-center">
                        {expert.reviews}+
                      </p>
                      <p className="text-gray-700 text-sm dark:text-white">
                        Assessments Evaluated
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 bg-red-600 hover:bg-red-700 w-full text-lg cursor-pointer"
                    onClick={() => navigate("/player/exdetails")}  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination */}
          <div className="mt-8 mb-8 flex justify-end item-end">
            <Pagination totalPages={2} />
          </div>      
        </div>
      </main>
    </div>
  );
};

export default Expertspage;
