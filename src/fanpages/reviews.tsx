import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import follower from "../assets/images/avatar.png";
type ActivityCardProps = {
  userName: string;
  userImage: string;
  activityText: string;
  activityTime: string;
  commentUser: string;
  commentText: string;
  commentTime: string;
  mediaImage: string;
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  userName,
  userImage,
  activityText,
  activityTime,
  commentUser,
  commentText,
  commentTime,
  mediaImage,
}) => {
  return (
    <Card className="w-full dark:bg-gray-700">
      <CardContent className="p-4 space-y-3 ">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={follower} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-gray-700 dark:text-white">
                {activityText}
              </p>
              <p className="text-xs text-gray-500 mt-1 dark:text-white">
                {activityTime}
              </p>
            </div>
          </div>
          <img
            src={follower}
            alt="media"
            className="w-20 h-20 rounded-md object-cover"
          />
        </div>

        <div className="flex gap-3 pt-2 border-t ml-16">
          <Avatar>
            <AvatarImage src={follower} />
            <AvatarFallback>{commentUser.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{commentUser}</p>
            <p className="text-sm text-gray-700 dark:text-white">
              {commentText}
            </p>
            <p className="text-xs text-gray-500 mt-1 dark:text-white">
              {commentTime}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Reviews: React.FC = () => {
  const cards = Array(4).fill({
    userName: "Laura W",
    userImage: "",
    activityText: "From practice to pitch_my first tournament start!",
    activityTime: "13w",
    commentUser: "Rohan Rohan",
    commentText: "Proud of you! This is just the beginning!",
    commentTime: "5w",
    mediaImage: "",
  });

  return (
    <div className=" ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <ActivityCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Reviews;
