import { motion } from "motion/react";
import {
  Quote,
  Star,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const testimonials = [
  {
    name: "Marcus Davies",
    role: "U21 Striker, Championship Academy",
    content:
      "Outceedo didn't just give me a profile; it gave me a technical identity. The assessment from coach Wenger highlighted flaws in my movement I never noticed. Two weeks later, I had three trials lined up.",
    stat: "+45% Scouting Visibility",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Player Success",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Recruitment, Liga F",
    content:
      "The data transparency on Outceedo is revolutionary. We no longer rely on grainy highlight reels. The verified technical reports allow us to scout players remotely with 90% accuracy before traveling.",
    stat: "Verified Data Stream",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Scout Endorsement",
  },
  {
    name: "Jordan Smith",
    role: "Free Agent / Pro Prospect",
    content:
      "Being an unattached player is tough. Outceedo bridged that gap. My 'Elite' report was the key that opened doors to European agents who previously wouldn't even open my emails.",
    stat: "Pro Trial Secured",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Career Pivot",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-white py-32 overflow-hidden border-t border-gray-50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black italic tracking-tighter text-gray-900 leading-none select-none">
          REPORTS
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
          >
            <span className="h-[2px] w-12 bg-red-500"></span>
            Field Tested
            <span className="h-[2px] w-12 bg-red-500"></span>
          </motion.div>
          <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
            PRO <span className="text-red-500">APPROVED.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto font-medium">
            Join the elite network of players and experts who have optimized
            their careers through technical transparency.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative flex flex-col rounded-[2.5rem] bg-gray-50 p-10 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:bg-white hover:border-red-100"
            >
              {/* Top Meta Info */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className="fill-red-500 text-red-500"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-[9px] font-black tracking-widest text-red-500 uppercase">
                  <ShieldCheck size={10} /> Verified Report
                </div>
              </div>

              {/* Quote Icon */}
              <div className="absolute -top-4 -left-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={80} className="text-red-500" />
              </div>

              {/* Content */}
              <p className="relative z-10 text-gray-600 font-medium leading-relaxed mb-10 italic">
                "{t.content}"
              </p>

              {/* Performance Metric Badge */}
              <div className="mt-auto mb-8 flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-50 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1 tracking-widest">
                    Outceedo Impact
                  </p>
                  <p className="text-sm font-black text-gray-900">{t.stat}</p>
                </div>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 leading-none">
                    {t.name}
                  </h4>
                  <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-tight">
                    {t.role}
                  </p>
                </div>
              </div>

              {/* Asset Identifier Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-[8px] font-mono font-bold text-gray-300 uppercase tracking-[0.2em]">
                <span>Log ID: {t.name.split(" ")[0].toUpperCase()}_25</span>
                <span className="group-hover:text-red-400 transition-colors">
                  Tactical Audit Approved
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Stats Footer */}
        <div className="mt-20 p-12 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">
                Technical Satisfaction{" "}
                <span className="text-red-500">99.2%</span>
              </h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Aggregated feedback from over 5,000 professional technical
                audits
              </p>
            </div>
            <div className="flex -space-x-4">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${i + 99}/100/100`}
                  className="w-14 h-14 rounded-full border-4 border-gray-900 shadow-2xl"
                  alt="Pro"
                />
              ))}
              <div className="h-14 w-14 rounded-full bg-red-500 flex items-center justify-center border-4 border-gray-900 text-[10px] font-black">
                +12k
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
