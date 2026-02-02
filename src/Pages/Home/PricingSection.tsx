import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Zap, ShieldCheck, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = {
  free: [
    { text: "Limited Use", included: true },
    { text: "2 Photos & 2 Videos Storage", included: true },
    { text: "Reports Access (7 Days)", included: true },
    { text: "Local Experts Search", included: true },
    { text: "Recorded Video Assessment Bookings", included: true },
    { text: "Video Conference Recordings (7 Days)", included: true },
    { text: "Reports Download & Share", included: false },
    { text: "Building Fans/Followers", included: false },
    { text: "Promotions & Sponsorship Applications", included: false },
    { text: "AI Features (Coming Soon)", included: false },
  ],
  premium: [
    { text: "Unlimited Use", included: true },
    { text: "10 Photos & 5 Videos Storage", included: true },
    { text: "Unlimited Reports Access", included: true },
    { text: "Worldwide Experts Search", included: true },
    { text: "All Expert Services & Bookings", included: true },
    { text: "Unlimited Video Conference Recordings", included: true },
    { text: "Reports Download & Share", included: true },
    { text: "Building Fans/Followers", included: true },
    { text: "Promotions & Sponsorship Applications", included: true },
    { text: "AI Features (Coming Soon)", included: true },
  ],
};

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative bg-white py-32 overflow-hidden">
      {/* Tactical Background elements */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#ef4444_1px,_transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
          >
            <span className="h-[2px] w-8 bg-red-500"></span>
            SPlayer Subscriptions
            <span className="h-[2px] w-8 bg-red-500"></span>
          </motion.div>
          <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
            CHOOSE YOUR <span className="text-red-500">LEVEL.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto font-medium">
            Start your journey for free or unlock the full tactical ecosystem to
            accelerate your professional career.
          </p>
        </div>

        {/* Tactical Toggle Switch */}
        <div className="flex items-center justify-center gap-6 mb-20">
          <span
            className={`text-sm font-black uppercase tracking-widest transition-colors ${!isAnnual ? "text-gray-900" : "text-gray-400"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-10 w-20 rounded-full bg-gray-100 p-1 border-2 border-gray-100 transition-all hover:border-red-200"
          >
            <motion.div
              className="h-full aspect-square rounded-full bg-red-500 shadow-lg shadow-red-500/40"
              animate={{ x: isAnnual ? 40 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </button>
          <div className="flex flex-col items-start leading-none">
            <span
              className={`text-sm font-black uppercase tracking-widest transition-colors ${isAnnual ? "text-gray-900" : "text-gray-400"}`}
            >
              Annually
            </span>
            <span className="text-[10px] font-black text-red-500 mt-1">
              SAVE 17%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* --- BASIC PLAN (STANDARD) --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group relative flex flex-col rounded-[2.5rem] border-2 border-gray-100 bg-white p-10 transition-all duration-500 hover:border-gray-200 hover:shadow-2xl"
          >
            <div className="mb-10 flex justify-between items-start">
              <div>
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:text-red-500 transition-colors">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                  Basic
                </h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
                  Get Started Free
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end">
                  <span className="text-5xl font-black tracking-tighter text-gray-900">
                    £0
                  </span>
                  <span className="text-sm font-bold text-gray-400 ml-1 italic">
                    /mo
                  </span>
                </div>
                <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-widest">
                  Free Forever
                </p>
              </div>
            </div>

            <ul className="mb-12 space-y-5 flex-1">
              {features.free.map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center ${feat.included ? "bg-gray-100 text-gray-900" : "text-gray-200"}`}
                  >
                    {feat.included ? (
                      <Check size={12} strokeWidth={4} />
                    ) : (
                      <X size={12} strokeWidth={4} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold tracking-tight ${feat.included ? "text-gray-600" : "text-gray-300 line-through"}`}
                  >
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/signup")}
              className="w-full h-16 rounded-2xl border-2 border-black bg-transparent text-black font-black uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* --- PRO PLAN (ELITE) --- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group relative flex flex-col rounded-[2.5rem] bg-white border-2 border-red-500 p-10 overflow-hidden transition-all duration-500 shadow-2xl shadow-red-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] rounded-full" />

            <div className="absolute top-2 right-8 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-500/20">
              <Crown size={12} /> Best Value
            </div>

            <div className="relative z-10 mb-10 flex justify-between items-start">
              <div>
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-red-500/30">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                  Premium
                </h3>
                <p className="text-red-500 font-black text-xs uppercase tracking-widest mt-1">
                  Unlock Everything
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end">
                  <span className="text-5xl font-black tracking-tighter text-gray-900">
                    £{isAnnual ? "100" : "10"}
                  </span>
                  <span className="text-sm font-bold text-gray-400 ml-1 italic">
                    {isAnnual ? "/yr" : "/mo"}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={isAnnual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-black text-red-500 mt-1 uppercase tracking-widest"
                  >
                    {isAnnual ? "Billed Yearly" : "Billed Monthly"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <ul className="relative z-10 mb-12 space-y-5 flex-1">
              {features.premium.map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-gray-700">
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/plans")}
              className="relative z-10 w-full h-16 rounded-2xl bg-red-500 font-black uppercase tracking-widest text-sm text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95"
            >
              Upgrade to Premium <Crown size={16} />
            </button>

            <div className="relative z-10 mt-6 pt-6 border-t border-gray-100 text-center">
              <span className="text-[9px] font-mono text-gray-400 tracking-widest uppercase">
                Full Access to All Features
              </span>
            </div>
          </motion.div>
        </div>

        {/* FAQ Shortcut */}
        {/* <div className="mt-24 text-center">
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
            Have more specific needs?
          </p>
          <button
            onClick={() => navigate("/contactus")}
            className="mt-4 text-gray-900 font-black uppercase text-sm border-b-2 border-red-500 pb-1 hover:text-red-500 transition-colors"
          >
            Contact Enterprise Scouting
          </button>
        </div> */}
      </div>
    </section>
  );
}
