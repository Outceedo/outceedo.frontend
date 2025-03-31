import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-circular-progressbar/dist/styles.css";
import profile from "../assets/images/profile.jpg";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="h-screen w-full bg-white p-10 dark:bg-slate-800">
          {/* Main Container */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Section (Upcoming Match) */}
            <div className="md:col-span-2 bg-[#FFF8DA] p-6 rounded-lg shadow dark:bg-slate-600 flex items-center justify-between">
              <div className="flex-1 text-center ">
                <h2 className="text-gray-700 font-bold text-xl dark:text-white">
                  Up Coming Match
                </h2>
                <h1 className="text-2xl font-semibold mt-2">
                  Arsenal Vs Chelsea
                </h1>
                <p className="text-gray-600 mt-2 dark:text-white ">
                  {" "}
                  22 February 2025
                </p>
                <p className="text-gray-600 dark:text-white">
                  {" "}
                  Wembley, England
                </p>
                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md ">
                  Know about their team
                </button>
              </div>

              <img
                src={profile}
                alt="player"
                className="w-52 h-52 rounded-lg ml-6 hidden sm:block" // Add left margin for spacing
              />
            </div>

            {/* Right Section (Recommendations) */}
            <div className="bg-[#FFE8E7] p-4 rounded-lg shadow dark:bg-slate-600">
              <h2 className="text-gray-700 font-bold dark:text-white">
                Recommendations
              </h2>
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 gap-4 mt-3 dark:bg-slate-500 dark:text-white"
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

            {/* Recent Matches Section - With Shadcn UI Table */}
            <div className="md:col-span-2 mt-6">
              <Card className="dark:bg-slate-600 border-0 shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-700 font-bold dark:text-white">
                    Recent Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b dark:border-gray-600">
                          <TableHead className="text-gray-500 dark:text-white py-2">
                            Date
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white">
                            Game
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white">
                            Score
                          </TableHead>
                          <TableHead className="text-gray-500 dark:text-white">
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
                            <TableCell className="py-2 font-medium">
                              {match.date}
                            </TableCell>
                            <TableCell>{match.game}</TableCell>
                            <TableCell>{match.score}</TableCell>
                            <TableCell className={getResultClass(match.result)}>
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
            <div className="bg-[#FFF8DA] p-4 rounded-lg shadow mt-6 dark:bg-slate-600">
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
