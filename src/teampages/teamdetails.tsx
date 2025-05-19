import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X } from "lucide-react";
import Swal from "sweetalert2";

const TeamDetails = () => {
  // About Team State
  const [aboutTeam, setAboutTeam] = useState(
    "I am a professional guitarist and qualified music teacher with extensive experience as a soloist, accompanist, and band member across various genres including Rock, Soul, Funk, Folk, Latin, Reggae, Gypsy Jazz, Classical."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState(["jack", "mick", "jay", "axl", "nick"]);
  const [tempMembers, setTempMembers] = useState([...teamMembers]);
  const [newMember, setNewMember] = useState("");
  const [isEditingMembers, setIsEditingMembers] = useState(false);

  // Save About Team
  const handleSaveAbout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setAboutTeam(aboutTeam.trim());
      setIsEditingAbout(false);
      setIsSubmitting(false);
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "About Team updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    }, 500);
  };

  const cancelAboutEdit = () => {
    setIsEditingAbout(false);
    setAboutTeam(aboutTeam);
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
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsEditingAbout(true)}>
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
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={cancelAboutEdit} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSaveAbout} className="bg-red-600" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">{aboutTeam}</p>
              <Button variant="link" className="mt-2 text-blue-600 p-0 h-auto text-sm">
                Read More ...
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Members Card */}
      <Card className="w-full md:w-1/3">
        <CardContent className="p-4">
          <div className="flex items-start mb-2">
            <h3 className="text-md font-semibold">Team Members</h3>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsEditingMembers(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          {isEditingMembers ? (
            <>
              <div className="space-y-2">
                {tempMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={member} disabled className="text-sm" />
                    <Button size="icon" variant="destructive" onClick={() => handleRemoveMember(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                    placeholder="Add new member"
                  />
                  <Button className="bg-amber-400 text-black hover:bg-amber-500" onClick={handleAddMember}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" onClick={cancelMembersEdit}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button className="bg-red-600" onClick={handleSaveMembers}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            </>
          ) : (
            <ul className="text-sm text-gray-800 space-y-1">
              {teamMembers.map((member, idx) => (
                <li key={idx}>{member}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetails;
