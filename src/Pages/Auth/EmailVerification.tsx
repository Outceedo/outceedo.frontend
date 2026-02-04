import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyEmail, resendOtp } from "../../store/auth-slice";
import { RootState } from "../../store/store";
import Swal from "sweetalert2";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import logo from "../../assets/images/logosmall.png";
import img from "@/assets/images/Main.png";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail");
    if (!storedEmail) {
      Swal.fire({
        icon: "error",
        title: "No Email Found",
        text: "Please sign up first to receive a verification code.",
        confirmButtonColor: "#ef4444",
      }).then(() => navigate("/signup"));
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else {
      setResendSuccess(false);
    }
    return () => timer && clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError("");

    if (!otp || otp.length < 4) {
      // Basic length check
      setFieldErrors({ otp: "Please enter the full verification code." });
      return;
    }

    const requestData = { email, otp: parseInt(otp, 10) };

    const resultAction = await dispatch(verifyEmail(requestData));

    if (verifyEmail.fulfilled.match(resultAction)) {
      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: "Your email has been successfully verified.",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => navigate("/login"));
    } else if (verifyEmail.rejected.match(resultAction)) {
      const payload = resultAction.payload;
      setApiError(
        typeof payload === "string"
          ? payload
          : (payload as any)?.error || "Verification failed.",
      );
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setApiError("");

    const resultAction = await dispatch(resendOtp({ email }));

    if (resendOtp.fulfilled.match(resultAction)) {
      setResendSuccess(true);
      setCooldown(60);
      Swal.fire({
        icon: "success",
        title: "OTP Resent",
        text: "Check your inbox for the new code.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setApiError("Failed to resend OTP.");
    }
    setResendLoading(false);
  };

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
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-gray-900 font-bold text-sm hover:bg-white hover:shadow-lg transition-all z-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-full">
        {/* Branding Section */}
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
            VERIFY YOUR <span className="text-red-500">EMAIL.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
            Secure your account by entering the 6-digit code sent to your inbox.
          </p>
        </motion.div>

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md pb-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Verify Code
              </h2>
            </div>

            {email && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Code sent to
                </p>
                <p className="text-gray-900 font-bold truncate">{email}</p>
              </div>
            )}

            {(error || apiError) && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="text-xs font-black uppercase mb-1">Error</p>
                <p className="text-sm font-medium">
                  {apiError || String(error)}
                </p>
              </div>
            )}

            {resendSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium">
                New code sent successfully!
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d+$/.test(val)) setOtp(val);
                  }}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-black text-3xl tracking-[0.4em] text-center focus:border-red-500 outline-none transition-all"
                  maxLength={6}
                  inputMode="numeric"
                />
                {fieldErrors.otp && (
                  <p className="text-red-500 text-[10px] font-bold mt-2 text-center uppercase">
                    {fieldErrors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest text-lg rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">
                Didn't receive it?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || cooldown > 0}
                className={`w-full h-12 border-2 font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${
                  resendLoading || cooldown > 0
                    ? "border-gray-100 text-gray-300"
                    : "border-red-500 text-red-500 hover:bg-red-50"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`}
                />
                {resendLoading
                  ? "Resending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Code"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
