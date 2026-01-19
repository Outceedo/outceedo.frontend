import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import football from "../../assets/images/football.jpg";
import * as countryCodes from "country-codes-list";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser } from "../../store/auth-slice";
import { RootState } from "../../store/store";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/images/outceedologo.png";

type Role = "expert" | "player" | "team" | "sponser" | "user";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(
    (state: RootState) => state.auth,
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

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Checkbox states
  const [ageVerify, setAgeVerify] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    // Debug for Redux state changes
    if (error) {
      try {
        if (typeof error === "string" && error.includes("{")) {
          const errorObj = JSON.parse(error);
          setFormError(errorObj.error || "Registration failed");
        } else if (typeof error === "object" && error !== null) {
          setFormError(error.error || "Registration failed");
        } else {
          setFormError(error.toString());
        }
      } catch (e) {
        setFormError(String(error));
      }
    }
  }, [user, isLoading, error, registrationAttempted]);

  useEffect(() => {
    try {
      const myCountryCodesObject = countryCodes.customList(
        "countryCode",
        "+{countryCallingCode} ({countryNameEn})",
      );
      setCountryList(Object.values(myCountryCodesObject));
    } catch (err) {
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
          "",
        );
      setUsername(generatedUsername);
    }
  }, [firstName, lastName, usernameGenerated]);

  const filteredCountries = countryList.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (country: string) => {
    const code = country.split(" ")[0];
    setCountryCode(code);
    setSearchTerm(country);
    setShowDropdown(false);
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("selectedRole") as Role | null;
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
      !["expert", "player", "team", "sponsor", "user"].includes(selectedRole)
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
    if (!ageVerify)
      errors.ageVerify = "You must confirm that you are 18 years or older.";
    if (!termsAccepted)
      errors.termsAccepted = "You must agree to the Terms and Conditions.";

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
      username,
      ageVerify,
    };

    setRegistrationAttempted(true);

    try {
      const resultAction = await dispatch(registerUser(requestData));
      if (registerUser.fulfilled.match(resultAction)) {
        localStorage.setItem("verificationEmail", email);
        localStorage.setItem("username", username);
        localStorage.setItem("Profilecomplete", check);
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Please check your email for verification.",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/emailverification");
        });
      } else if (registerUser.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;
        if (errorPayload) {
          try {
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
              setFormError(errorPayload.error || "Registration failed");
            } else {
              setFormError(String(errorPayload));
            }
          } catch (e) {
            setFormError(String(errorPayload));
          }
        } else {
          const errorMessage =
            resultAction.error?.message || "Registration failed";
          setFormError(errorMessage);
        }
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (registrationAttempted && !isLoading && user && !error) {
      localStorage.setItem("verificationEmail", email);
      localStorage.setItem("username", username);
      localStorage.setItem("Profilecomplete", check);
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Please check your email for verification.",
        timer: 3000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/emailverification");
      });
    }
  }, [
    registrationAttempted,
    isLoading,
    user,
    error,
    navigate,
    email,
    username,
    check,
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
      <div className="absolute inset-0 bg-black opacity-20"></div>
      {/* Left Side - Welcome Text */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-transparent bg-opacity-80 rounded hover:bg-opacity-100 hover:text-red-500 font-medium text-white shadow transition z-30 mb-12"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back
      </button>
      <div className="relative text-center lg:text-left text-white z-10 lg:w-1/2 px-6 lg:px-0 md:mb-8 mt-12 md:mt-2  ">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-Raleway mb-4">
          {/* Welcome To <span className="text-red-500 font-bold">Outceedo</span> */}
          <img src={logo} alt="logo" className="w-96" />
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-Opensans hidden md:block">
          An online platform where football players connect with experts to get
          their sports skills and performances assessed.
        </p>
      </div>
      {/* Right Side - Signup Form */}
      <div className="relative bg-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl z-10 w-full max-w-lg mx-auto lg:w-[500px] mt-16 sm:mt-8 lg:mt-0">
        <h2 className="text-3xl font-bold text-black mb-6">Sign Up</h2>

        {/* Error Message */}
        {formError && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded border border-red-300">
            <p className="font-medium">Error</p>
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3 md:space-y-4">
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

          {/* Password field with eye icon */}
          <div className="relative">
            <label
              className={`block text-sm font-medium ${
                fieldErrors.password ? "text-red-500" : "text-gray-700"
              }`}
            >
              New Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.password
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } pr-10`}
            />
            <span
              className="absolute right-3 top-10 transform -translate-y-1/2 cursor-pointer text-xl text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {fieldErrors.password && (
              <p className="text-red-500 text-sm">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm password field with eye icon */}
          <div className="relative">
            <label
              className={`block text-sm font-medium ${
                fieldErrors.confirmPassword ? "text-red-500" : "text-gray-700"
              }`}
            >
              Confirm Password <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                fieldErrors.confirmPassword
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } pr-10`}
            />
            <span
              className="absolute right-3 top-10 transform -translate-y-1/2 cursor-pointer text-xl text-gray-500"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2 relative">
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
              />
              {fieldErrors.mobileNumber && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.mobileNumber}
                </p>
              )}
            </div>
          </div>
          {/* Age Verification Checkbox */}
          <div className="mb-2">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mr-2 mt-1"
                checked={ageVerify}
                onChange={(e) => setAgeVerify(e.target.checked)}
              />
              <span
                className={`text-sm ${fieldErrors.ageVerify ? "text-red-500" : "text-gray-700"}`}
              >
                I am 18 years old or older.{" "}
                <span className="text-red-500">*</span>
                <br />
                <span className="text-xs text-gray-500">
                  (Under 18 years: Parent/Legal Guardian must Sign up, Access
                  and Maintain the user account)
                </span>
              </span>
            </label>
            {fieldErrors.ageVerify && (
              <p className="text-red-500 text-sm ml-5">
                {fieldErrors.ageVerify}
              </p>
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="mb-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mr-2 mt-1"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span
                className={`text-sm ${fieldErrors.termsAccepted ? "text-red-500" : "text-gray-700"}`}
              >
                I have read, understand and agree to Outceedo{" "}
                <a
                  href="/terms"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>
                , ,{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cookie Use
                </a>
                . <span className="text-red-500">*</span>
              </span>
            </label>
            {fieldErrors.termsAccepted && (
              <p className="text-red-500 text-sm ml-5">
                {fieldErrors.termsAccepted}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-4/5 bg-[#FE221E] text-white py-2 rounded-lg hover:bg-[#C91C1A] transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>

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
