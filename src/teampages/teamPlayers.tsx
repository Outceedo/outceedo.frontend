import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/store/apiConfig";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Info,
  UserPlus,
  UserMinus,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import avatar from "../assets/images/avatar.png";

interface Player {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photo?: string;
  sport?: string;
  city?: string;
  country?: string;
  bio?: string;
  skills?: string[];
  age?: number;
  height?: number;
  weight?: number;
}

interface TeamPlayerData {
  username: string;
  photo: string | null;
  firstName: string;
  lastName: string;
}

const TeamPlayers = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentProfile = useAppSelector((state) => state.profile.currentProfile);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null);
  const [removingPlayer, setRemovingPlayer] = useState<string | null>(null);
  const [error, setError] = useState("");

  const teamPlayersData: TeamPlayerData[] =
    (currentProfile?.teamPlayersData as unknown as TeamPlayerData[]) || [];

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await userService.get("/players/search", {
          params: { q: searchQuery.trim(), limit: 12 },
        });
        setSearchResults(data.users || []);
      } catch (err: any) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addPlayer = async (username: string) => {
    setAddingPlayer(username);
    setError("");
    try {
      await userService.post("/players/add", { usernames: [username] });
      setSearchResults((prev) => prev.filter((p) => p.username !== username));
      if (currentProfile?.username) {
        dispatch(getProfile(currentProfile.username));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add player");
    } finally {
      setAddingPlayer(null);
    }
  };

  const removePlayer = async (username: string) => {
    setRemovingPlayer(username);
    setError("");
    try {
      await userService.delete("/players/remove", {
        data: { usernames: [username] },
      });
      if (currentProfile?.username) {
        dispatch(getProfile(currentProfile.username));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove player");
    } finally {
      setRemovingPlayer(null);
    }
  };

  const viewProfile = (username: string) => {
    localStorage.setItem("viewplayerusername", username);
    navigate("/team/playerinfo");
  };

  const teamPlayerUsernames = new Set(teamPlayersData.map((p) => p.username));

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Players Section */}
      <div>
        <h2 className="text-base font-semibold mb-3 dark:text-white">
          Add Players
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search players by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isSearching && (
          <div className="flex justify-center mt-4">
            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {searchResults.map((player) => {
              const isOnTeam = teamPlayerUsernames.has(player.username);
              const isAdding = addingPlayer === player.username;
              return (
                <div
                  key={player.username}
                  className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
                >
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="More info"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <img
                      src={player.photo || avatar}
                      alt={player.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = avatar;
                      }}
                    />
                    <div className="text-center w-full">
                      <p className="text-sm font-semibold dark:text-white truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{player.username}
                      </p>
                      {player.sport && (
                        <p className="text-xs text-red-600 font-medium mt-0.5">
                          {player.sport}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs h-7 bg-red-600 hover:bg-red-700"
                      disabled={isOnTeam || isAdding}
                      onClick={() => addPlayer(player.username)}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isOnTeam ? (
                        "Added"
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {searchQuery.length >= 2 &&
          !isSearching &&
          searchResults.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              No players found for "{searchQuery}"
            </p>
          )}
      </div>

      {/* Team Roster Section */}
      <div>
        <h2 className="text-base font-semibold mb-3 dark:text-white">
          Your Players{" "}
          <span className="text-sm font-normal text-gray-500">
            ({teamPlayersData.length})
          </span>
        </h2>

        {teamPlayersData.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 text-sm">
              No players in your team yet. Search above to add some.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {teamPlayersData.map((player) => (
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1 border-gray-300"
                    onClick={() => viewProfile(player.username)}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View Profile</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={removingPlayer === player.username}
                    onClick={() => removePlayer(player.username)}
                  >
                    {removingPlayer === player.username ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserMinus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Info Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-lg dark:text-white">
                Player Info
              </h3>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedPlayer.photo || avatar}
                  alt={selectedPlayer.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
                <div>
                  <p className="font-semibold text-base dark:text-white">
                    {selectedPlayer.firstName} {selectedPlayer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{selectedPlayer.username}
                  </p>
                  {selectedPlayer.sport && (
                    <span className="inline-block mt-1 text-xs text-red-600 font-medium px-2 py-0.5 bg-red-50 rounded-full">
                      {selectedPlayer.sport}
                    </span>
                  )}
                </div>
              </div>

              {(selectedPlayer.city ||
                selectedPlayer.country ||
                selectedPlayer.age ||
                selectedPlayer.height) && (
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {selectedPlayer.city && (
                    <div>
                      <p className="text-gray-500 text-xs">City</p>
                      <p className="font-medium dark:text-white">
                        {selectedPlayer.city}
                      </p>
                    </div>
                  )}
                  {selectedPlayer.country && (
                    <div>
                      <p className="text-gray-500 text-xs">Country</p>
                      <p className="font-medium dark:text-white">
                        {selectedPlayer.country}
                      </p>
                    </div>
                  )}
                  {selectedPlayer.age && (
                    <div>
                      <p className="text-gray-500 text-xs">Age</p>
                      <p className="font-medium dark:text-white">
                        {selectedPlayer.age}
                      </p>
                    </div>
                  )}
                  {selectedPlayer.height && (
                    <div>
                      <p className="text-gray-500 text-xs">Height</p>
                      <p className="font-medium dark:text-white">
                        {selectedPlayer.height} cm
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedPlayer.bio && (
                <div className="mb-4">
                  <p className="text-gray-500 text-xs mb-1">Bio</p>
                  <p className="text-sm dark:text-white line-clamp-3">
                    {selectedPlayer.bio}
                  </p>
                </div>
              )}

              {selectedPlayer.skills && selectedPlayer.skills.length > 0 && (
                <div className="mb-5">
                  <p className="text-gray-500 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlayer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-sm h-9"
                  disabled={
                    teamPlayerUsernames.has(selectedPlayer.username) ||
                    addingPlayer === selectedPlayer.username
                  }
                  onClick={() => {
                    addPlayer(selectedPlayer.username);
                    setSelectedPlayer(null);
                  }}
                >
                  {addingPlayer === selectedPlayer.username ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : teamPlayerUsernames.has(selectedPlayer.username) ? (
                    "Already on Team"
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Add to Team
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-sm h-9"
                  onClick={() => {
                    setSelectedPlayer(null);
                    viewProfile(selectedPlayer.username);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPlayers;
