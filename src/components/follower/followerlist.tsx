import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Follower {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: string;
  [key: string]: any;
}

interface FollowersListProps {
  followers: Follower[];
  loading?: boolean;
}

export default function FollowersList() {
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
          Followers feature is currently under development. Stay tuned for
          updates!
        </p>
      </div>
    </div>
  );
}
