
import {  Home, User, ClipboardCheck, Trophy, Users, Handshake } from "lucide-react";
import {
  Sidebar,
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "../assets/images/profile.jpg";


const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Profile", url: "/profile", icon: User },
  { title: "My Bookings", url: "/mybooking", icon: ClipboardCheck },
  { title: "Matches", url: "/matches", icon: Trophy },
  { title: "Experts", url: "/expertspage", icon: Users },
  { title: "Sponsors", url: "/sponsors", icon: Handshake },
];

const SideNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  


  return (
    <Sidebar className="flex min-h-screen bg-gray-100  dark:bg-gray-900">
  <SidebarContent >
  <aside className="fixed top-0  w-72 bg-white dark:bg-gray-900 shadow-lg p-6 h-full ">
  <h1 className="text-center  text-3xl text-gray-800 dark:text-white">LOGO</h1>
  <div className="text-center bg-slate-100 mt-4 mb-8 shadow-md dark:bg-gray-700 p-5 rounded-lg">
          
          <img
            src={Profile}
            alt="Profile"
            className="rounded-full mx-auto w-24 h-24 cursor-pointer"
            onClick={() => navigate("/detailsform")}
          />
          <h2 className="text-lg font-semibold mt-4 text-gray-800 dark:text-white">Rohan Roshan</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400">Under 15</p>
          <p className="text-gray-600 font-bold text-sm dark:text-gray-400">Goal Keeper</p>
        </div>

    <SidebarGroup>
      
      <SidebarGroupContent>
      <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`flex items-center space-x-2 p-8 rounded-lg w-full text-xl mt-1 cursor-pointer transition-all ${location.pathname === item.url ? "bg-gray-200 shadow-md dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    onClick={() => navigate(item.url)}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="text-2xl text-gray-800 dark:text-gray-300" />
                      <span className="text-gray-800 dark:text-white">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    </aside>
  </SidebarContent>
</Sidebar>

   
  );
};

export default SideNavbar;


