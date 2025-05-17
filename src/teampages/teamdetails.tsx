import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const teamMembers = ["jack", "mick", "jay", "axl", "nick"];

const TeamDetails = () => {
  return (
    <div className="space-y-6 mt-6">
  {/* About Team Card */}
  <Card className="w-full">
    <CardContent className="p-4">
      <div className="flex  items-start mb-2">
        <h2 className="text-md font-semibold">About Team</h2>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-700">
        I am a professional guitarist and qualified music teacher with extensive experience
        as a soloist, accompanist, and band member across various genres including Rock, Soul,
        Funk, Folk, Latin, Reggae, Gypsy Jazz, Classical.
      </p>
      <Button
        variant="link"
        className="mt-2 text-blue-600 p-0 h-auto text-sm"
      >
        Read More ...
      </Button>
    </CardContent>
  </Card>

  {/* Team Members Card */}
  <Card className=" w-1/3">
    <CardContent className="p-4">
    <div className="flex items-start mb-2">
      <h3 className="text-md font-semibold mb-2">Team Members</h3>
      <Button variant="ghost" size="icon" className="ml-auto ">
          <Pencil className="w-4 h-4" />
        </Button>
        </div>
      <ul className="text-sm text-gray-800 space-y-1">
        {teamMembers.map((member, idx) => (
          <li key={idx}>{member}</li>
        ))}
      </ul>
    </CardContent>
  </Card>
</div>

  );
};

export default TeamDetails;
