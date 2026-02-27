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
  return (
    <div className="relative min-h-[300px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg" />
      <div className="relative z-10 text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          Reviews feature is currently under development. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default Reviews;
