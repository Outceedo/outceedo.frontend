
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle } from "lucide-react";
import profile3 from "../assets/images/profile3.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";


const data = [
  { id: 145, name: "Cody Fisher", date: "2 Jan 2025", type: "Product", budget: "-", action: "Accepted", status: "Sponsored", link: "CodyFisher.application", image: profile3 },
  { id: 123, name: "Kieran", date: "20 Dec 2024", type: "None", budget: "-", action: "Rejected", status: "Disapprove", link: "Kieran.application", image: profile3 },
  { id: 432, name: "Samuel Moore", date: "12 Dec 2024", type: "-", budget: "-", action: "Submitted", status: "Pending", link: "SamuelMoore.application", image: profile3 },
  { id: 342, name: "Andy", date: "25 Nov 2024", type: "-", budget: "-", action: "Accepted", status: "Pending", link: "Andy.application", image: profile3  },
  { id: 100, name: "Miguel Mendes", date: "20 Oct 2024", type: "None", budget: "-", action: "Rejected", status: "Disapproved", link: "MiguelMendes.application", image: profile3},
  { id: 70, name: "Joncan Kavlakoglu", date: "15 Sep 2024", type: "-", budget: "-", action: "Accepted", status: "Pending", link: "JoncanKavlakoglu.application", image:profile3  },
  { id: 32, name: "Michael", date: "2 Aug 2025", type: "-", budget: "-", action: "Submitted", status: "Pending", link: "Michael.application", image: profile3 }
];

const getBadgeColor = (status: string) => {
  switch (status) {
    case "Accepted":
      return "bg-green-100 text-green-600";
    case "Rejected":
      return "bg-red-100 text-red-600";
    case "Submitted":
      return "bg-yellow-100 text-yellow-600";
    default:
      return "";
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
   
    case "Sponsored":
      return "text-green-600 bg-green-200";
    case "Pending":
      return "text-yellow-600 bg-yellow-200";
    case "Disapproved":
      return "text-red-600 bg-red-200";
    default:
      return "text-gray-600 bg-gray-200";
  }
};

const SponserApplication = () => {
  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
       <div className="relative w-1/3">
  <FontAwesomeIcon
    icon={faSearch}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
  <Input
    placeholder="Application ID | Search "
    className="pl-10 w-full"
  />
  
</div>

      

        <Select>
          <SelectTrigger className="w-1/3">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sponsored">Sponsored</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Disapproved">Disapproved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Applicant Name and Sponsor Type</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead>Sponsorship Type</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Application View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.id}</TableCell>
              <TableCell className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={app.image} />
                  <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{app.name}</span>
              </TableCell>
              <TableCell>{app.date}</TableCell>
              <TableCell>{app.type}</TableCell>
              <TableCell>{app.budget}</TableCell>
              <TableCell>
                <span className={`text-sm px-2 py-1 rounded ${getBadgeColor(app.action)}`}>
                  {app.action}
                </span>
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Circle size={10} className={getStatusDot(app.status)} />
                <span>{app.status}</span>
              </TableCell>
              <TableCell className="text-blue-500 hover:underline cursor-pointer">
                {app.link}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SponserApplication;
