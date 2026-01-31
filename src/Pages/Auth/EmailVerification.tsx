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
  const [, setVerificationAttempted] = useState(false);
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
        text: "No email found for verification. Please sign up first.",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        navigate("/signup");
      });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    } else {
      setResendSuccess(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError("");

    if (!otp) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "OTP is required.",
      }));
      return;
    }

    if (!/^\d+$/.test(otp)) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "OTP should contain only numbers.",
      }));
      return;
    }

    const requestData = {
      email: email,
      otp: parseInt(otp, 10),
    };

    setVerificationAttempted(true);

    try {
      const resultAction = await dispatch(verifyEmail(requestData));

      if (verifyEmail.fulfilled.match(resultAction)) {
        Swal.fire({
          icon: "success",
          title: "Verification Successful!",
          text: "Your email has been verified successfully.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: "#fff",
          iconColor: "#22c55e",
        }).then(() => {
          navigate("/login");
        });
      } else if (verifyEmail.rejected.match(resultAction)) {
        if (typeof resultAction.payload === "string") {
          setApiError(resultAction.payload);
        } else if (
          resultAction.payload &&
          typeof resultAction.payload === "object"
        ) {
          setApiError(
            (resultAction as any)?.payload?.error ||
              "Verification failed. Please try again."
          );
        } else {
          setApiError("Verification failed. Please try again.");
        }
      }
    } catch (err) {
      setApiError("An unexpected error occurred. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setApiError("");

    try {
      const requestData = {
        email: email,
      };

      const resultAction = await dispatch(resendOtp(requestData));

      if (resendOtp.fulfilled.match(resultAction)) {
        setResendSuccess(true);
        setCooldown(60);

        Swal.fire({
          icon: "success",
          title: "OTP Resent",
          text: "A new verification code has been sent to your email.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: "#fff",
          iconColor: "#22c55e",
        });
      } else if (resendOtp.rejected.match(resultAction)) {
        if (typeof resultAction.payload === "string") {
          setApiError(resultAction.payload);
        } else if (
          resultAction.payload &&
          typeof resultAction.payload === "object"
        ) {
          setApiError(
            (resultAction as any)?.payload?.error ||
              "Failed to resend OTP. Please try again."
          );
        } else {
          setApiError("Failed to resend OTP. Please try again.");
        }
      }
    } catch (err) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-multiply" />
      </div>

      {/* Go Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-gray-900 font-bold text-sm hover:bg-white hover:shadow-lg transition-all z-30"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:w-1/2"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
            VERIFY YOUR <span className="text-red-500">EMAIL</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
            We've sent a verification code to your email. Please enter it below
            to complete your registration.
          </p>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-2xl shadow-black/5 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Email Verification
              </h2>
            </div>

            {email && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-gray-600 font-medium text-sm">
                  Verification code sent to:
                </p>
                <p className="text-gray-900 font-bold truncate">{email}</p>
              </div>
            )}

            {(error || apiError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="font-bold text-red-600">Error</p>
                <p className="text-sm text-red-500">
                  {apiError || (typeof error === "string" ? error : null)}
                </p>
                {apiError === "OTP should be number" && (
                  <p className="mt-2 text-xs text-red-400">
                    Please enter only numeric digits for the OTP code.
                  </p>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 font-medium text-sm">
                  OTP has been resent successfully. Please check your email.
                </p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    fieldErrors.otp ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      setOtp(value);
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-center text-2xl tracking-[0.5em] ${
                    fieldErrors.otp ? "border-red-500" : "border-gray-200"
                  }`}
                  maxLength={6}
                  inputMode="numeric"
                />
                {fieldErrors.otp && (
                  <p className="text-red-500 text-xs mt-2">{fieldErrors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-14 bg-red-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600 font-medium text-center mb-4">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || cooldown > 0}
                className={`w-full h-12 border-2 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  resendLoading || cooldown > 0
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-red-500 text-red-500 hover:bg-red-50"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`}
                />
                {resendLoading
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
