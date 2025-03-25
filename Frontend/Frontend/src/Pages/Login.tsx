import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import football from "../assets/images/football.jpg";
import axios from "axios";
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
     
      const response = await axios.post("http://localhost:8000/api/v1/auth/login", 
        { email, password }, 
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        const user = response.data.user; // Fetch user from response
        const token = response.data.token;

        if (!user || !user.role) {
            setError("User role not found. Please contact support.");
            return;
        }

        const userRole = user.role.toLowerCase(); // Ensure lowercase role

        // Store authentication token in localStorage
        localStorage.setItem("authToken", token);

        alert(" Login successful!");

        // Redirect based on the user's role
        if (userRole === "player") {
            navigate("/profile");
        } else if (userRole === "expert") {
            navigate("/expertdata");
        } else {
            navigate("/home"); // Default fallback
        }
    }
    } catch (err: any) {
      console.log(err.response.error);
      console.error("Login Error:", err.response?.data || err.message);
    
        //  Check if OTP verification is required
        if (err.response?.data?.error === "An OTP has been sent to mail, please verify!") {
          localStorage.setItem("verificationEmail", email);
          alert("OTP sent to your email. Please verify.");
          navigate("/emailverification", { state: { email } }); // Redirect to OTP verification page
      } else {
          setError(err.response?.data?.message || "Something went wrong. Try again.");
      }
  } finally {
      setLoading(false);
  }
};
  return (
    <div className="relative w-full min-h-screen flex  flex-col lg:flex-row items-center justify-center px-6 lg:px-20">

      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center " style={{ backgroundImage: `url(${football})` }}></div>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Left Side - Welcome Text */}
      <div className="relative text-center lg:text-left text-white z-10 lg:w-1/2 px-6 lg:px-0 mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl  lg:text-5xl font-Raleway mb-4">Welcome To Sports App</h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-Opensans">
          Find expert coaches and mentors to guide students in mastering their game.
          Connect with top professionals for personalized training, skill development, and strategic insights to elevate performance.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-md mx-auto lg:w-96 mt-12 sm:mt-16 lg:mt-0">
        <h2 className="text-3xl font-bold text-black mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-black-700 font-medium mb-2">Email ID</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black-700 font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white-500"
            />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-black-700">Remember me</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4">
          <button onClick={() => navigate("/forgotpassword")} className="text-[#FA6357] hover:underline cursor-pointer">
            Forgot Password?
          </button>
        </div>
        <p className="mt-4 text-gray-600">
          Not a member yet?{" "}
          <button onClick={() => navigate("/user")} className="text-[#FA6357] hover:underline cursor-pointer">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
