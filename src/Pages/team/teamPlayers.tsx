import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { teamPlayerService } from "@/store/apiConfig";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";
import avatar from "../../assets/images/avatar.png";
import outceedoLogo from "../../assets/images/logosmall.png";

interface TeamPlayerData {
  username: string;
  photo?: string | null;
  firstName: string;
  lastName: string;
  position?: string | null;
  foot?: "right_foot" | "left_foot" | "both_foot" | string | null;
  age?: number | null;
}

// Manually-added roster player (no Outceedo account), from the `other` service
interface ManualPlayer {
  id: string;
  teamUsername: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  photo?: string | null;
  position?: string | null;
  foot?: "right_foot" | "left_foot" | "both_foot" | null;
}

const playerInfoRoutes: Record<string, string> = {
  player: "/player/playerinfo",
  expert: "/expert/playerinfo",
  team: "/team/playerinfo",
  sponsor: "/sponsor/playerinfo",
};

const formatFoot = (foot?: string | null) =>
  foot
    ? foot
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

// Elegant red pill tags for position / age / foot
const PlayerTags = ({
  position,
  age,
  foot,
}: {
  position?: string | null;
  age?: number | null;
  foot?: string | null;
}) => {
  const tags: string[] = [];
  if (position) tags.push(position);
  if (age) tags.push(`Age ${age}`);
  if (foot) tags.push(formatFoot(foot));
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="text-[10px] font-medium text-white bg-red-500 px-2 py-0.5 rounded-full"
        >
          {t}
        </span>
      ))}
    </div>
  );
};

const TeamPlayersView = () => {
  const navigate = useNavigate();
  const viewedProfile = useAppSelector((state) => state.profile.viewedProfile);
  const role = localStorage.getItem("role") || "";
  const teamUsername = viewedProfile?.username || "";

  const players: TeamPlayerData[] =
    (viewedProfile?.teamPlayersData as unknown as TeamPlayerData[]) || [];

  const [manualPlayers, setManualPlayers] = useState<ManualPlayer[]>([]);

  // Fetch this team's manually-added players (read-only)
  useEffect(() => {
    if (!teamUsername) return;
    let active = true;
    (async () => {
      try {
        const { data } = await teamPlayerService.get("/", {
          params: { teamUsername },
        });
        if (active) setManualPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch manual players", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [teamUsername]);

  const viewProfile = (username: string) => {
    localStorage.setItem("viewplayerusername", username);
    navigate(playerInfoRoutes[role] || "/fan/playerinfo");
  };

  const totalPlayers = players.length + manualPlayers.length;

  if (totalPlayers === 0) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Outceedo account players */}
      {players.map((player) => (
        <div
          key={player.username}
          className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col"
        >
          <img
            src={outceedoLogo}
            alt="On Outceedo"
            title="This player is on Outceedo"
            className="absolute top-2 right-2 w-6 h-6 object-contain z-10"
          />
          {/* Banner */}
          <div className="h-14 bg-red-600 flex-shrink-0" />

          {/* Content */}
          <div className="flex flex-col items-center px-4 pb-4">
            {/* Photo overlapping banner */}
            <div className="-mt-10 mb-2">
              <img
                src={player.photo || avatar}
                alt={player.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                onError={(e) => {
                  e.currentTarget.src = avatar;
                }}
              />
            </div>

            <div className="text-center w-full mb-2">
              <p className="text-base font-semibold dark:text-white truncate">
                {player.firstName} {player.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{player.username}
              </p>
              <PlayerTags
                position={player.position}
                age={player.age}
                foot={player.foot}
              />
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

      {/* Manually-added players (read-only, rendered after Outceedo players) */}
      {manualPlayers.map((player) => (
        <div
          key={player.id}
          className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col"
        >
          <span className="absolute top-1.5 left-1.5 z-10 text-[10px] font-medium text-white/90 bg-black/30 px-1.5 py-0.5 rounded-full">
            Manual
          </span>
          {/* Banner */}
          <div className="h-14 bg-red-600 flex-shrink-0" />

          {/* Content */}
          <div className="flex flex-col items-center px-4 pb-4">
            {/* Photo overlapping banner */}
            <div className="-mt-10 mb-2">
              <img
                src={player.photo || avatar}
                alt={player.firstName}
                className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                onError={(e) => {
                  e.currentTarget.src = avatar;
                }}
              />
            </div>

            <div className="text-center w-full">
              <p className="text-base font-semibold dark:text-white truncate">
                {player.firstName} {player.lastName}
              </p>
              <PlayerTags
                position={player.position}
                age={player.age}
                foot={player.foot}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamPlayersView;
