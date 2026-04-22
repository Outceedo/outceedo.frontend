import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";
import { userService } from "@/store/apiConfig";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Users } from "lucide-react";
import avatar from "../assets/images/avatar.png";

interface AssociatedTeam {
  teamName: string | null;
  teamUsername: string;
  photo: string | null;
}

const PlayerTeamTab = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProfile } = useAppSelector((state) => state.profile);
  const [isExiting, setIsExiting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const associatedTeam = currentProfile?.associatedTeam as AssociatedTeam | null | undefined;

  const handleExitTeam = async () => {
    setIsExiting(true);
    setError("");
    try {
      await userService.patch("/players/exit");
      setShowConfirm(false);
      const username = localStorage.getItem("username");
      if (username) dispatch(getProfile(username));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to exit team. Please try again.");
    } finally {
      setIsExiting(false);
    }
  };

  const viewTeamProfile = () => {
    if (!associatedTeam?.teamUsername) return;
    localStorage.setItem("viewteamusername", associatedTeam.teamUsername);
    const role = localStorage.getItem("role") || "";
    const routes: Record<string, string> = {
      player: "/player/teamprofile",
      expert: "/expert/teamprofile",
      sponsor: "/sponsor/teamprofile",
    };
    navigate(routes[role] || "/fan/teamprofile");
  };

  if (!associatedTeam?.teamUsername) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          You are not part of any team yet.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          A team manager can add you from the Manage Team section.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      {/* Team Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-red-600 to-red-800" />

        <div className="px-5 pb-5">
          {/* Team Photo */}
          <div className="-mt-8 mb-3">
            <img
              src={associatedTeam.photo || avatar}
              alt={associatedTeam.teamName || associatedTeam.teamUsername}
              className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
              onError={(e) => {
                e.currentTarget.src = avatar;
              }}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-base font-bold dark:text-white">
              {associatedTeam.teamName || associatedTeam.teamUsername}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              @{associatedTeam.teamUsername}
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              Active Member
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8 border-gray-300"
              onClick={viewTeamProfile}
            >
              View Team
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"
              onClick={() => setShowConfirm(true)}
            >
              <LogOut className="h-3 w-3" />
              Exit Team
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !isExiting && setShowConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base dark:text-white">
                    Exit Team?
                  </h3>
                  <p className="text-xs text-gray-500">
                    {associatedTeam.teamName || associatedTeam.teamUsername}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to leave{" "}
                <strong>{associatedTeam.teamName || associatedTeam.teamUsername}</strong>?
                You will be removed from the team roster and your profile will
                no longer show this team association.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={isExiting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleExitTeam}
                  disabled={isExiting}
                >
                  {isExiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, Exit Team"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerTeamTab;
