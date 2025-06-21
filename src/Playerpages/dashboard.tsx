import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-circular-progressbar/dist/styles.css";
import profile from "../assets/images/avatar.png";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";

const Dashboard: React.FC = () => {
  const recentMatches = [
    { date: "18 Feb", game: "Team A vs Team B", score: "2 - 0", result: "Won" },
    { date: "15 Feb", game: "Team C vs Team A", score: "1 - 3", result: "Won" },
    {
      date: "10 Feb",
      game: "Team A vs Team D",
      score: "0 - 1",
      result: "Lost",
    },
    {
      date: "05 Feb",
      game: "Team E vs Team A",
      score: "1 - 1",
      result: "Draw",
    },
    { date: "01 Feb", game: "Team A vs Team F", score: "4 - 2", result: "Won" },
  ];

  const { currentProfile } = useAppSelector((state) => state.profile);

  // Function to get result class
  const getResultClass = (result: string) => {
    switch (result.toLowerCase()) {
      case "won":
        return "text-green-500";
      case "lost":
        return "text-red-500";
      case "draw":
        return "text-yellow-500";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex">
        <div className="w-full bg-white dark:bg-slate-800">
          {/* Main Container */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4 md:px-6">
            {/* Left Section (Upcoming Match) - Redesigned to match image 4 */}
            <div className="md:col-span-2 bg-[#FFF8DA] p-5 rounded-lg shadow dark:bg-slate-600">
              <div className="grid grid-cols-2 gap-4">
                {/* Left side - Match details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-sm mb-1">Up Coming Match</p>
                    <h2 className="text-2xl font-bold mt-2">Arsenal Vs Chelsa</h2>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-white">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                      <span className="text-sm">22 February 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-white">
                      <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
                      <span className="text-sm">in Wembley, England</span>
                    </div>
                  </div>

                  <button className="mt-4 px-2  bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition cursor-pointer h-11 sm:w-[70%] ">
                    Know about their team
                  </button>
                </div>

                {/* Right side - Illustration */}
                <div className="flex items-center justify-center">
                  <img
                    src={currentProfile?.photo || profile}
                    alt="Player at laptop"
                    className="max-h-40 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Section (Recommendations) */}
            <div className="bg-[#FFE8E7] p-4 rounded-lg shadow">
              <h2 className="text-gray-700 font-bold dark:text-white text-base mb-3">
                Recommendations
              </h2>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 gap-2 dark:bg-slate-500 dark:text-white"
                    >
                      <img
                        src={profile}
                        alt="Expert"
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex items-center justify-between w-full min-w-0">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-medium text-sm truncate ml-1">Expert Name</p>
                          <div className="flex items-center text-gray-500 dark:text-white text-xs">
                            <span className="truncate ml-1">10+</span>
                            <span className="truncate whitespace-nowrap"> years</span>
                            <FontAwesomeIcon
                              className="text-amber-300 mx-0.5 text-xs"
                              icon={faStar}
                            />
                            <span className="whitespace-nowrap">3.5/5</span>
                          </div>
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="text-gray-500 dark:text-white cursor-pointer text-xs flex-shrink-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Matches Section - With Shadcn UI Table */}
            <div className="md:col-span-2 mt-4">
              <Card className="bg-[#F4FFFD] dark:bg-slate-600 border-0 shadow">
                <CardHeader className="p-4">
                  <CardTitle className="text-gray-700 font-bold dark:text-white text-base">
                    Recent Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b dark:border-gray-600">
                          <TableHead className="text-gray-500 dark:text-white py-2 text-xs">
                            Date
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white text-xs">
                            Game
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white text-xs">
                            Score
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white text-xs">
                            Result
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentMatches.map((match, i) => (
                          <TableRow
                            key={i}
                            className="border-b dark:border-gray-600"
                          >
                            <TableCell className="py-2 font-medium text-xs">
                              {match.date}
                            </TableCell>
                            <TableCell className="text-xs">{match.game}</TableCell>
                            <TableCell className="text-xs">{match.score}</TableCell>
                            <TableCell className={`${getResultClass(match.result)} text-xs`}>
                              {match.result}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Section */}
            <div className="bg-[rgba(249,220,92,0.3)] p-4 rounded-lg shadow mt-4 dark:bg-slate-600">
              <h2 className="text-gray-700 font-bold dark:text-white text-base mb-3">
                Notifications
              </h2>
              <div className="space-y-2">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white rounded-md shadow dark:bg-slate-300 dark:text-black text-sm"
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