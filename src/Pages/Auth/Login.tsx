import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, clearError } from "../../store/auth-slice";
import User from "../Home/user";
import { Eye, EyeOff, ArrowLeft, X, LogIn } from "lucide-react";
import Swal from "sweetalert2";
import logo from "../../assets/images/logosmall.png";
import img from "@/assets/images/Main.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    setFormError("");
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      if (typeof error === "object") {
        if ((error as any).message) {
          setFormError((error as any).message);
        } else {
          try {
            setFormError(JSON.stringify(error));
          } catch {
            setFormError("An error occurred");
          }
        }
      } else {
        setFormError(error as string);
      }
    }
  }, [error]);

  useEffect(() => {
    if (user && !isRedirecting && user.token) {
      localStorage.setItem("token", user.token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userid", user.id);
      setLoginSuccess(true);
      setIsRedirecting(true);
      // Actual navigation usually happens here or via a redirect component
    }
  }, [user, isRedirecting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }
    try {
      const response = await dispatch(loginUser({ email, password }));
      if (
        response.payload &&
        (response.payload as any).message ===
          "An OTP has been sent to your email. Please Verify!"
      ) {
        Swal.fire({
          icon: "success",
          title: "Verify Email",
          text: "An OTP has been sent to your email.",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          localStorage.setItem("verificationEmail", email);
          navigate("/emailverification");
        });
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearError());
    setFormError("");
  };

  const getErrorMessage = () => {
    if (!formError) return null;
    if (formError.includes("Invalid Password")) return "Invalid Password";
    if (formError.includes("OTP")) return "Please Verify Your Email!";
    if (formError.includes("Password should be atleast 8 letters"))
      return "Password should be at least 8 characters";
    return "User Not Found";
  };

  return (
    // 👇 FIX: Use h-screen + overflow-y-auto to allow scrolling on mobile
    <div className="relative w-full h-screen overflow-y-auto bg-white scroll-smooth">
      {/* Background Image Layer - FIXED position so it stays behind while scrolling */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-multiply" />
      </div>

      {/* Go Back Button - Fixed position for accessibility */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-gray-900 font-bold text-sm hover:bg-white hover:shadow-lg transition-all z-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-full">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:w-1/2"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3 md:mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic md:mb-6">
            WELCOME <span className="text-red-500">BACK.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0 hidden md:block">
            Connect with experts to get your sports skills and performances
            assessed at an elite level.
          </p>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md pb-10" // Bottom padding for mobile view breathing room
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Login
              </h2>
            </div>

            {loginSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="font-bold text-green-700 text-sm">
                  Success! Redirecting...
                </p>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="text-xs font-black uppercase tracking-widest mb-1">
                  Error
                </p>
                <p className="text-sm font-medium">{getErrorMessage()}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:border-red-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:border-red-500 outline-none transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-600 font-bold uppercase">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgotpassword")}
                  className="text-xs font-black text-red-500 hover:text-red-600 uppercase"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className={`w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all ${
                  isLoading || isRedirecting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading || isRedirecting ? "Please wait..." : "Login"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                Not a member yet?{" "}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-red-500 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Signup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 shadow-xl z-[110]"
            >
              <X size={20} />
            </button>
            <User />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
