import { useNavigate } from "react-router-dom";
const User = () => {
    const navigate = useNavigate();
    
    const options = [
      { name: "Players", icon: "fas fa-futbol", role: "player" },
      { name: "Experts", icon: "fas fa-chalkboard-teacher", role: "expert" },
      { name: "Teams", icon: "fas fa-users", role: "team" },
      { name: "Sponsors", icon: "fas fa-dollar-sign", role: "sponsor" },
      { name: "Fans/Followers", icon: "fas fa-trophy", role: "fan" },
    ];
  
    // Function to store role and navigate to signup page
    const handleUserSelection = (role: string) => {
        const lowerCaseRole = role.toLowerCase();
         localStorage.setItem("selectedRole", lowerCaseRole); // Store role in localStorage
      navigate("/signup"); // Redirect to signup page
    };
  
    return (
      
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold font-Raleway text-black mb-6 text-center">
          Sign Up to Sports App
        </h2>
    
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-gray-200 rounded-lg shadow-md group transform transition-all duration-300 hover:scale-95 hover:shadow-xl"
              onClick={() => handleUserSelection(option.role)} // Save role when clicked
            >
              <div className="text-4xl">
                <i className={`${option.icon} text-black`}></i>
              </div>
              <h3 className="mt-2 font-semibold text-black font-Opensans">{option.name}</h3>
    
              <button className="mt-3 px-4 py-2 bg-[#FE221E] text-white rounded-lg text-sm font-Raleway hover:bg-red-500">
                Sign Up as a {option.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    
   
    );
  };
  
  export default User;
  