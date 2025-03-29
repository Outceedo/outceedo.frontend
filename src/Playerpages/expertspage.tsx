
import SideNavbar from "./sideNavbar";
import PlayerHeader from "./playerheader";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
 import { Star } from "lucide-react"; 
 import { useNavigate } from "react-router-dom";
 import profile2 from "../assets/images/profile2.jpg";
 import profile3 from "../assets/images/profile3.jpg";
 import profile4 from "../assets/images/profile4.jpg";
 import profile5 from "../assets/images/profile5.jpg";
 
 import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



 const experts = [
   { name: "Conor Henderson", image: profile2 },
    { name: "Kai Liddell", image: profile3 }, 
    { name: "Expert Name", image:profile4 }, 
    { name: "Expert Name", image: profile5 }, 
    { name: "Expert Name", image: profile5 }, 
    { name: "Expert Name", image: profile4 }, 
    { name: "Expert Name", image: profile3 }, 
    { name: "Expert Name", image: profile2 },
   ];
  

const Expertspage: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const options = ["Profession", "City", "Country", "Gender", "Language"];
  const navigate = useNavigate();

  return (

    <div>
    <SidebarProvider>
      <div className="flex w-full  dark:bg-gray-900">
        <SideNavbar />
        <div className="flex w-full">
          {/* Player Header */}
          <PlayerHeader />

          {/* Page Content */}
          <div className="w-full px-6 pt-4 pb-10 mt-20 ml-20 bg-white dark:bg-slate-800">
            {/* Render children if any */}
            {children}
            
            <div className="flex flex-wrap gap-4">
  {options.map((option, index) => (
    <Select key={index}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Select ${option}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{option}</SelectLabel>
          <SelectItem value={option.toLowerCase()}>{option}</SelectItem>
          
        </SelectGroup>
      </SelectContent>
    </Select>
      ))}
</div>
        

{/* Experts Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
    {experts.map((expert, index) => (
      <Card key={index} className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-700">
        
        <img src={expert.image} alt={expert.name} className="w-full h-48 p-2 rounded-2xl " />
        <CardContent className="p-4 text-center">
          <h3 className=" text-lg font-semibold text-left">{expert.name}</h3>
          <p className=" text-gray-500 text-sm text-left dark:text-white">Lorem ipsum dolor sit amet.</p>
          <div className="flex  items-center gap-2 mt-2 text-yellow-500  text-left">
            <Star className="w-4 h-4  " /> 3.5/5
          </div>
          <p className="text-red-500 font-bold mt-2 text-right">100+</p>
          <Button 
  className="w-full mt-4 bg-red-500 cursor-pointer hover:bg-red-600 text-white" 
  onClick={() => navigate("/experts")}
>
  View Profile
</Button>
        </CardContent>
      </Card>
    ))}
  </div>

  {/* Pagination */}
  <div className="flex justify-center mt-6">
    <Button variant="outline">&lt;</Button>
    <span className="mx-4 ">1</span>
    <span className="mx-4">2</span>
    <Button variant="outline">&gt;</Button>
  </div>
</div>

      </div>
      </div>
      </SidebarProvider>
      </div>
    
  
  );
};

export default Expertspage;
