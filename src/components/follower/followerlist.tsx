import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const followedPeople = [
  {
    id: 1,
    name: "John Doe",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Emily Carter",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Rahul Singh",
    image: "https://i.pravatar.cc/150?img=3",
  },
];

export default function FollowList() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {followedPeople.map((person) => (
        <div
          key={person.id}
          className="flex items-center justify-between border p-4 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={person.image} />
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => alert(`Removed ${person.name} from follow list`)}
              >
                Remove from follow list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
