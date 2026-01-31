import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  UserCheck,
  Trophy,
  Handshake,
  Heart,
  ArrowRight,
} from "lucide-react";

const options = [
  {
    name: "Players",
    icon: Users,
    role: "player",
    desc: "Build your profile",
    color: "bg-blue-500",
  },
  {
    name: "Experts",
    icon: UserCheck,
    role: "expert",
    desc: "Share expertise",
    color: "bg-green-500",
  },
  {
    name: "Teams",
    icon: Trophy,
    role: "team",
    desc: "Scout talent",
    color: "bg-orange-500",
  },
  {
    name: "Sponsors",
    icon: Handshake,
    role: "sponsor",
    desc: "Find ambassadors",
    color: "bg-purple-500",
  },
  {
    name: "Fans",
    icon: Heart,
    role: "user",
    desc: "Follow stars",
    color: "bg-pink-500",
  },
];

const User: React.FC = () => {
  const navigate = useNavigate();

  const handleUserSelection = (role: string) => {
    const lowerCaseRole = role.toLowerCase();
    localStorage.setItem("selectedRole", lowerCaseRole);
    navigate("/signup");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-4xl w-full border border-gray-100"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-3 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.2em] uppercase text-[10px]">
          <span className="h-[2px] w-6 bg-red-500"></span>
          Join The Network
          <span className="h-[2px] w-6 bg-red-500"></span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 uppercase">
          Sign Up to <span className="text-red-500">Outceedo</span>
        </h2>
        <p className="mt-2 text-gray-500 font-medium text-sm">
          Select your profile type to get started
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUserSelection(option.role)}
            className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-red-500 hover:shadow-xl transition-all duration-300"
          >
            {/* Icon */}
            <div
              className={`h-14 w-14 rounded-2xl ${option.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <option.icon size={28} />
            </div>

            {/* Name */}
            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-1">
              {option.name}
            </h3>

            {/* Description */}
            <p className="text-[10px] text-gray-400 font-medium hidden md:block">
              {option.desc}
            </p>

            {/* Arrow indicator on hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={14} className="text-red-500" />
            </div>

            {/* Red accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            Log In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default User;
