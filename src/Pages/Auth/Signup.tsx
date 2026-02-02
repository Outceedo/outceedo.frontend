import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import * as countryCodes from "country-codes-list";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser } from "../../store/auth-slice";
import { RootState } from "../../store/store";
import Swal from "sweetalert2";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import logo from "../../assets/images/logosmall.png";
import img from "@/assets/images/Main.png";

type Role = "expert" | "player" | "team" | "sponsor" | "user";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "expert", label: "Expert" },
  { value: "team", label: "Team" },
  { value: "sponsor", label: "Sponsor" },
  { value: "user", label: "Fan" },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const [role, setRole] = useState<Role | null>();
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [ageVerify, setAgeVerify] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
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

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem("selectedRole", newRole);
  };

  const getRoleLabel = (roleValue: Role | null): string => {
    const found = ROLE_OPTIONS.find((r) => r.value === roleValue);
    return found ? found.label : "Select Role";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    if (
      !role ||
      !["expert", "player", "team", "sponsor", "user"].includes(role)
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
      role: role,
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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:w-1/2 hidden lg:block mb-120"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
            JOIN THE <span className="text-red-500">ELITE.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
            An online platform where football players connect with experts to
            get their sports skills and performances assessed.
          </p>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-lg mt-12 lg:mt-0"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-2xl shadow-black/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Sign Up
              </h2>
            </div>

            {/* Role Selector */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Signing up as{" "}
                <span className="font-bold text-gray-900">
                  {getRoleLabel(role)}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      role === option.value
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {fieldErrors.role && (
                <p className="text-red-500 text-xs mt-2">{fieldErrors.role}</p>
              )}
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="font-bold text-red-600">Error</p>
                <p className="text-sm text-red-500">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${fieldErrors.firstName ? "text-red-500" : "text-gray-700"}`}
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.firstName ? "border-red-500" : "border-gray-200"}`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${fieldErrors.lastName ? "text-red-500" : "text-gray-700"}`}
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.lastName ? "border-red-500" : "border-gray-200"}`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${fieldErrors.username ? "text-red-500" : "text-gray-700"}`}
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.username ? "border-red-500" : "border-gray-200"}`}
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.username}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only letters, numbers, and underscores allowed.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${fieldErrors.email ? "text-red-500" : "text-gray-700"}`}
                >
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.email ? "border-red-500" : "border-gray-200"}`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${fieldErrors.password ? "text-red-500" : "text-gray-700"}`}
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all pr-12 ${fieldErrors.password ? "border-red-500" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${fieldErrors.confirmPassword ? "text-red-500" : "text-gray-700"}`}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all pr-12 ${fieldErrors.confirmPassword ? "border-red-500" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 relative">
                  <label
                    className={`block text-sm font-bold mb-2 ${fieldErrors.countryCode ? "text-red-500" : "text-gray-700"}`}
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.countryCode ? "border-red-500" : "border-gray-200"}`}
                  />
                  {showDropdown && filteredCountries.length > 0 && (
                    <ul className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto z-20">
                      {filteredCountries.map((country, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelect(country)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                        >
                          {country}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-span-3">
                  <label
                    className={`block text-sm font-bold mb-2 ${fieldErrors.mobileNumber ? "text-red-500" : "text-gray-700"}`}
                  >
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${fieldErrors.mobileNumber ? "border-red-500" : "border-gray-200"}`}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageVerify}
                    onChange={(e) => setAgeVerify(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 mt-0.5"
                  />
                  <span
                    className={`text-sm font-medium ${fieldErrors.ageVerify ? "text-red-500" : "text-gray-700"}`}
                  >
                    I am 18 years old or older.{" "}
                    <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      (Under 18 years: Parent/Legal Guardian must Sign up)
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 mt-0.5"
                  />
                  <span
                    className={`text-sm font-medium ${fieldErrors.termsAccepted ? "text-red-500" : "text-gray-700"}`}
                  >
                    I agree to Outceedo{" "}
                    <a
                      href="/terms"
                      className="text-red-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms and Conditions
                    </a>
                    ,{" "}
                    <a
                      href="/privacy"
                      className="text-red-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-red-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Use
                    </a>
                    . <span className="text-red-500">*</span>
                  </span>
                </label>
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
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-600 font-medium">
                Already Registered?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-red-500 font-bold hover:text-red-600 transition-colors"
                  type="button"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
