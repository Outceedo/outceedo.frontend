
import "react-circular-progressbar/dist/styles.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import SideNavbar from "./sideNavbar"
import PlayerHeader from "./playerheader";
import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";

  import {  Calendar, MapPin } from "lucide-react";
  import player2 from "../assets/images/player2.jpg";
  import player3 from "../assets/images/player3.jpg";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
  import logo from "../assets/images/logo.jpg"
  import logo1 from "../assets/images/logo1.jpg"


const Dashboard: React.FC = ({ children }: { children?: React.ReactNode }) => {

   // On initial load, check if dark mode is enabled
 
  return (
    
        <>
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
          

  <div className=" p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white min-h-screen dark:bg-slate-800">
     {/* Upcoming Match */} 
     <Card className="md:col-span-2 bg-yellow-100 dark:bg-slate-600 h-10/12">
       <CardContent className="p-6 flex items-center justify-between">
         <div> 
         <h3 className="text-xl font-bold">Up Coming Match</h3>
          <h2 className="text-4xl mt-8 ">Arsenal Vs Chelsea</h2>
          <p className="flex items-center mt-6 dark:text-white text-gray-600 ">
             <Calendar className="w-4 h-4 mr-2 dark:text-white" /> 22 February 2025 </p>
              <p className="flex items-center dark:text-white text-gray-600 mt-1">
                 <MapPin className="w-4 h-4 mr-2 dark:text-white" /> Wembley, England </p>
                  <Button className="mt-10 bg-red-600 h-10 cursor-pointer text-white hover:bg-red-500">Know about their team</Button> 
                  </div>
                   <img src={player2} alt="Player2" className="w-72 h-62 rounded-lg " />
                   </CardContent>
                    </Card>

       {/* Recommendations */}
       <Card className="bg-pink-100 dark:bg-slate-700  ">
        <CardContent className="p-4 ">
        <h3 className="font-semibold mb-4">Recommendations</h3>
          {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="flex items-center  w-full rounded-lg shadow p-2.5 dark:bg-slate-600">
          <img src={player3} alt="Player2" className="w-10 h-10 rounded-full mr-2 " />
          
          <div> 
            <p className="font-medium">Expert Name</p>
            <p className="text-sm text-gray-600 dark:text-white">10+ years ⭐ 3.5/5</p>
            </div>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-gray-500 dark:text-white ml-32 cursor-pointer " />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>

  {/* Recent Matches */}
  <Card className="md:col-span-2 bg-blue-50 dark:bg-slate-700 mt-0">
    <CardContent className="p-6 ">
      <h3 className="font-semibold mb-4">Recent Matches</h3>
      <div className="grid grid-cols-4 text-lg font-medium text-gray-600 mb-4 dark:text-white justify-between">
        <span>Date</span>
        <span>Game</span>
        <span >Score</span>
        <span>Result</span>
      </div>
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="grid grid-cols-4 text-sm py-2 border-b">
          <span>18 Feb</span>
          <span className="flex items-center gap-7">
          <img src={logo1} alt="Team" className="w-8 h-8 rounded-full" />
            <img src={logo} alt="Team" className="w-8 h-8 rounded-full" /> Team A   Team B
          </span>
          <span className=" flex items-center gap-7 ">2 - 0</span>
          <span className="text-green-600">Won</span>
        </div>
      ))}
    </CardContent>
  </Card>

  {/* Notifications */}
  <Card className="bg-yellow-100 dark:bg-slate-700">
    <CardContent className="p-4 ">
      <h3 className="font-semibold mb-4 ">Notifications</h3>
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="p-3 bg-white mb-2 rounded-lg shadow-sm dark:bg-slate-600">Notification {i + 1}</div>
      ))}
    </CardContent>
  </Card> 
</div>
         


    </div>
    </div>
    </div>
    
</SidebarProvider>
        
    </>
  );
};

export default Dashboard;
