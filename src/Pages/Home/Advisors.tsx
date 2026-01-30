import { motion } from "motion/react";
import { ShieldCheck, ChevronRight } from "lucide-react";

const advisors = [
  {
    name: "Sir Alex Ferguson",
    role: "Strategic Advisor",
    specialty: "High-Performance Culture",
    img: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=600",
    stats: { strategy: 99, leadership: 98, innovation: 95 },
    signature: "The Mastermind",
  },
  {
    name: "Arsène Wenger",
    role: "Technical Consultant",
    specialty: "Player Development & Scouting",
    img: "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=600",
    stats: { strategy: 96, leadership: 94, innovation: 99 },
    signature: "The Visionary",
  },
  {
    name: "Pep Guardiola",
    role: "Innovation Lead",
    specialty: "Tactical Fluidity & Systems",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    stats: { strategy: 99, leadership: 92, innovation: 100 },
    signature: "The Architect",
  },
  {
    name: "Jürgen Klopp",
    role: "Performance Mentor",
    specialty: "Intensity & Mental Resilience",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
    stats: { strategy: 94, leadership: 100, innovation: 92 },
    signature: "The Energizer",
  },
];

const ArrowRightIcon = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Advisors() {
  return (
    <section className="relative bg-white py-32 border-t border-gray-100 overflow-hidden">
      {/* Background Tactical Markings */}
      <div className="absolute top-0 right-50 p-12 opacity-[0.05] pointer-events-none select-none">
        <span className="text-[200px] font-black italic tracking-tighter leading-none">
          STAFF
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-12 bg-red-500"></span>
              The Board of Excellence
            </motion.div>
            <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
              ELITE <span className="text-red-500">ADVISORS.</span>
            </h2>
          </div>
          <p className="text-lg text-gray-500 max-w-xs font-medium border-l-2 border-red-500 pl-6 py-2">
            The world's most successful tactical minds guiding the future of
            Outceedo.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="flex gap-8 overflow-x-auto pb-12 snap-x scrollbar-hide no-scrollbar">
          {advisors.map((advisor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="snap-start min-w-[320px] md:min-w-[400px] relative group overflow-hidden rounded-[2.5rem] bg-gray-900 aspect-[4/5] shadow-2xl shadow-black/10"
            >
              {/* Profile Image */}
              <img
                src={advisor.img}
                alt={advisor.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
              />

              {/* Tactical Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Corner Badge */}
              <div className="absolute top-8 left-8 z-20">
                <div className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40">
                  <ShieldCheck size={20} />
                </div>
              </div>

              {/* Default Content (Bottom) */}
              <div className="absolute inset-x-0 bottom-0 p-10 z-10 transition-transform duration-500 group-hover:-translate-y-24">
                <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">
                  {advisor.role}
                </p>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  {advisor.name}
                </h3>
              </div>

              {/* Hover Detailed Stats Overlay */}
              <div className="absolute inset-0 z-20 bg-red-600/90 backdrop-blur-md p-10 flex flex-col justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                <div className="space-y-6">
                  <div className="pb-6 border-b border-white/20">
                    <p className="text-red-200 font-black text-[10px] uppercase tracking-widest mb-1">
                      Philosophy
                    </p>
                    <p className="text-white font-bold text-lg leading-tight">
                      "{advisor.specialty}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Strategy Stat */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-white/60 uppercase">
                        <span>Strategy</span>
                        <span>{advisor.stats.strategy}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${advisor.stats.strategy}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                    {/* Innovation Stat */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-white/60 uppercase">
                        <span>Innovation</span>
                        <span>{advisor.stats.innovation}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${advisor.stats.innovation}%`,
                          }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full h-12 rounded-xl bg-white text-red-600 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
                    Access Insights <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="mt-12 flex justify-between items-center border-t border-gray-100 pt-8">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                >
                  <img
                    src={`https://picsum.photos/seed/${i + 70}/100/100`}
                    alt="Staff"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              +12 Global Scouts and Data Analysts
            </p>
          </div>
          <button className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-[0.2em] group">
            View All Staff{" "}
            <ArrowRightIcon
              size={16}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
