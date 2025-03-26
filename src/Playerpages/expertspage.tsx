import React, { useState} from "react";
import SideNavbar from "./sideNavbar";
import { useNavigate } from "react-router-dom";
import profile2 from "../assets/images/profile2.jpg"
import profile3 from "../assets/images/profile3.jpg"
import profile4 from "../assets/images/profile4.jpg"
import profile5 from "../assets/images/profile5.jpg"
import PlayerHeader from "./playerheader";

interface Expert {
  name: string;
  rating: number;
  profilePic: string;
  reviews: number;
  verified: boolean;
}

const experts: Expert[] = [
  { name: "John Doe", rating: 3.5, profilePic:profile2, reviews: 100, verified: true },
  { name: "Jane Smith", rating: 3.5, profilePic: profile3, reviews: 100, verified: false },
  { name: "Mike Johnson", rating: 3.5, profilePic: profile4, reviews: 100, verified: true },
  { name: "Kai Liddell", rating: 3.5, profilePic: profile5, reviews: 100, verified: false },
  { name: "Jane Smith", rating: 3.5, profilePic: profile5, reviews: 100, verified: false },
  { name: "Mike Johnson", rating: 3.5, profilePic: profile4, reviews: 100, verified: true },
  { name: "Kai Liddell", rating: 3.5, profilePic: profile3, reviews: 100, verified: false },
  { name: "Kai Liddell", rating: 3.5, profilePic: profile2, reviews: 100, verified: false },
  
  
  

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
      <button
        className="px-3 py-1 border rounded-md bg-white shadow disabled:opacity-50 dark:bg-slate-600 dark:text-white"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        ❮
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <span
          key={index}
          className={`px-3 py-1 rounded-md cursor-pointer ${
            currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200  dark:bg-slate-600 dark:text-white "
          }`}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </span>
      ))}

      <button
        className="px-3 py-1 border rounded-md bg-white shadow disabled:opacity-50  dark:bg-slate-600 dark:text-white"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        ❯
      </button>
    </div>
  );
};

const Expertspage: React.FC = () => {
  const [filters, setFilters] = useState({ profession: "", city: "", country: "", gender: "", language: "" });
  const navigate = useNavigate();
  return (
    <div className="flex">
      <SideNavbar />

      {/* Main Content */}
      <main className="flex-1 p-6 dark:bg-gray-900 dark:text-white">
       <PlayerHeader />

        <div className="min-h-screen bg-gray-100 p-6 mt-4 rounded-xl dark:bg-slate-800">
          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 justify-start mb-6">
            {["Profession", "City", "Country", "Gender", "Language"].map((filter) => (
              <select
                key={filter}
                className="px-4 py-2 border rounded-md text-gray-700 bg-white shadow-sm dark:bg-slate-600 dark:text-white"
                onChange={(e) => setFilters({ ...filters, [filter.toLowerCase()]: e.target.value })}
              >
                <option value="">{filter}</option>
                <option value="Option 1">{filter} 1</option>
                <option value="Option 2">{filter} 2</option>
              </select>
            ))}
          </div>

          {/* Experts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {experts.map((expert, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 w-80 dark:bg-slate-600 dark:text-white">
                <div className="relative">
                  <img className="rounded-lg w-full h-40" src={expert.profilePic} alt={expert.name} />
                  {expert.verified && (
                    <span className="absolute top-2 right-2 bg-green-400 text-white text-xs px-2 py-1 rounded-full">✔</span>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-left">{expert.name}</h3>
                  <p className="text-gray-500 text-sm text-left dark:text-white">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                  <div className="flex mt-4">
                    <span className="text-yellow-500 text-lg text-left">⭐</span>
                    <span className="ml-1 text-gray-700 text-left dark:text-white">{expert.rating}/5</span>
                    <p className="ml-28 text-red-600 text-xl font-bold text-right">{expert.reviews}+</p>
                  </div>
                  <button
                    className="mt-4 bg-red-600 text-white px-4 py-2 w-full rounded-xl text-lg"
                    onClick={() => navigate("/experts")}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination totalPages={2} />
        </div>
      </main>
    </div>
  );
};

export default Expertspage;
