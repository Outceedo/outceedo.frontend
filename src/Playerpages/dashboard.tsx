import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-circular-progressbar/dist/styles.css";
import SideNavbar from "./sideNavbar";
import profile from "../assets/images/profile.jpg";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import PlayerHeader from "./playerheader";

const Dashboard: React.FC = () => {
  // On initial load, check if dark mode is enabled

  return (
    <>
      <div className="flex">
        <SideNavbar />
      
          <PlayerHeader />
           

          <div className=" h-screen w-full mt-20 bg-white p-10 dark:bg-slate-800">
           {/* Main Container */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
       {/* Left Section (Upcoming Match) */}
     <div className="md:col-span-2 bg-yellow-100 p-6 rounded-lg shadow dark:bg-slate-600 flex items-center justify-between">
      <div className="flex-1">
    <h2 className="text-gray-700 font-bold text-xl dark:text-white">Up Coming Match</h2>
    <h1 className="text-2xl font-semibold mt-2">Arsenal Vs Chelsea</h1>
    <p className="text-gray-600 mt-2 dark:text-white "> 22 February 2025</p>
    <p className="text-gray-600 dark:text-white" > Wembley, England</p>
    <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md ">
      Know about their team
    </button>
     </div>

              <img
                src={profile}
                alt="player"
                className="w-52 h-52 rounded-lg ml-6" // Add left margin for spacing
              />
            </div>

            {/* Right Section (Recommendations) */}
            <div className="bg-pink-100 p-4 rounded-lg shadow dark:bg-slate-600">
              <h2 className="text-gray-700 font-bold dark:text-white">
                Recommendations
              </h2>
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center bg-pink-100 p-2 rounded-lg shadow gap-4 mt-3 dark:bg-slate-500 dark:text-white"
                >
                  <img
                    src={profile}
                    alt="Expert"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium">Expert Name</p>
                      <p className="text-gray-500 text-sm dark:text-white">
                        10+ years ⭐ 3.5/5
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className="text-gray-500 dark:text-white ml-4"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Matches Section */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow mt-6 dark:bg-slate-600">
              <h2 className="text-gray-700 font-bold dark:text-white">
                Recent Matches
              </h2>
              <table className="w-full mt-4">
                <thead>
                  <tr className="text-left text-gray-500 border-b dark:text-white">
                    <th className="py-2  dark:text-white">Date</th>
                    <th>Game</th>
                    <th>Score</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">18 Feb</td>
                      <td>Team A vs Team B</td>
                      <td>2 - 0</td>
                      <td className="text-green-500">Won</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notifications Section */}
            <div className="bg-yellow-100 p-4 rounded-lg shadow mt-6 dark:bg-slate-600">
              <h2 className="text-gray-700 font-bold dark:text-white">
                Notifications
              </h2>
              <div className="mt-3 space-y-2 ">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-md shadow dark:bg-slate-300 dark:text-black"
                  >
                    Notification {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
