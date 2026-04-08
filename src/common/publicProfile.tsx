import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  Award,
  Briefcase,
  User,
  Globe,
  Languages,
  ArrowLeft,
  Lock,
  Play,
  Video,
  Target,
  Dumbbell,
} from "lucide-react";
import Navbar from "../Pages/Home/Navbar";
import axios from "axios";

interface ServiceAdditionalDetails {
  duration?: string;
  description?: string;
}

interface Service {
  id: string;
  expertId: string;
  serviceId: string;
  price: number;
  additionalDetails?: ServiceAdditionalDetails | null;
  createdAt: string;
  updatedAt: string;
}

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  mobile_number?: string;
  photo?: string;
  age?: number;
  gender?: string;
  birthYear?: number;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
  certificationLevel?: string;
  company?: string;
  companyLink?: string;
  sport?: string;
  language?: string[];
  skills?: string[];
  interests?: string[];
  club?: string;
  height?: number;
  weight?: number;
  responseTime?: string;
  travelLimit?: string;
  services?: Service[];
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  referralCode?: string;
}

const SERVICE_NAMES: Record<string, { name: string; icon: React.ReactNode }> = {
  "1": { name: "Recorded Video Assessment", icon: <Play size={20} /> },
  "2": { name: "Online Training", icon: <Video size={20} /> },
  "3": { name: "On Ground Assessment", icon: <Target size={20} /> },
};

const getServiceInfo = (serviceId: string) => {
  return (
    SERVICE_NAMES[serviceId] || {
      name: "On Ground Training",
      icon: <Dumbbell size={20} />,
    }
  );
};

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError("No username provided");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PORT}/api/v1/user/profile/${username}`,
        );
        setExpert(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-500 mb-8">{error || "User does not exist"}</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-red-500 font-black uppercase text-sm tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${expert.firstName} ${expert.lastName}`;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 right-10 p-12 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[130px] md:text-[200px] font-black italic tracking-tighter leading-none text-white">
            PROFILE
          </span>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group overflow-hidden rounded-[2.5rem] bg-gray-800 w-64 h-64 md:w-80 md:h-80 shadow-2xl flex-shrink-0"
            >
              {expert.photo ? (
                <img
                  src={expert.photo}
                  alt={fullName}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                  <User size={100} className="text-gray-600" />
                </div>
              )}
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
              >
                <span className="h-[2px] w-12 bg-red-500"></span>
                {expert.profession || "Expert"}
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic mb-4">
                {fullName}
              </h1>

              {expert.club && (
                <p className="text-xl text-gray-400 font-medium mb-6">
                  {expert.club}
                </p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                {expert.certificationLevel && (
                  <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm flex items-center gap-2">
                    <Award size={16} /> {expert.certificationLevel}
                  </div>
                )}
                {expert.country && (
                  <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-sm flex items-center gap-2">
                    <MapPin size={16} /> {expert.city ? `${expert.city}, ` : ""}
                    {expert.country}
                  </div>
                )}
                {expert.sport && (
                  <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-sm flex items-center gap-2">
                    <Briefcase size={16} /> {expert.sport}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      {expert.bio && (
        <section className="relative bg-white py-20 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl"
            >
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic mb-6">
                About
              </h2>
              <div className="relative">
                <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-red-500 pl-6 whitespace-pre-line line-clamp-4">
                  {expert.bio}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 ml-6 flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm uppercase tracking-widest transition-colors"
              >
                <Lock size={14} /> Read More
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {expert.services && expert.services.length > 0 && (
        <section className="relative bg-gray-50 py-20 overflow-hidden">
          <div className="absolute top-0 left-10 p-12 opacity-[0.03] pointer-events-none select-none">
            <span className="text-[80px] md:text-[150px] font-black italic tracking-tighter leading-none">
              SERVICES
            </span>
          </div>

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs">
                <span className="h-[2px] w-12 bg-red-500"></span>
                Available Services
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 uppercase italic">
                Book <span className="text-red-500">Sessions</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expert.services.map((service, index) => {
                const serviceInfo = getServiceInfo(service.serviceId);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
                  >
                    <div className="h-14 w-14 rounded-xl bg-gray-800 flex items-center justify-center text-white mb-6">
                      {serviceInfo.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      {serviceInfo.name}
                    </h3>
                    {service.additionalDetails && (
                      <div className="text-gray-500 text-sm mb-4">
                        {service.additionalDetails.duration && (
                          <p>Duration: {service.additionalDetails.duration}</p>
                        )}
                        {service.additionalDetails.description && (
                          <p>{service.additionalDetails.description}</p>
                        )}
                      </div>
                    )}
                    <div className="flex items-end justify-between mt-6 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                          Price
                        </p>
                        <p className="text-3xl font-black text-gray-300 select-none">
                          $***
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                      >
                        {/* <Lock size={18} /> */}
                        Book Now
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick Info Section - Visible */}
      <section className="relative bg-white py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Languages */}
            {expert.language && expert.language.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-[2rem] p-8"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white mb-4">
                  <Languages size={24} />
                </div>
                <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {expert.language.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white text-gray-700 font-medium text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sport */}
            {expert.sport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-[2rem] p-8"
              >
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-4">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">
                  Sport
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {expert.sport}
                </p>
              </motion.div>
            )}

            {/* Response Time */}
            {expert.responseTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 rounded-[2rem] p-8"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white mb-4">
                  <Globe size={24} />
                </div>
                <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">
                  Response Time
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {expert.responseTime} mins
                </p>
              </motion.div>
            )}

            {/* Travel Limit */}
            {expert.travelLimit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-[2rem] p-8"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">
                  Travel Limit
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {expert.travelLimit} km
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Locked Content Section */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-800 border-2 border-gray-700 mb-8"
            >
              <Lock size={32} className="text-gray-500" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-4">
              Want to see more?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Unlock full profile details including contact information,
              complete skills & interests, documents, social links, and direct
              messaging with {expert.firstName}.
            </p>

            {/* Preview of locked content */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
              {[
                "Contact Info",
                "Full Bio",
                "Documents",
                "Social Links",
                "Skills",
                "Message Expert",
                "Reviews",
                "Certifications",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Lock size={12} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
            >
              Login to Unlock
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
