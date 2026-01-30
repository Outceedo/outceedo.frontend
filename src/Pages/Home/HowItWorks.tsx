import { motion } from "motion/react";
import {
  UserPlus,
  Search,
  FileText,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-white py-32 overflow-hidden"
    >
      {/* Background Decoration: Tactical Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="10%"
            y1="0"
            x2="10%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="90%"
            y1="0"
            x2="90%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-12 bg-red-500"></span>
              The Process
            </motion.div>
            <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
              PATH TO THE <span className="text-red-500">PROS.</span>
            </h2>
          </div>
          <p className="text-lg text-gray-500 max-w-xs font-medium border-l-2 border-red-500 pl-6 py-2">
            A simplified, data-driven journey from the local pitch to the
            international stage.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
          {/* STEP 01: Create Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-gray-50 p-10 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
          >
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-xl shadow-black/5 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <UserPlus className="h-7 w-7" />
                </div>
                <span className="text-6xl font-black text-gray-200 group-hover:text-red-100 transition-colors">
                  01
                </span>
              </div>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">
                Identity Build
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Construct your digital scouting pass. Upload performance data,
                medical history, and technical highlights.
              </p>
            </div>

            {/* Visual: Floating Profile Card */}
            <div className="mt-10 relative h-48 w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transform group-hover:translate-y-[-10px] group-hover:rotate-2 transition-all duration-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-black italic">
                  JD
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded-full" />
                  <div className="h-2 w-16 bg-gray-50 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>TECHNICAL SCORE</span>
                  <span className="text-red-500">92/100</span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "92%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-red-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 02: Connect & Book */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-black p-10 text-white flex flex-col justify-between transition-all duration-500 shadow-2xl shadow-red-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-90" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-red-200 uppercase">
                    Step Two
                  </span>
                </div>
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">
                  Elite Marketplace
                </h3>
                <p className="text-red-50 text-lg font-medium max-w-md">
                  Browse a curated directory of UEFA-licensed coaches, top-tier
                  scouts, and performance nutritionists.
                </p>
              </div>

              {/* Network Visual */}
              <div className="hidden lg:flex flex-col items-center justify-center w-64 h-full gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/40 flex items-center justify-center">
                      <ShieldCheck className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-red-400 border-2 border-white shadow-xl" />
                  <div className="absolute -bottom-2 -right-6 w-10 h-10 rounded-full bg-white border-2 border-red-500 flex items-center justify-center text-red-500 font-bold text-[10px]">
                    PRO
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 03: Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 flex flex-col transition-all duration-500 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-4xl font-black text-gray-100 group-hover:text-red-50 transition-colors">
                  03
                </span>
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">
                Data Insights
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Receive comprehensive technical audits and scouting reports with
                actionable metrics.
              </p>
            </div>

            <div className="mt-auto flex items-end gap-1 h-12">
              {[40, 70, 45, 90, 60, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ delay: 0.1 * i, duration: 0.8 }}
                  className="flex-1 bg-gray-100 group-hover:bg-red-500/20 rounded-t-sm transition-colors"
                />
              ))}
            </div>
          </motion.div>

          {/* STEP 04: Succeed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] border-2 border-red-500 bg-red-50/30 p-10 flex flex-col transition-all duration-500"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-4xl font-black text-red-100">04</span>
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-red-600">
                The Breakout
              </h3>
              <p className="text-red-900/60 text-sm font-bold leading-relaxed">
                Connect directly with clubs, agents, and sponsors who leverage
                our data to sign talent.
              </p>
            </div>

            <div className="mt-auto">
              <div className="bg-white rounded-xl p-3 border border-red-100 flex items-center gap-3 shadow-sm group-hover:scale-105 transition-transform duration-500">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Status
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    Contract Ready
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 flex justify-center"
        >
          <button className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-sm hover:gap-6 transition-all group">
            Start your journey now{" "}
            <ChevronRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
