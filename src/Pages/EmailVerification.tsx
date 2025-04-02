import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { verifyEmail } from "../store/auth-slice";
import { RootState } from "../store/store";
import football from "../assets/images/football.jpg";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [, setVerificationAttempted] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");

  // Get email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail");
    if (!storedEmail) {
      alert("No email found for verification. Please sign up first.");
      navigate("/signup");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

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
        alert("Email verification successful! Redirecting to login.");
        navigate("/login");
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
          setApiError((resultAction as any)?.payload?.error || "Verification failed. Please try again.");
                 } else {
          setApiError("Verification failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setApiError("An unexpected error occurred. Please try again.");
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
            <p>
              {apiError ||
                (typeof error === "string" ? error : "An error occurred")}
            </p>
            {apiError === "OTP should be number" && (
              <p className="mt-2 text-sm">
                Please enter only numeric digits for the OTP code.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.otp ? "text-red-500" : "text-gray-700"
              }`}            >
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
            disabled={isLoading}          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-[#FA6357] hover:underline cursor-pointer"
                onClick={() => {
                  navigate("/signup");
                }} >
                Go back to signup
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
