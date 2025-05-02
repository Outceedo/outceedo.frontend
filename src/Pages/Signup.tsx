import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import football from "../assets/images/football.jpg";
import * as countryCodes from "country-codes-list";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser } from "../store/auth-slice";
import { RootState } from "../store/store";

type Role = "expert" | "player" | "team" | "sponser" | "fan";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(
    (state: RootState) => state.auth
  );

  const [, setRole] = useState<Role | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registrationAttempted, setRegistrationAttempted] = useState(false);
  const [usernameGenerated, setUsernameGenerated] = useState(false);
  const [check, setcheck] = useState("false");

  // Add debug logging for Redux state changes
  useEffect(() => {
    console.log("Auth state changed:", {
      user,
      isLoading,
      error,
      registrationAttempted,
    });

    // Update formError when error state changes
    if (error) {
      try {
        // Check if error is a JSON string
        if (typeof error === "string" && error.includes("{")) {
          const errorObj = JSON.parse(error);
          setFormError(errorObj.error || "Registration failed");
        } else if (typeof error === "object" && error !== null) {
          // If error is already an object
          setFormError(error.error || "Registration failed");
        } else {
          // If error is a simple string
          setFormError(error.toString());
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setFormError(String(error));
      }
    }
  }, [user, isLoading, error, registrationAttempted]);

  useEffect(() => {
    try {
      const myCountryCodesObject = countryCodes.customList(
        "countryCode",
        "+{countryCallingCode} ({countryNameEn})"
      );
      setCountryList(Object.values(myCountryCodesObject));
    } catch (err) {
      console.error("Error loading country codes:", err);
      // Fallback to some common country codes
      setCountryList([
        "+1 (United States)",
        "+44 (United Kingdom)",
        "+91 (India)",
        "+61 (Australia)",
        "+86 (China)",
        "+33 (France)",
        "+49 (Germany)",
      ]);
    }
  }, []);

  // Generate a username suggestion when first and last name change
  useEffect(() => {
    if (firstName && lastName && !usernameGenerated) {
      const generatedUsername =
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(
          /\s+/g,
          ""
        );
      setUsername(generatedUsername);
    }
  }, [firstName, lastName, usernameGenerated]);

  const filteredCountries = countryList.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: string) => {
    const code = country.split(" ")[0];
    setCountryCode(code);
    setSearchTerm(country);
    setShowDropdown(false);
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("selectedRole") as Role | null;
    console.log("Role from localStorage:", storedRole); // Debugging role
    setRole(storedRole);
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameGenerated(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null); // Clear any existing errors

    const selectedRole = localStorage.getItem("selectedRole") as Role | null;
    if (
      !selectedRole ||
      !["expert", "player", "team", "sponser", "fan"].includes(selectedRole)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        role: "Role selection is required.",
      }));
      return;
    }

    let errors: Record<string, string> = {};

    if (!firstName) errors.firstName = "First name is required.";
    if (!lastName) errors.lastName = "Last name is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    if (!confirmPassword)
      errors.confirmPassword = "Confirm Password is required.";
    if (!countryCode) errors.countryCode = "Country code is required.";
    if (!mobileNumber) errors.mobileNumber = "Mobile number is required.";

    // Username validation - allow letters, numbers, underscores only
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores.";
    }

    if (password && password.length < 8)
      errors.password = "Password must be at least 8 characters long.";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const requestData = {
      role: selectedRole,
      email,
      password,
      mobileNumber: `${countryCode} ${mobileNumber}`,
      firstName,
      lastName,
      username, // Add the username field to the request
    };

    console.log("Submitting registration with data:", requestData);

    // Set registration attempted flag to true
    setRegistrationAttempted(true);

    try {
      // Dispatch the register action and wait for it to complete
      const resultAction = await dispatch(registerUser(requestData));

      if (registerUser.fulfilled.match(resultAction)) {
        // Handle the success case directly
        console.log("Registration successful:", resultAction.payload);
        localStorage.setItem("verificationEmail", email);
        localStorage.setItem("username", username); // Store username in localStorage
        alert("Signup successful! Redirecting to email verification.");
        navigate("/emailverification");
      } else if (registerUser.rejected.match(resultAction)) {
        console.error("Registration failed:", resultAction.error);

        // Handle error payload
        const errorPayload = resultAction.payload;
        if (errorPayload) {
          try {
            // Try to parse the error if it's a string with JSON content
            if (
              typeof errorPayload === "string" &&
              errorPayload.includes("{")
            ) {
              const parsedError = JSON.parse(errorPayload);
              setFormError(parsedError.error || "Registration failed");
            } else if (
              typeof errorPayload === "object" &&
              errorPayload !== null
            ) {
              // If payload is already an object
              setFormError(errorPayload.error || "Registration failed");
            } else {
              setFormError(String(errorPayload));
            }
          } catch (e) {
            console.error("Error parsing error payload:", e);
            setFormError(String(errorPayload));
          }
        } else {
          // Handle error from action.error
          const errorMessage =
            resultAction.error?.message || "Registration failed";
          setFormError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setFormError("An unexpected error occurred. Please try again later.");
    }
  };

  // This is our backup effect in case the direct approach above doesn't catch the success
  useEffect(() => {
    if (registrationAttempted && !isLoading && user && !error) {
      console.log(
        "Registration successful via effect, redirecting to email verification"
      );

      localStorage.setItem("verificationEmail", email);
      localStorage.setItem("username", username); // Store username in localStorage
      localStorage.setItem("Profilecomplete", check);
      navigate("/emailverification");
    }
  }, [
    registrationAttempted,
    isLoading,
    user,
    error,
    navigate,
    email,
    username,
  ]);

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${football})` }}
      ></div>
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-40"></div>
      {/* Left Side - Welcome Text */}
      <div className="relative text-center lg:text-left text-white z-10 lg:w-1/2 px-6 lg:px-0 mb-8 sm:mb-12 hidden md:block">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-Raleway mb-4">
          Welcome To Sports App
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-Opensans">
          Find expert coaches and mentors to guide students in mastering their
          game. Connect with top professionals for personalized training, skill
          development, and strategic insights to elevate performance.
        </p>
      </div>
      {/* Right Side - Signup Form */}
      <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-lg mx-auto lg:w-[500px] mt-12 sm:mt-16 lg:mt-0">
        <h2 className="text-3xl font-bold text-black mb-6">Sign Up</h2>

        {/* Error Message */}
        {formError && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded border border-red-300">
            <p className="font-medium">Error</p>
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                className={`block text-sm font-medium ${
                  fieldErrors.firstName ? "text-red-500" : "text-gray-700"
                }`}
              >
                First Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  fieldErrors.firstName
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.firstName && (
                <p className="text-red-500 text-sm">{fieldErrors.firstName}</p>
              )}
            </div>

            <div className="w-1/2">
              <label
                className={`block text-sm font-medium ${
                  fieldErrors.lastName ? "text-red-500" : "text-gray-700"
                }`}
              >
                Last Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  fieldErrors.lastName
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.lastName && (
                <p className="text-red-500 text-sm">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.username ? "text-red-500" : "text-gray-700"
              }`}
            >
              Username <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.username
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm">{fieldErrors.username}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Only letters, numbers, and underscores allowed. No spaces.
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.email ? "text-red-500" : "text-gray-700"
              }`}
            >
              Email ID <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.email
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.password ? "text-red-500" : "text-gray-700"
              }`}
            >
              New Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.password
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                fieldErrors.confirmPassword ? "text-red-500" : "text-gray-700"
              }`}
            >
              Confirm Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.confirmPassword
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <div className="w-1/3 relative">
              <label
                className={`block text-sm font-medium ${
                  fieldErrors.countryCode ? "text-red-500" : "text-gray-700"
                }`}
              >
                Country Code <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Search country code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  fieldErrors.countryCode
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {showDropdown && filteredCountries.length > 0 && (
                <ul className="absolute w-full bg-white border rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
                  {filteredCountries.map((country, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelect(country)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      {country}
                    </li>
                  ))}
                </ul>
              )}
              {fieldErrors.countryCode && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.countryCode}
                </p>
              )}
            </div>

            <div className="w-2/3">
              <label
                className={`block text-sm font-medium ${
                  fieldErrors.mobileNumber ? "text-red-500" : "text-gray-700"
                }`}
              >
                Mobile Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  fieldErrors.mobileNumber
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                maxLength={10}
                pattern="[0-9]{10}"
              />
              {fieldErrors.mobileNumber && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.mobileNumber}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" required />
              <span className="text-black-700">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  Terms and Conditions
                </a>
              </span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
          <p className="text-gray-600">
            Already Registered?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#FA6357] hover:underline cursor-pointer"
              type="button"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
