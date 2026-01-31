import { motion } from "motion/react";
import { Users, Briefcase, UserCheck, ArrowRight, Target, Heart } from "lucide-react";

const ecosystemItems = [
  {
    number: "01",
    title: "Players",
    desc: "Build a professional profile, undergo elite assessments, and broadcast your highlights to a global network of decision-makers.",
    icon: Users,
    tag: "Talent",
  },
  {
    number: "02",
    title: "Experts",
    desc: "Monetize your professional expertise. Conduct skill reviews, generate technical reports, and mentor the next generation.",
    icon: UserCheck,
    tag: "Mentorship",
  },
  {
    number: "03",
    title: "Teams",
    desc: "Streamline your scouting. Access verified player data, expert technical reports, and direct communication channels.",
    icon: Target,
    tag: "Recruitment",
  },
  {
    number: "04",
    title: "Sponsors",
    desc: "Identify brand ambassadors early. Partner with rising stars and track their performance growth through real data.",
    icon: Briefcase,
    tag: "Partnership",
  },
  {
    number: "05",
    title: "Fans",
    desc: "Follow your favourite players, stay updated on their journey, and support rising talent as they pursue their professional dreams.",
    icon: Heart,
    tag: "Support",
  },
];

export default function Profiles() {
  return (
    <section className="relative overflow-hidden bg-white py-32">
      {/* --- Tactical Background Pattern --- */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="pitch-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitch-grid)" />
          <circle
            cx="50%"
            cy="50%"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-24 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-8 bg-red-500"></span>
              The Global Network
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase"
            >
              BUILT FOR THE <br />
              <span className="text-red-500">ENTIRE ECOSYSTEM.</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-md lg:mb-2 font-medium"
          >
            Outceedo connects every stakeholder in the modern game through a
            unified, data-driven professional platform.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ecosystemItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col justify-between rounded-[2rem] border border-gray-100 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.15)] hover:-translate-y-2 overflow-hidden"
            >
              {/* Background Accent Number */}
              <div className="absolute -right-4 -top-4 text-[120px] font-black text-gray-50 select-none group-hover:text-red-50 transition-colors duration-500">
                {item.number}
              </div>

              {/* Red Scanner Line on Hover */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[4px] bg-red-500 group-hover:h-2/3 transition-all duration-500 rounded-r-full" />

              <div className="relative z-10">
                {/* Tag & Icon */}
                <div className="flex justify-between items-start mb-10">
                  <div className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-900 transition-all duration-500 group-hover:bg-red-500 group-hover:text-white flex shadow-sm">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-500 transition-colors">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mb-4 text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Interactive Link */}
              <div className="relative z-10 mt-10 flex items-center justify-between border-t border-gray-50 pt-6">
                <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 transition-colors uppercase tracking-widest">
                  Discover more
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
