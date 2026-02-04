import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { forgotPassword } from "../../store/auth-slice";
import { ArrowLeft, KeyRound, Mail, CheckCircle } from "lucide-react";
import logo from "../../assets/images/logosmall.png";
import img from "@/assets/images/Main.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, forgotPasswordError, emailSent } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailPattern: RegExp =
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    dispatch(forgotPassword({ email }));
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  return (
    // 👇 FIX: Use h-screen + overflow-y-auto to allow scrolling on mobile
    <div className="relative w-full h-screen overflow-y-auto bg-white scroll-smooth">
      {/* Background Image Layer - FIXED so it stays in place during scroll */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-multiply" />
      </div>

      {/* Go Back Button - Fixed for accessibility */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
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
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:w-1/2"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
            FORGOT <span className="text-red-500">PASSWORD?</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0 hidden md:block">
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </p>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md pb-10" // Bottom padding for mobile breathing room
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            {emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">
                  Check Email
                </h2>
                <p className="text-sm text-gray-600 font-medium mb-8">
                  A password reset link has been sent to{" "}
                  <span className="font-bold">{email}</span>.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-14 bg-red-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-red-600 transition-all"
                >
                  Back to Login
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    Reset
                  </h2>
                </div>

                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-6">
                  Enter your email to receive a reset link.
                </p>

                {(error || forgotPasswordError) && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl">
                    <p className="text-xs font-black uppercase mb-1">Error</p>
                    <p className="text-sm font-medium">
                      {error || forgotPasswordError}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:border-red-500 outline-none transition-all"
                        placeholder="name@example.com"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send Link"}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto"
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

export default ForgotPassword;
