import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { resetPassword, clearError } from "../../store/auth-slice";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import logo from "../../assets/images/logosmall.png";
import img from "@/assets/images/Main.png";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = id || "";

  const dispatch = useAppDispatch();
  const {
    isLoading,
    resetPasswordSuccess,
    error: authError,
  } = useAppSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  // Handle Redirect Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      navigate("/login");
    }
    return () => timer && clearTimeout(timer);
  }, [countdown, navigate]);

  // Handle Success State from Redux
  useEffect(() => {
    if (resetPasswordSuccess) {
      setCountdown(5);
    }
  }, [resetPasswordSuccess]);

  // Cleanup errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!newPassword || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    dispatch(resetPassword({ token, password: newPassword }));
  };

  const isFormValid =
    newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    // 👇 FIX: Use h-screen + overflow-y-auto to allow scrolling on mobile
    <div className="relative w-full h-screen overflow-y-auto bg-white scroll-smooth">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
      </div>

      {/* Fixed Navigation Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/login")}
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
          className="text-center lg:text-left lg:w-1/2"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
            SECURE YOUR <span className="text-red-500">ACCOUNT.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0 hidden md:block">
            Create a strong, unique password to keep your profile and assessed
            performances safe.
          </p>
        </motion.div>

        {/* Right Side - Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md pb-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            {resetPasswordSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">
                  Success!
                </h2>
                <p className="text-gray-600 font-medium mb-2">
                  Your password has been reset.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Redirecting to login in{" "}
                  <span className="font-bold text-red-500">{countdown}s</span>
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-14 bg-red-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-red-600 transition-all"
                >
                  Login Now
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    New Password
                  </h2>
                </div>

                {(localError || authError) && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="text-xs font-black uppercase mb-1">Error</p>
                    <p className="text-sm font-medium">
                      {localError ||
                        (authError as any)?.error ||
                        String(authError)}
                    </p>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest text-lg rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-red-500 flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
