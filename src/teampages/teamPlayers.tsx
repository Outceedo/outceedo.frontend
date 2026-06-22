import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, teamPlayerService } from "@/store/apiConfig";
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
  Plus,
  Pencil,
} from "lucide-react";
import avatar from "../assets/images/avatar.png";
import outceedoLogo from "../assets/images/logosmall.png";

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

const POSITIONS = [
  "Goalkeeper",
  "Centre-back",
  "Left-back",
  "Right-back",
  "Wing-back",
  "Sweeper",
  "Defensive midfielder",
  "Central midfielder",
  "Attacking midfielder",
  "Left midfielder",
  "Right midfielder",
  "Box-to-box midfielder",
  "Deep-lying playmaker",
  "Mezzala",
  "Striker",
  "Centre forward",
  "Left winger",
  "Right winger",
  "Inside forward",
  "False 9",
  "Second striker",
];

const formatFoot = (foot?: string | null) =>
  foot
    ? foot
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

// Elegant red pill tags for position / age / foot, shared by both card types
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
          className="text-[12px] font-medium text-white bg-red-500 px-2 py-0.5 rounded-sm"
        >
          {t}
        </span>
      ))}
    </div>
  );
};

const emptyForm = {
  firstName: "",
  lastName: "",
  age: "",
  position: "",
  foot: "",
};

