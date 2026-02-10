import { useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  Star,
  Users,
  Trophy,
  X,
  File,
  Fan,
  UserSearchIcon,
} from "lucide-react";
import img from "@/assets/images/Main.png";
import logo from "@/assets/images/logosmall.png";
import User from "./user";

interface FloatingExpertCardProps {
  delay: number;
  icon: React.ElementType;
  title: string;
  sub?: string;
  color: string;
}

const FloatingExpertCard = ({
  delay,
  icon: Icon,
  title,
  sub,
  color,
}: FloatingExpertCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.8, ease: "easeOut" }}
    className="hidden lg:flex absolute z-30 bg-white/80 backdrop-blur-xl border border-slate-200 p-3 rounded-2xl shadow-xl items-center gap-4 group hover:bg-white transition-colors cursor-pointer"
    style={{
      boxShadow: `0 20px 40px -10px rgba(0,0,0,0.1)`,
    }}
  >
    <div
      className={`w-18 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}
    >
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-900 font-bold text-sm leading-tight">{title}</p>
      {sub && <p className="text-slate-500 text-xs font-medium">{sub}</p>}
    </div>
  </motion.div>
);

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleVideo = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSignUpClick = () => setModalOpen(true);

  return (
    <section
      id="home"
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src={img}
          alt="Hero background"
        />

        {/* White overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-multiply" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 max-w-7xl mx-auto h-full pointer-events-none">
        <div className="relative w-full h-full">
          <div className="hidden lg:block absolute top-[25%] left-[5%]">
            <FloatingExpertCard
              delay={1.2}
              icon={Trophy}
              title="Elite Scouts"
              color="bg-red-500"
            />
          </div>

          <div className="hidden lg:block absolute bottom-[45%] -left-[10%]">
            <FloatingExpertCard
              delay={1.5}
              icon={UserSearchIcon}
              title="Worldwide Followers"
              // sub="4.9/5 Average Score"
              color="bg-orange-500"
            />
          </div>

          <div className="hidden lg:block absolute bottom-[20%] left-[8%]">
            <FloatingExpertCard
              delay={1.5}
              icon={Star}
              title="Worldwide Sponsors"
              // sub="4.9/5 Average Score"
              color="bg-orange-500"
            />
          </div>

          <div className="hidden lg:block absolute top-[35%] right-[15%]">
            <FloatingExpertCard
              delay={1.8}
              icon={Users}
              title="Pro Coaches"
              color="bg-blue-500"
            />
          </div>
          <div className="hidden lg:block absolute top-[65%] right-[20%]">
            <FloatingExpertCard
              delay={1.8}
              icon={File}
              title="Player Performance Assessment"
              color="bg-red-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layer */}
      <div className="relative z-20 container mx-auto px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold tracking-widest text-slate-800 backdrop-blur-md uppercase shadow-sm">
              <span className="relative flex h-6 w-6">
                <span>
                  <img src={logo} alt="" />
                </span>
              </span>
              Outdo your sport to Succeed
            </div>
            {/* Headline */}
            <h1 className="mb-8 text-6xl font-black tracking-tight text-slate-900 sm:text-8xl lg:text-[100px] leading-[0.9] lg:leading-[0.9]">
              ELITE ACCESS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-slate-800 to-red-500 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                FOR THE PROS.
              </span>
            </h1>
            {/* Description */}
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-800 font-medium leading-relaxed px-4">
              {`The premier ecosystem connecting rising football stars with`}
            </p>
            <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-slate-800 font-medium leading-relaxed px-4">
              {" "}
              world-class coaches, scouts, and performance experts.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <button
                onClick={handleSignUpClick}
                className="group relative w-full sm:w-auto h-16 px-10 bg-red-500 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-500/20"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 text-white font-bold text-lg">
                  Book an Assessment
                </span>
              </button>

              <button
                onClick={toggleVideo}
                className="group w-full sm:w-auto h-16 px-10 border border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-center gap-3 text-slate-900 font-bold text-lg hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  {isPlaying ? (
                    <Pause size={16} fill="white" className="text-white" />
                  ) : (
                    <Play
                      size={16}
                      fill="white"
                      className="ml-0.5 text-white"
                    />
                  )}
                </div>
                {isPlaying ? "Pause Demo" : "Watch Story"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Signup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-lg z-10"
            >
              <X size={18} />
            </button>
            <User />
          </div>
        </div>
      )}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
