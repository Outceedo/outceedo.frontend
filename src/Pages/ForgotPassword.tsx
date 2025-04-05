import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { forgotPassword } from "../store/auth-slice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, forgotPasswordError, emailSent } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  //  Email Validation
  const validateEmail = (email: string): boolean => {
    const emailPattern: RegExp =
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  // Handle API Call
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    dispatch(forgotPassword({ email }));
  };

  // Handle Email Input
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-96">
        {emailSent ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2 font-Raleway">
              Check Your Email
            </h2>
            <p className="text-green-600 mb-4 font-Opensans">
              A password reset link has been sent to your email. Please check
              your inbox.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-Raleway">
              Forgot Password
            </h2>
            <p className="text-gray-600 mb-4 font-Opensans">
              Enter your email ID to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-Opensans mb-2">
                  Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm mb-4">
                  <p>{error}</p>
                </div>
              )}
              {forgotPasswordError && (
                <div className="text-red-600 text-sm mb-4">
                  <p>{forgotPasswordError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-red-400 transition font-Raleway"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        )}

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-Raleway"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
