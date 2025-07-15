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

export default function FollowersList({
  followers,
  loading,
}: FollowersListProps) {
  const getDisplayName = (follower: Follower) => {
    const fullName = `${follower.firstName || ""} ${
      follower.lastName || ""
    }`.trim();
    return fullName || follower.username || "Anonymous User";
  };

  const getInitials = (follower: Follower) => {
    const name = getDisplayName(follower);
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border p-4 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No followers yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 max-h-96 overflow-y-auto">
      {followers.map((follower) => (
        <div
          key={follower.id}
          className="flex items-center gap-4 border p-4 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Avatar>
            <AvatarImage src={follower.photo || undefined} />
            <AvatarFallback>{getInitials(follower)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {getDisplayName(follower)}
            </p>
            {follower.username && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{follower.username}
              </p>
            )}
            {follower.role && (
              <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                {follower.role}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
