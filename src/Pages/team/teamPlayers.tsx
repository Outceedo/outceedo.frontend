import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";
import avatar from "../../assets/images/avatar.png";

interface TeamPlayerData {
  username: string;
  photo?: string | null;
  firstName: string;
  lastName: string;
}

interface Props {
  players: TeamPlayerData[];
}

const playerInfoRoutes: Record<string, string> = {
  player: "/player/playerinfo",
  expert: "/expert/playerinfo",
  team: "/team/playerinfo",
  sponsor: "/sponsor/playerinfo",
};

const TeamPlayersView: React.FC<Props> = ({ players }) => {
  const navigate = useNavigate();

  const viewProfile = (username: string) => {
    localStorage.setItem("viewplayerusername", username);
    const role = localStorage.getItem("role") || "";
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
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.username}
          className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <img
            src={player.photo || avatar}
            alt={player.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = avatar;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold dark:text-white truncate">
              {player.firstName} {player.lastName}
            </p>
            <p className="text-xs text-gray-500">@{player.username}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1 border-gray-300 flex-shrink-0"
            onClick={() => viewProfile(player.username)}
          >
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">View Profile</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TeamPlayersView;