const TeamPlayers = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentProfile = useAppSelector(
    (state) => state.profile.currentProfile,
  );
  const teamUsername = currentProfile?.username || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<TeamPlayerData | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null);
  const [removingPlayer, setRemovingPlayer] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Manual players (added by the team, no account)
  const [manualPlayers, setManualPlayers] = useState<ManualPlayer[]>([]);
  const [loadingManual, setLoadingManual] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<ManualPlayer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingManual, setSavingManual] = useState(false);
  const [confirmRemoveManual, setConfirmRemoveManual] =
    useState<ManualPlayer | null>(null);
  const [removingManualId, setRemovingManualId] = useState<string | null>(null);

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

  // Fetch the team's manually-added players
  const fetchManualPlayers = async () => {
    if (!teamUsername) return;
    setLoadingManual(true);
    try {
      const { data } = await teamPlayerService.get("/", {
        params: { teamUsername },
      });
      setManualPlayers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch manual players", err);
    } finally {
      setLoadingManual(false);
    }
  };

  useEffect(() => {
    fetchManualPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamUsername]);

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

  const openAddModal = () => {
    setEditingPlayer(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError("");
    setShowPlayerModal(true);
  };

  const openEditModal = (player: ManualPlayer) => {
    setEditingPlayer(player);
    setForm({
      firstName: player.firstName || "",
      lastName: player.lastName || "",
      age: player.age != null ? String(player.age) : "",
      position: player.position || "",
      foot: player.foot || "",
    });
    setPhotoFile(null);
    setPhotoPreview(player.photo || null);
    setError("");
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setEditingPlayer(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveManualPlayer = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required");
      return;
    }
    setSavingManual(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName.trim());
      fd.append("lastName", form.lastName.trim());
      if (form.age) fd.append("age", form.age);
      if (form.position) fd.append("position", form.position);
      if (form.foot) fd.append("foot", form.foot);
      if (photoFile) fd.append("photo", photoFile);

      if (editingPlayer) {
        await teamPlayerService.patch(`/${editingPlayer.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        fd.append("teamUsername", teamUsername);
        await teamPlayerService.post("/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closePlayerModal();
      fetchManualPlayers();
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0] || err.response?.data?.message;
      setError(msg || "Failed to save player");
    } finally {
      setSavingManual(false);
    }
  };

  const deleteManualPlayer = async (id: string) => {
    setRemovingManualId(id);
    setError("");
    try {
      await teamPlayerService.delete(`/${id}`);
      setManualPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove player");
    } finally {
      setRemovingManualId(null);
    }
  };

  const teamPlayerUsernames = new Set(teamPlayersData.map((p) => p.username));
  const totalPlayers = teamPlayersData.length + manualPlayers.length;

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
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            onClick={openAddModal}
            className="h-10 gap-1.5 bg-red-600 hover:bg-red-700 shrink-0"
            title="Add a player manually"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Manually</span>
          </Button>
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
            ({totalPlayers})
          </span>
          {loadingManual && (
            <Loader2 className="inline h-4 w-4 animate-spin text-red-500 ml-2" />
          )}
        </h2>

        {totalPlayers === 0 && !loadingManual ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 text-sm">
              No players in your team yet. Search above or add one manually.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Outceedo account players */}
            {teamPlayersData.map((player) => (
              <div
                key={player.username}
                className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col items-center gap-2"
              >
                <img
                  src={outceedoLogo}
                  alt="On Outceedo"
                  title="This player is on Outceedo"
                  className="absolute top-3 right-3 w-6 h-6 object-contain"
                />
                <img
                  src={player.photo || avatar}
                  alt={player.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
                <div className="text-center w-full">
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
                <div className="flex gap-1.5 w-full mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 gap-1 border-gray-300"
                    onClick={() => viewProfile(player.username)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={removingPlayer === player.username}
                    onClick={() => setConfirmRemove(player)}
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

            {/* Manually-added players (rendered after Outceedo players) */}
            {manualPlayers.map((player) => (
              <div
                key={player.id}
                className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col items-center gap-2"
              >
                {/* <span className="absolute top-2 left-2 text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  Manual
                </span> */}
                <img
                  src={player.photo || avatar}
                  alt={player.firstName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
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
                <div className="flex gap-1.5 w-full mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 gap-1 border-gray-300"
                    onClick={() => openEditModal(player)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={removingManualId === player.id}
                    onClick={() => setConfirmRemoveManual(player)}
                  >
                    {removingManualId === player.id ? (
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

      {/* Add / Edit Manual Player Modal */}
      {showPlayerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closePlayerModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-base dark:text-white">
                {editingPlayer ? "Edit Player" : "Add Player Manually"}
              </h3>
              <button
                onClick={closePlayerModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Profile photo */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src={photoPreview || avatar}
                  alt="preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
                <label className="text-sm p-2 rounded-sm text-white cursor-pointer bg-red-500">
                  {photoPreview ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPhotoChange}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                    Age
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                    Foot
                  </label>
                  <select
                    value={form.foot}
                    onChange={(e) => setForm({ ...form, foot: e.target.value })}
                    className="w-full h-9 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="right_foot">Right Foot</option>
                    <option value="left_foot">Left Foot</option>
                    <option value="both_foot">Both Foot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                  Position
                </label>
                <select
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="w-full h-9 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={closePlayerModal}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700"
                  disabled={savingManual}
                  onClick={saveManualPlayer}
                >
                  {savingManual ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingPlayer ? (
                    "Save Changes"
                  ) : (
                    "Add Player"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Manual Player Confirmation */}
      {confirmRemoveManual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setConfirmRemoveManual(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-base dark:text-white">
                Remove Player
              </h3>
              <button
                onClick={() => setConfirmRemoveManual(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={confirmRemoveManual.photo || avatar}
                  alt={confirmRemoveManual.firstName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
                <div>
                  <p className="font-semibold text-sm dark:text-white">
                    {confirmRemoveManual.firstName}{" "}
                    {confirmRemoveManual.lastName}
                  </p>
                  {confirmRemoveManual.position && (
                    <p className="text-xs text-gray-500">
                      {confirmRemoveManual.position}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Are you sure you want to remove this player from your team?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={() => setConfirmRemoveManual(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700"
                  disabled={removingManualId === confirmRemoveManual.id}
                  onClick={() => {
                    deleteManualPlayer(confirmRemoveManual.id);
                    setConfirmRemoveManual(null);
                  }}
                >
                  {removingManualId === confirmRemoveManual.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-base dark:text-white">
                Remove Player
              </h3>
              <button
                onClick={() => setConfirmRemove(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={confirmRemove.photo || avatar}
                  alt={confirmRemove.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = avatar;
                  }}
                />
                <div>
                  <p className="font-semibold text-sm dark:text-white">
                    {confirmRemove.firstName} {confirmRemove.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{confirmRemove.username}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Are you sure you want to remove this player from your team? They
                will need to be re-added manually.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={() => setConfirmRemove(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700"
                  disabled={removingPlayer === confirmRemove.username}
                  onClick={() => {
                    removePlayer(confirmRemove.username);
                    setConfirmRemove(null);
                  }}
                >
                  {removingPlayer === confirmRemove.username ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
