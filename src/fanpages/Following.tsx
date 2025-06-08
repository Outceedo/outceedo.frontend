import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import follower2 from "../assets/images/avatar.png";
import follower3 from "../assets/images/avatar.png";
type UserCardProps = {
  name: string;
  image: string;
  role: string;
  description?: string;
};

const UserCard: React.FC<UserCardProps> = ({
  name,
  image,
  role,
  description,
}) => {
  return (
    <Card className="w-full max-w-md dark:bg-gray-700">
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={image} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-gray-700 dark:text-white">{role}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1 dark:text-white">
                {description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-gray-700 font-semibold cursor-default dark:text-white"
        >
          Following
        </Button>
      </CardContent>
    </Card>
  );
};

const Followers: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Players" | "Experts">("All");

  const users: UserCardProps[] = [
    {
      name: "Laura W",
      image: follower2, // public folder image
      role: "Football Player | Under 18 | Goal Keeper",
      description: "Khalsa Warriors Football Club",
    },
    {
      name: "Michael",
      image: follower3, // public folder image
      role: "Expert in Football | coach and Ex-Soccer Player",
    },
  ];

  const getFilteredUsers = () => {
    if (filter === "All") return [...users, ...users, ...users, ...users];
    if (filter === "Players") return users.filter((u) => u.name === "Laura W");
    if (filter === "Experts") return users.filter((u) => u.name === "Michael");
    return users;
  };

  return (
    <div className=" p-6">
      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 text-sm">
        {["All", "Players", "Experts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as "All" | "Players" | "Experts")}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg dark:text-white  ${
              filter === tab
                ? "bg-yellow-200 text-black font-medium dark:bg-amber-300"
                : "bg-transparent text-gray-600"
            }`}
          >
            {tab === "Players" && <User className="w-4 h-4" />}
            {tab === "Experts" && <Users className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {getFilteredUsers().map((user, idx) => (
          <UserCard key={idx} {...user} />
        ))}
      </div>
    </div>
  );
};

export default Followers;
