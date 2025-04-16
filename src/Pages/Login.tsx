import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import football from "../assets/images/football.jpg";
import { loginUser, clearError } from "../store/auth-slice";
import User from "./user";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
    setFormError("");
  }, [dispatch]);

  useEffect(() => {
    // Update form error when error state changes
    if (error) {
      // Handle the case where error could be an object
      if (typeof error === "object") {
        // If error is an object, try to extract a message or stringify it
        if (error.message) {
          setFormError(error.message);
        } else {
          try {
            setFormError(JSON.stringify(error));
          } catch {
            setFormError("An error occurred");
          }
        }
      } else {
        // If error is a string, use it directly
        setFormError(error);
      }
    }
  }, [error]);

  useEffect(() => {
    // Navigate based on role when user logs in
    if (user) {
      setLoginSuccess(true);

      // Use setTimeout to allow the success message to be displayed for a moment
      const timer = setTimeout(() => {
        const userRole = user.role?.toLowerCase() || "";
        if (userRole === "player") {
          navigate("/player/profile");
        } else if (userRole === "expert") {
          navigate("/expert/profile");
        } else {
          navigate("/home");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form errors
    setFormError("");

    // Validate form
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    // Dispatch login action
    dispatch(loginUser({ email, password }));
  };

  // Close modal and clear errors when modal is closed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearError());
    setFormError("");
  };

  // Safe error message display function
  const getErrorMessage = () => {
    if (!formError) return null;

    if (typeof formError === "object") {
      try {
        return JSON.stringify(formError);
      } catch {
        return "An error occurred";
      }
    }

    return formError;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
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
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-Raleway mb-4">
          Welcome To Sports App
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-Opensans">
          Find expert coaches and mentors to guide students in mastering their
          game. Connect with top professionals for personalized training, skill
          development, and strategic insights to elevate performance.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-md mx-auto lg:w-96 mt-12 sm:mt-16 lg:mt-0">
        <h2 className="text-3xl font-bold text-black mb-6">Login</h2>

        {/* Success Message */}
        {loginSuccess && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded border border-green-300">
            <p className="font-medium">Login successful!</p>
            <p className="text-sm">Redirecting you to your dashboard...</p>
          </div>
        )}

        {/* Error Message */}
        {formError && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded border border-red-300">
            <p className="font-medium">Error</p>
            <p className="text-sm">{getErrorMessage()}</p>
          </div>
        )}

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
              required
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
              required
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
            className={`w-full bg-[#FE221E] text-white py-2 rounded-lg transition duration-300 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#C91C1A]"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
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
                  onClick={handleCloseModal}
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
  );
};

export default Login;
