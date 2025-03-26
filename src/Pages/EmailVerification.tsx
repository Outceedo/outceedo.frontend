import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerification: React.FC = () => {
    const navigate = useNavigate();
  //const email = location.state?.email || ""; // Get email from navigation state
  const [email] = useState(localStorage.getItem("verificationEmail") || "");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0); // OTP resend timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);


  // Handle OTP Input
  const handleChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input field
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  // Handle OTP Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join(""); // Convert OTP array to string
    if (enteredOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      console.log("email",email);
      const response = await axios.patch("http://localhost:8000/api/v1/auth/verify-email", {
        email, //  Send email instead of token
        otp: (Number(enteredOtp)),
      });

      if (response.status === 200) {
        setSuccess(true);
        localStorage.removeItem("verificationEmail");

        setTimeout(() => navigate("/login"), 3000); // Redirect to login after success
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed.");
    }
  };


  // Resend OTP Handler
  const handleResendOtp = async () => {
    setError("");
    setTimer(0); // Reset timer
    try {
      await axios.post("http://localhost:8000/api/v1/auth/resend-otp", { email });
      alert("New OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-lg w-auto text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-2 font-Raleway">Verify Your Code  </h2>
      <p className="text-gray-500 mb-4 font-Opensans">Enter your passcode below</p>
      {success ? (
        <p className="text-green-500 font-Opensans">OTP Verified Successfully!</p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, e.target.value)
                  }
                  className="w-12 h-12 text-center text-xl border bg-red-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              ))}
            </div>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-red-400 transition font-Opensans"
            >
              Verify
            </button>
          </form>

          <p className="text-gray-500 mt-4 font-Opensans">
            Didn’t receive the code?{" "}
            <span
              className={`text-blue-800 font-medium text-sm cursor-pointer font-Opensans ${
                timer > 0 ? "cursor-not-allowed opacity-50" : "hover:underline"
              }`}
              onClick={timer === 0 ? handleResendOtp : undefined}
            >
              {timer > 0 ? `Resend OTP code in ${timer}s` : "Resend OTP code"}
            </span>
          </p>
        </>
      )}
    </div>
  </div>
);
};
export default EmailVerification;
