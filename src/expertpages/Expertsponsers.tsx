 
 import { Button } from "@/components/ui/button"; 
 import { Card, CardContent } from "@/components/ui/card"; 
 import { Star } from "lucide-react";
 import { faSearch } from '@fortawesome/free-solid-svg-icons';
 import sponser from "../assets/images/sponsor.jpg"
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Expertsponsers = () => { 
  return ( 
  <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900"> 
  {/* Filters */} 
  <div className="flex flex-wrap gap-4 mb-6 items-center justify-between"> 
  <div className="relative w-full sm:w-96">
  <input
    type="text"
    placeholder="Search company / person"
    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <FontAwesomeIcon
    icon={faSearch}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
</div>

 <select className="w-full sm:w-60 border border-gray-300 p-2 rounded">
   <option>Funding Range</option>
    </select> 
    <select className="w-full sm:w-60 border border-gray-300 p-2 rounded">
       <option>Country: Canada</option>
        </select> 
        <select className="w-full sm:w-60 border border-gray-300 p-2 rounded"> 
          <option>Funding type</option> 
          </select> 
          <Button variant="outline" className="text-sm">clear</Button>
           </div>

{/* Cards */}
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <Card key={idx} className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 dark:bg-gray-800">
        <img
          src={sponser}
          alt="profile"
          className="w-58 h-28 object-cover rounded-md"
        />
        <CardContent className="flex-1 p-0">
          <h2 className="text-lg font-semibold">William</h2>
          <p className="text-sm text-gray-600 dark:text-white">Company Name</p>
          <p className="text-sm mt-1">
            I, William, a British citizen residing in London, am sponsoring my cousin Riya Sharma for her UK visit and will provide full financial and accommodation support.
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-700">
            <div className="flex items-center text-yellow-400 mr-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400" />
              ))}
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-lg">4.5</span>
            <span className="ml-2 text-gray-500 dark:text-white">(Sponsored - 10 players)</span>
          </div>
        </CardContent>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">View More</Button>
          <Button variant="ghost" className="text-2xl font-bold bg-gray-100 text-gray-800 flex items-center justify-center ">...</Button>
        </div>
      </Card>
    ))}
  </div>
</div>

); };

export default Expertsponsers;