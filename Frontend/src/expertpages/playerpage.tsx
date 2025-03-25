import React, { useState} from "react";
import ExpertNavbar from "./expertNavbar";
import { useNavigate } from "react-router-dom";
import player from "../assets/images/player.jpg"
import player1 from "../assets/images/player1.jpg"
import player2 from "../assets/images/player2.jpg"
import profile from "../assets/images/profile.jpg"
import profile1 from "../assets/images/profile1.jpg"
import player3 from "../assets/images/player3.jpg"
import player4 from "../assets/images/player4.jpg"
import player5 from "../assets/images/player5.jpg"
import ExpertHeader from "./expertheader";
interface Player {
  name: string;
  rating: number;
  profilePic: string;
  reviews: number;
  verified: boolean;
}

const PlayerPage: Player[] = [
  { name: "John Doe", rating: 3.5, profilePic: player, reviews: 100, verified: true },
  { name: "Jane Smith", rating: 3.5, profilePic: player1, reviews: 100, verified: false },
  { name: "Mike Johnson", rating: 3.5, profilePic:player2 , reviews: 100, verified: true },
  { name: "Kai Liddell", rating: 3.5, profilePic:profile , reviews: 100, verified: false },
  { name: "John Doe", rating: 3.5, profilePic: profile1, reviews: 100, verified: true },
  { name: "Jane Smith", rating: 3.5, profilePic: player3, reviews: 100, verified: false },
  { name: "Mike Johnson", rating: 3.5, profilePic:player4 , reviews: 100, verified: true },
  { name: "Kai Liddell", rating: 3.5, profilePic:player5, reviews: 100, verified: false },
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
            currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-slate-600 dark:text-white"
          }`}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </span>
      ))}

      <button
        className="px-3 py-1 border rounded-md bg-white shadow disabled:opacity-50 dark:bg-slate-600 dark:text-white"
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
  {/* Fixed Sidebar */}
    <ExpertNavbar />
 
  {/* Main Content */}
  <main className="ml-[250px] flex-1 p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
    <ExpertHeader />

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
            {PlayerPage.map((player: Player, index: number) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 w-80 dark:bg-slate-600 dark:text-white">
                <div className="relative">
                  <img className="rounded-lg w-full h-40" src={player.profilePic} alt={player.name} />
                  {player.verified && (
                    <span className="absolute top-2 right-2 bg-green-400 text-white text-xs px-2 py-1 rounded-full">✔</span>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-left">{player.name}</h3>
                  <p className="text-gray-500 text-sm text-left dark:text-white">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                  <div className="flex mt-4">
                    <span className="text-yellow-500 text-lg text-left">⭐</span>
                    <span className="ml-1 text-gray-700 text-left dark:text-white">{player.rating}/5</span>
                    <p className="ml-28 text-red-600 text-xl font-bold text-right">{player.reviews}+</p>
                  </div>
                  <button
                    className="mt-4 bg-red-600 text-white px-4 py-2 w-full rounded-xl text-lg"
                    onClick={() => navigate("/player")}
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
