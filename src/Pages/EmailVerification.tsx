import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { verifyEmail } from "../store/auth-slice";
import { RootState } from "../store/store";
import football from "../assets/images/football.jpg";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!otp) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "OTP is required.",
      }));
      return;
    }

    const requestData = {
      email: localStorage.getItem("verificationEmail") || "", // Get email from localStorage
      otp,
    };

    dispatch(verifyEmail(requestData));
  };

  useEffect(() => {
    if (user && !error) {
      alert("Email verification successful! Redirecting to login.");
      navigate("/login");
    }
  }, [user, navigate, error]);

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
        {error && (
          <p className="text-red-500 mb-4">
            {typeof error === "string" ? error : "An error occurred"}
          </p>
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
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.otp
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.otp && (
              <p className="text-red-500 text-sm">{fieldErrors.otp}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
