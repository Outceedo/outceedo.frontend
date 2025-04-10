import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import football from "../assets/images/football.jpg";
import { loginUser } from "../store/auth-slice";
import User from "./user";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const userRole = user.role.toLowerCase();
      if (userRole === "player") {
        navigate("/player/profile");
      } else if (userRole === "expert") {
        navigate("expert/expertdata");
      } else {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <>
      <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center "
          style={{ backgroundImage: `url(${football})` }}
        ></div>

        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        {isModalOpen && (
          <>
            <div className="absolute inset-0 bg-black opacity-40 w-screen h-screen"></div>
            <div className="absolute inset-0 bg-black opacity-40 w-screen h-screen"></div>
          </>
        )}

        {/* Left Side - Welcome Text */}
        <div className="relative text-center lg:text-left text-white z-10 lg:w-1/2 px-6 lg:px-0 mb-8 sm:mb-12 hidden lg:block">
          <h2 className="text-2xl sm:text-3xl  lg:text-5xl font-Raleway mb-4">
            Welcome To Sports App
          </h2>
          <p className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-Opensans">
            Find expert coaches and mentors to guide students in mastering their
            game. Connect with top professionals for personalized training,
            skill development, and strategic insights to elevate performance.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-md mx-auto lg:w-96 mt-12 sm:mt-16 lg:mt-0">
          <h2 className="text-3xl font-bold text-black mb-6">Login</h2>

          {error && <div className="mb-4 text-red-500">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-black-700 font-medium mb-2">
                Email ID
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-black-700 font-medium mb-2">
                Password
              </label>
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
              disabled={isLoading}
              className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={() => navigate("/forgotpassword")}
              className="text-[#FA6357] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <p className="mt-4 text-gray-600">
            Not a member yet?{" "}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[#FA6357] hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
          {/* Modal */}
          {isModalOpen && (
            <>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-2xl"
                  >
                    &times;
                  </button>
                  <User /> {/* Render the Signup component inside the modal */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
