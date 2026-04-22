import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";
import avatar from "../../assets/images/avatar.png";

interface TeamPlayerData {
  username: string;
  photo?: string | null;
  firstName: string;
  lastName: string;
}

const playerInfoRoutes: Record<string, string> = {
  player: "/player/playerinfo",
  expert: "/expert/playerinfo",
  team: "/team/playerinfo",
  sponsor: "/sponsor/playerinfo",
};

const TeamPlayersView = () => {
  const navigate = useNavigate();
  const viewedProfile = useAppSelector((state) => state.profile.viewedProfile);
  const role = localStorage.getItem("role") || "";

  const players: TeamPlayerData[] =
    (viewedProfile?.teamPlayersData as unknown as TeamPlayerData[]) || [];

  const viewProfile = (username: string) => {
    localStorage.setItem("viewplayerusername", username);
    navigate(playerInfoRoutes[role] || "/fan/playerinfo");
  };

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          This team hasn't added any players yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {players.map((player) => (
        <div
          key={player.username}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col"
        >
          {/* Banner */}
          <div className="h-10 bg-red-600 flex-shrink-0" />

          {/* Content */}
          <div className="flex flex-col items-center px-3 pb-3">
            {/* Photo overlapping banner */}
            <div className="-mt-6 mb-2">
              <img
                src={player.photo || avatar}
                alt={player.username}
                className="w-15 h-15 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                onError={(e) => {
                  e.currentTarget.src = avatar;
                }}
              />
            </div>

            <div className="text-center w-full mb-2">
              <p className="text-sm font-semibold dark:text-white truncate">
                {player.firstName} {player.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{player.username}
              </p>
            </div>

            {role !== "player" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 gap-1 border-gray-300"
                onClick={() => viewProfile(player.username)}
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamPlayersView;
