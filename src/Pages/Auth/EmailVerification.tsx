import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyEmail, resendOtp } from "../../store/auth-slice";
import { RootState } from "../../store/store";
import football from "../../assets/images/football.jpg";
import Swal from "sweetalert2"; // Import SweetAlert2

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

  // Get email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail");
    if (!storedEmail) {
      Swal.fire({
        icon: "error",
        title: "No Email Found",
        text: "No email found for verification. Please sign up first.",
        confirmButtonColor: "#FE221E",
      }).then(() => {
        navigate("/signup");
      });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  // Cooldown timer effect
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

    // Validate that OTP only contains numbers
    if (!/^\d+$/.test(otp)) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "OTP should contain only numbers.",
      }));
      return;
    }

    const requestData = {
      email: email,
      otp: parseInt(otp, 10), // Convert string OTP to number
    };

    setVerificationAttempted(true);

    try {
      console.log("Submitting verification with data:", requestData);
      const resultAction = await dispatch(verifyEmail(requestData));

      if (verifyEmail.fulfilled.match(resultAction)) {
        // Use SweetAlert2 instead of standard alert
        Swal.fire({
          icon: "success",
          title: "Verification Successful!",
          text: "Your email has been verified successfully.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: "#fff",
          iconColor: "#4CAF50",
        }).then(() => {
          navigate("/login");
        });
      } else if (verifyEmail.rejected.match(resultAction)) {
        console.error("Verification error:", resultAction.payload);
        // Display the specific API error
        if (typeof resultAction.payload === "string") {
          setApiError(resultAction.payload);
        } else if (
          resultAction.payload &&
          typeof resultAction.payload === "object"
        ) {
          // Handle error object format
          setApiError(
            (resultAction as any)?.payload?.error ||
              "Verification failed. Please try again."
          );
        } else {
          setApiError("Verification failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setApiError("An unexpected error occurred. Please try again.");
    }
  };

  // Handle resend OTP functionality
  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setApiError("");

    try {
      const requestData = {
        email: email,
      };

      console.log("Resending OTP with data:", requestData);
      const resultAction = await dispatch(resendOtp(requestData));

      if (resendOtp.fulfilled.match(resultAction)) {
        setResendSuccess(true);
        // Set cooldown period (60 seconds)
        setCooldown(60);

        // Show success message for OTP resend
        Swal.fire({
          icon: "success",
          title: "OTP Resent",
          text: "A new verification code has been sent to your email.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: "#fff",
          iconColor: "#4CAF50",
        });
      } else if (resendOtp.rejected.match(resultAction)) {
        console.error("Resend OTP error:", resultAction.payload);
        // Display the specific API error
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
      console.error("Error during OTP resend:", err);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background and Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${football})` }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Verification Form */}
      <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-md mx-auto mt-12 sm:mt-16 lg:mt-0">
        <h2 className="text-3xl font-bold text-black mb-6">
          Email Verification
        </h2>
        {email && (
          <p className="text-gray-600 mb-4">
            Please enter the verification code sent to <strong>{email}</strong>
          </p>
        )}

        {/* Display server error */}
        {(error || apiError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{apiError || (typeof error === "string" ? error : null)}</p>
            {apiError === "OTP should be number" && (
              <p className="mt-2 text-sm">
                Please enter only numeric digits for the OTP code.
              </p>
            )}
          </div>
        )}

        {/* Display resend success message */}
        {resendSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>OTP has been resent successfully. Please check your email.</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.otp ? "text-red-500" : "text-gray-700"
              }`}
            >
              OTP <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                // Only allow numeric input
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setOtp(value);
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.otp
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              maxLength={6} // Most OTPs are 4-6 digits
              inputMode="numeric" // Shows numeric keyboard on mobile
            />
            {fieldErrors.otp && (
              <p className="text-red-500 text-sm">{fieldErrors.otp}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <div className="flex flex-col space-y-3">
            {/* Resend OTP button */}

            {/* Back to signup option */}
            <div className="">
              <p className="text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || cooldown > 0}
                  className={`w-full py-2 rounded-lg transition duration-300 text-left ${
                    resendLoading || cooldown > 0
                      ? " text-gray-500 cursor-not-allowed"
                      : " text-red-500 hover:underline"
                  }`}
                >
                  {resendLoading
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
