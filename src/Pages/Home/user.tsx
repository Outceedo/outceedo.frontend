import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFutbol,
  faChalkboardTeacher,
  faUsers,
  faTrophy,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";

const User: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { name: "Players", icon: faFutbol, role: "player" },
    { name: "Experts", icon: faChalkboardTeacher, role: "expert" },
    { name: "Teams", icon: faUsers, role: "team" },
    { name: "Sponsors", icon: faHandshake, role: "sponsor" },
    { name: "Fans/Followers", icon: faTrophy, role: "user" },
  ];

  const handleUserSelection = (role: string) => {
    const lowerCaseRole = role.toLowerCase();
    localStorage.setItem("selectedRole", lowerCaseRole);
    navigate("/signup");
  };

  return (
    <Card className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full h-full">
      <div className="text-center">
  <h2 className="text-3xl font-semibold font-Raleway text-black text-center mb-2">
    Sign Up to <span className="text-red-500">Outceedo</span>
  </h2>
  <span className="text-center font-semibold">
    <span className="align-middle text-2xl mr-1">(</span>
    <span className="align-middle text-base">Select Your Profile</span>
    <span className="align-middle text-2xl ml-1">)</span>
  </span>
</div>
      <div className="grid grid-cols-2  md:grid-cols-5 gap-4">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center p-4 md:p-4 bg-[#FFF8DA] rounded-lg shadow-md group transform transition-all duration-300 hover:scale-95 hover:shadow-xl mb-6 "
            onClick={() => handleUserSelection(option.role)}
          >
            <div className="text-4xl">
              <FontAwesomeIcon icon={option.icon} className="text-black" />
            </div>
            <h3 className="mt-2 font-semibold text-black font-Opensans">
              {option.name}
            </h3>

            <button className="mt-3 px-4 py-2 bg-[#FE221E] text-white rounded-lg text-sm font-Raleway hover:bg-red-500 hidden md:block">
              {option.name}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default User;
