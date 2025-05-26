import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";
import { useAppDispatch } from "@/store/hooks";
import { updateProfile } from "@/store/profile-slice";

interface ProfileData {
  id?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
  city?: string;
  country?: string;
  club?: string;
  address?: string;
  socialLinks?: {
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
  };
  [key: string]: any;
}

const TeamDetails: React.FC<{ profileData?: ProfileData }> = ({
  profileData = {},
}) => {
  const dispatch = useAppDispatch();
  const bioTextRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isBioLong, setIsBioLong] = useState(false);

  // About Team State
  const [aboutTeam, setAboutTeam] = useState(profileData.bio || "");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState([
    "jack",
    "mick",
    "jay",
    "axl",
    "nick",
  ]);
  const [tempMembers, setTempMembers] = useState([...teamMembers]);
  const [newMember, setNewMember] = useState("");
  const [isEditingMembers, setIsEditingMembers] = useState(false);

  // Update bio when profile data changes
  useEffect(() => {
    if (profileData && profileData.bio) {
      setAboutTeam(profileData.bio);
    }
  }, [profileData]);

  // Check if bio text overflows 3 lines
  useEffect(() => {
    const checkBioLength = () => {
      if (bioTextRef.current) {
        const lineHeight = parseInt(
          window.getComputedStyle(bioTextRef.current).lineHeight
        );
        const height = bioTextRef.current.scrollHeight;
        const lines = height / (lineHeight || 24); // Use 24px as fallback line height
        setIsBioLong(lines > 3);
      }
    };

    // Check after the component mounts and whenever the bio changes
    checkBioLength();
    window.addEventListener("resize", checkBioLength);

    return () => {
      window.removeEventListener("resize", checkBioLength);
    };
  }, [aboutTeam, expanded]);

  // Toggle bio expand/collapse
  const toggleBioExpand = () => {
    setExpanded(!expanded);
  };

  // Save About Team
  const handleSaveAbout = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(updateProfile({ bio: aboutTeam }));
      setIsEditingAbout(false);
      setExpanded(false);
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "About Team updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update team information",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAboutEdit = () => {
    setIsEditingAbout(false);
    // Reset to original value from profile data
    setAboutTeam(profileData.bio || aboutTeam);
  };

  // Add New Team Member
  const handleAddMember = () => {
    const trimmed = newMember.trim();
    const normalizedExisting = tempMembers.map((m) => m.toLowerCase());

    if (!trimmed) {
      Swal.fire({
        icon: "warning",
        title: "Empty Name",
        text: "Please enter a valid team member name.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (normalizedExisting.includes(trimmed.toLowerCase())) {
      Swal.fire({
        icon: "info",
        title: "Already Exists",
        text: `"${trimmed}" is already in the team.`,
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setTempMembers((prev) => [...prev, trimmed]);
    setNewMember("");
  };

  const handleRemoveMember = (index: number) => {
    const newList = [...tempMembers];
    newList.splice(index, 1);
    setTempMembers(newList);
  };

  const handleSaveMembers = () => {
    setTeamMembers([...tempMembers]);
    setIsEditingMembers(false);
    Swal.fire({
      icon: "success",
      title: "Saved",
      text: "Team members updated successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const cancelMembersEdit = () => {
    setTempMembers([...teamMembers]);
    setNewMember("");
    setIsEditingMembers(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* About Team Card */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-start mb-2">
            <h2 className="text-md font-semibold">About Team</h2>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsEditingAbout(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          {isEditingAbout ? (
            <>
              <Textarea
                className="min-h-[100px]"
                value={aboutTeam}
                onChange={(e) => setAboutTeam(e.target.value)}
                disabled={isSubmitting}
                placeholder="Write about your team..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={cancelAboutEdit}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  onClick={handleSaveAbout}
                  className="bg-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="relative">
              <p
                ref={bioTextRef}
                className={`text-sm text-gray-700 ${
                  !expanded && isBioLong ? "line-clamp-3" : ""
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {aboutTeam || "No team information available."}
              </p>

              {isBioLong && (
                <Button
                  variant="link"
                  className="mt-1 text-red-600 p-0 h-auto text-sm flex items-center"
                  onClick={toggleBioExpand}
                >
                  {expanded ? (
                    <>
                      Read Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read More <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetails;
