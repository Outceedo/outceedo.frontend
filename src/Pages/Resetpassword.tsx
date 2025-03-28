import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetPassword } from "../store/auth-slice";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token") || ""; // Extract token from URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const dispatch = useAppDispatch();
  const { isLoading, resetPasswordSuccess } = useAppSelector(
    (state) => state.auth
  );

  // Start countdown after successful password reset
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      navigate("/login");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, navigate]);

  // Monitor resetPasswordSuccess state from Redux
  useEffect(() => {
    if (resetPasswordSuccess) {
      setSuccess("Password reset successful! Redirecting to login page...");
      setCountdown(5); // Start 5-second countdown
    }
  }, [resetPasswordSuccess]);

  // Handle password reset
  const handleResetPassword = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        resetPassword({ token, password: newPassword })
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        // Success handling is now in the useEffect that watches resetPasswordSuccess
      } else if (resetPassword.rejected.match(resultAction)) {
        setError(
          resultAction.payload?.error ||
            resultAction.error?.message ||
            "Failed to reset password."
        );
      }
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual navigation to login
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // Check if form is valid
  const isFormValid =
    newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-3xl font-bold text-center font-Raleway mb-4">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center font-Opensans mb-6">
          Set a new password to regain access to your account. Make sure it's
          strong and secure.
        </p>

        {/* Success Message with Countdown */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">{success}</p>
            {countdown !== null && (
              <p className="text-green-500 mt-2">
                Redirecting in {countdown} seconds...
              </p>
            )}
            <button
              onClick={handleLoginRedirect}
              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition duration-300"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {!success && (
          <>
            {/* New Password Input */}
            <div className="mb-4">
              <label className="block text-sm font-Opensans font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE221E]"
                  placeholder="Enter your Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-Opensans font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE221E]"
                  placeholder="Enter your Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                >
                  <i
                    className={
                      showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
              {error && <p className="text-[#FE221E] text-sm mt-2">{error}</p>}
            </div>

            {/* Reset Password Button */}
            <button
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                isFormValid && !loading
                  ? "bg-[#FE221E] text-white hover:bg-red-500"
                  : "bg-red-400 text-white cursor-not-allowed"
              }`}
              onClick={handleResetPassword}
              disabled={!isFormValid || loading || isLoading}
            >
              {loading || isLoading ? "Resetting..." : "Reset Password"}
            </button>

            {/* Back to Login Button */}
            <button
              className="w-full mt-4 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              onClick={handleLoginRedirect}
              type="button"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
