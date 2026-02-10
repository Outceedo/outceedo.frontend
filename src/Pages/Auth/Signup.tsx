import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(
    (state: RootState) => state.auth,
  );

  // Extract referral code from URL
  const referralCode = searchParams.get("ref");

  const [role, setRole] = useState<Role | null>(null);
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
  const [check] = useState("false");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [ageVerify, setAgeVerify] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [manualReferralCode, setManualReferralCode] = useState("");

  useEffect(() => {
    if (error) {
      try {
        if (typeof error === "string" && error.includes("{")) {
          const errorObj = JSON.parse(error);
          setFormError(errorObj.error || "Registration failed");
        } else if (typeof error === "object" && error !== null) {
          setFormError((error as any).error || "Registration failed");
        } else {
          setFormError(error.toString());
        }
      } catch (e) {
        setFormError(String(error));
      }
    }
  }, [error]);

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
    if (storedRole) setRole(storedRole);
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

    if (!role) {
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
    if (password && password.length < 8) errors.password = "Min 8 characters.";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords match error.";
    if (!countryCode) errors.countryCode = "Required.";
    if (!mobileNumber) errors.mobileNumber = "Required.";
    if (!ageVerify) errors.ageVerify = "Confirm age.";
    if (!termsAccepted) errors.termsAccepted = "Accept terms.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Use URL referral code first, otherwise use manual input
    const finalReferralCode = referralCode || manualReferralCode.trim();

    const requestData = {
      role,
      email,
      password,
      mobileNumber: `${countryCode} ${mobileNumber}`,
      firstName,
      lastName,
      username,
      ageVerify,
      ...(finalReferralCode && { referralCode: finalReferralCode }),
    };

    setRegistrationAttempted(true);
    const resultAction = await dispatch(registerUser(requestData));

    if (registerUser.fulfilled.match(resultAction)) {
      localStorage.setItem("verificationEmail", email);
      localStorage.setItem("username", username);
      localStorage.setItem("Profilecomplete", check);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Check email for OTP.",
        timer: 3000,
        showConfirmButton: false,
      }).then(() => navigate("/emailverification"));
    }
  };

  return (
    // 👇 FIX 1: Allow vertical scrolling on the main container
    <div className="relative w-full h-screen overflow-y-auto bg-white scroll-smooth">
      {/* Background Image Layer - Fixed so it doesn't scroll with content */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
      </div>

      {/* Go Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-gray-900 font-bold text-sm hover:bg-white hover:shadow-lg transition-all z-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </motion.button>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16">
        {/* Left Side - Branding (Sticky on Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24 text-center lg:text-left lg:w-1/2 hidden lg:block"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <img src={logo} alt="Outceedo" className="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-gray-900">
              OUTCEEDO
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
            JOIN THE <span className="text-red-500">ELITE.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md">
            An online platform where football players connect with experts to
            get assessed.
          </p>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg mx-auto lg:mx-0 pb-10" // 👇 Added pb-10 for mobile breathing room
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase">
                Sign Up
              </h2>
            </div>

            {/* Role Selector */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Registering as:{" "}
                <span className="text-red-500">{getRoleLabel(role)}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleChange(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      role === option.value
                        ? "bg-red-500 text-white"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  error={fieldErrors.firstName}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  error={fieldErrors.lastName}
                />
              </div>

              <Input
                label="Username"
                value={username}
                onChange={setUsername}
                error={fieldErrors.username}
                helper="Letters, numbers, and underscores only"
              />

              <Input
                label="Email ID"
                type="email"
                value={email}
                onChange={setEmail}
                error={fieldErrors.email}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordInput
                  label="Password"
                  value={password}
                  show={showPassword}
                  toggle={() => setShowPassword(!showPassword)}
                  onChange={setPassword}
                  error={fieldErrors.password}
                />
                <PasswordInput
                  label="Confirm"
                  value={confirmPassword}
                  show={showConfirmPassword}
                  toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  onChange={setConfirmPassword}
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {/* Country & Phone */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Code"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-red-500 outline-none"
                  />
                  {showDropdown && filteredCountries.length > 0 && (
                    <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto z-50">
                      {filteredCountries.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelect(c)}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs font-medium"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                    Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                  Referral Code{" "}
                  <span className="text-gray-400 font-medium normal-case">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter referral code if you have one"
                  value={referralCode || manualReferralCode}
                  onChange={(e) => setManualReferralCode(e.target.value)}
                  disabled={!!referralCode}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-red-500 outline-none transition-all ${
                    referralCode ? "bg-green-50 border-green-300" : ""
                  }`}
                />
                {referralCode && (
                  <p className="text-[10px] text-green-600 mt-1 font-bold">
                    Referral code applied from link
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <Checkbox
                  checked={ageVerify}
                  onChange={setAgeVerify}
                  label="I am 18 years or older"
                  subLabel="(Under 18: Parent or Guardian must sign up)"
                  error={fieldErrors.ageVerify}
                />
                <Checkbox
                  checked={termsAccepted}
                  onChange={setTermsAccepted}
                  error={fieldErrors.termsAccepted}
                  label={
                    <span className="text-gray-700">
                      I agree to Outceedo{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents clicking the link from toggling the checkbox
                          navigate("/terms");
                        }}
                        className="text-red-500 hover:underline font-bold"
                      >
                        Terms and Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/privacy");
                        }}
                        className="text-red-500 hover:underline font-bold"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-bold text-gray-500 uppercase tracking-tighter">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-red-500 hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Sub-Components for Cleanliness ---

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  error,
  helper,
}: any) => (
  <div>
    <label
      className={`block text-xs font-bold mb-1 uppercase ${error ? "text-red-500" : "text-gray-700"}`}
    >
      {label} *
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:border-red-500 outline-none transition-all ${error ? "border-red-500" : "border-gray-200"}`}
    />
    {helper && !error && (
      <p className="text-[10px] text-gray-400 mt-1">{helper}</p>
    )}
    {error && (
      <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>
    )}
  </div>
);

const PasswordInput = ({
  label,
  value,
  show,
  toggle,
  onChange,
  error,
}: any) => (
  <div>
    <label
      className={`block text-xs font-bold mb-1 uppercase ${error ? "text-red-500" : "text-gray-700"}`}
    >
      {label} *
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none ${error ? "border-red-500" : "border-gray-200"}`}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const Checkbox = ({ checked, onChange, label, subLabel, error }: any) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-red-500 mt-1"
    />
    <div className="text-xs font-bold uppercase tracking-tight">
      <span className={error ? "text-red-500" : "text-gray-700"}>{label}</span>
      {subLabel && (
        <span className="block text-[10px] text-gray-400 font-medium normal-case">
          {subLabel}
        </span>
      )}
    </div>
  </label>
);

export default Signup;
