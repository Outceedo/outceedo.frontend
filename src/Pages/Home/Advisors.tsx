import { motion } from "motion/react";
import {
  ShieldCheck,
  ChevronRight,
  MapPin,
  Award,
  Briefcase,
  Building2,
  User,
} from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

// --- BOARD ASSETS ---
import sylvieImg from "@/assets/board/Sylvie Lederlé Profile pic (1).jpg.jpeg";
import marcoImg from "@/assets/board/marcoGarcia.jpeg";
import katarinaImg from "@/assets/board/Katarina.jpg.jpeg";
import keithImg from "@/assets/board/Keith Hackett Pic-1.jpg.jpeg";
import johanImg from "@/assets/board/johan.png";
import markoImg from "@/assets/board/marko.png";
import paulImg from "@/assets/board/paul.png";
import ajitImg from "@/assets/board/ajit.jpeg";
import srisriImg from "@/assets/board/srisri.png";
import sonavisionImg from "@/assets/board/sonavision.png";
import ssdImg from "@/assets/board/ssd.png";
import mythriImg from "@/assets/board/spaceKreators.png";
import ram from "@/assets/board/ram.png";
import srikanth from "@/assets/board/srikanth.png";
import sudhir from "@/assets/board/sudhir.png";
// --- DATA ---
const advisors = [
  {
    name: "Sylvie Lederlé",
    role: "Brand Partnerships Leader",
    description:
      "A senior brand partnerships leader with 20+ years of experience across major international sports properties. Expert in sponsorship, rights valuation, KPI frameworks with deep knowledge of rights-holder ecosystems and complex stakeholder management.",
    img: sylvieImg,
  },
  {
    name: "Marco Garcia",
    role: "Football Advisor",
    description:
      "A Spanish-Chilean football advisor and high-performance specialist with 11+ years of international experience across youth development, elite talent identification, scouting analysis, sports management, and professional head coaching.",
    img: marcoImg,
  },
  {
    name: "Katarina Cosic",
    role: "Sport Lawyer & FIFA Agent",
    description:
      "Has 14+ years' experience as a Sport Lawyer and licensed FIFA Football Agent providing legal and strategic representation within the football industry. She advises and represents professional football players, coaches, and clubs.",
    img: katarinaImg,
  },
  {
    name: "Keith Hackett",
    role: "Former Premier League Referee",
    description:
      "English former football referee, who began refereeing in local leagues in the Sheffield, South Yorkshire area in 1960. He is counted amongst the top 100 referees of all time in a list maintained by the IFFHS.",
    img: keithImg,
  },
];

const experts = [
  {
    name: "Johan",
    experience: "19 years",
    certification: "UEFA Pro License",
    position: "Football Manager/Director",
    location: "Sweden, Denmark, Liberia & Hungary",
    img: johanImg,
  },
  {
    name: "Marko",
    experience: "10 years",
    certification: "UEFA A, Youth Elite",
    position: "Manager & Coach",
    location: "Malta",
    img: markoImg,
  },
  {
    name: "Paul",
    experience: "12 years",
    certification: "UEFA Pro License",
    position: "Coach & Scout",
    location: "Romania",
    img: paulImg,
  },
  {
    name: "Ajithkumar B.",
    experience: "9+ years",
    certification: "AIFF D, AFC B, FA Level-1",
    position: "Coach",
    location: "India",
    img: ajitImg,
  },
];

const presentSponsors = [
  {
    name: "Sri Sri International",
    type: "Company",
    location: "UK",
    img: srisriImg,
  },
  {
    name: "Space Kreators",
    type: "Business",
    location: "India",
    img: mythriImg,
  },
  {
    name: "Sonavision",
    type: "Company",
    location: "UK",
    img: sonavisionImg,
  },
  {
    name: "SSD",
    type: "Business",
    location: "India",
    img: ssdImg,
  },
];

const individualSponsors: {
  name: string;
  profession: string;
  location: string;
  img?: string;
}[] = [
  {
    name: "Ramchander P",
    profession: "IT Consultant",
    location: "UK",
    img: ram,
  },
  {
    name: "Kiran V",
    profession: "Mech Chartered Engineer",
    location: "UK",
    img: srikanth,
  },
  {
    name: "Sudhir P",
    profession: "Senior Electrical Engineer",
    location: "UK",
    img: sudhir,
  },
];

// --- ICONS ---
const ArrowRightIcon = ({ size, className }) => (
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

export default function NetworkAndStaff() {
  const nav = useNavigate();
  return (
    <div className="bg-white">
      <Navbar />
      {/* =========================================
          SECTION 1: ADVISORS (The Board)
      ========================================= */}
      <section className="relative bg-white py-32 border-t border-gray-100 overflow-hidden">
        <div className="absolute top-0 right-10 p-12 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[130px] md:text-[200px] font-black italic tracking-tighter leading-none">
            BOARD
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
                OUTCEEDO <span className="text-red-500">ADVISORS.</span>
              </h2>
            </div>
            <p className="text-lg text-gray-500 max-w-xs font-medium border-l-2 border-red-500 pl-6 py-2">
              Industry leaders and strategic experts guiding the future of the
              organization.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {advisors.map((advisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 min-w-[280px] max-w-[350px] relative group overflow-hidden rounded-[2.5rem] bg-gray-900 aspect-[4/5] shadow-2xl"
              >
                <img
                  src={advisor.img}
                  alt={advisor.name}
                  className="absolute inset-0 h-full w-full object-contain transition-transform duration-[1.5s] ease-out group-hover:scale-110  group-hover:grayscale-0 opacity-100 group-hover:opacity-100"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" /> */}

                {/* <div className="absolute top-8 left-8 z-20">
                  <div className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40">
                    <ShieldCheck size={20} />
                  </div>
                </div> */}

                <div className="absolute inset-x-0 bottom-0 p-10 z-10 transition-transform duration-500 group-hover:-translate-y-12">
                  <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">
                    {advisor.role}
                  </p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    {advisor.name}
                  </h3>
                </div>

                {/* Tactical Hover Overlay for Advisors (Red Theme) */}
                <div className="absolute inset-0 z-20 bg-red-600/95 backdrop-blur-md p-10 flex flex-col justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                  <div className="space-y-6">
                    <div className="pb-6 border-b border-white/20">
                      <p className="text-red-200 font-black text-[10px] uppercase tracking-widest mb-3">
                        Strategic Profile
                      </p>
                      <p className="text-white font-medium text-sm leading-relaxed">
                        "{advisor.description}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2: EXPERTS (The Network)
      ========================================= */}
      <section className="relative bg-gray-50 py-32 border-t border-gray-200 overflow-hidden">
        <div className="absolute top-0 left-10 p-12 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[130px] md:text-[200px] font-black italic tracking-tighter leading-none">
            COACH
          </span>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-4 inline-flex items-center gap-2 text-gray-500 font-black tracking-[0.3em] uppercase text-xs"
              >
                <span className="h-[2px] w-12 bg-gray-500"></span>
                Professional Network
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
                ELITE <span className="text-gray-400">EXPERTS.</span>
              </h2>
            </div>
            <p className="text-lg text-gray-500 max-w-xs font-medium border-l-2 border-gray-400 pl-6 py-2">
              World-class coaches and football professionals bringing decades of
              on-pitch experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {experts.map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 min-w-[280px] max-h-[350px] relative group overflow-hidden rounded-[2rem] bg-black aspect-square shadow-xl"
              >
                <img
                  src={expert.img}
                  alt={expert.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-100 group-hover:opacity-100"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" /> */}

                <div className="absolute top-6 right-6 z-20">
                  <div className="px-2 py-1.5 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white font-black text-[10px] tracking-widest uppercase">
                    {expert.experience} EXP
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                  <p className="text-gray-100 font-black text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Briefcase size={12} className="text-red-500" />{" "}
                    {expert.position}
                  </p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    {expert.name}
                  </h3>
                </div>

                {/* Tactical Hover Overlay for Experts (Dark/Gray Theme from Left) */}
                <div className="absolute inset-0 z-20 bg-gray-900/95 backdrop-blur-md p-8 flex flex-col justify-center -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">
                    {expert.name}
                  </h4>

                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">
                        Certification
                      </p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <Award size={16} className="text-red-500" />{" "}
                        {expert.certification}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">
                        Regions Active
                      </p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />{" "}
                        {expert.location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: SPONSORS & PARTNERS
      ========================================= */}
      <section className="relative bg-white py-32 border-t border-gray-100 overflow-hidden">
        <div className="absolute bottom-0 right-10 p-12 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[80px] md:text-[200px] font-black italic tracking-tighter leading-none">
            SPONSORS
          </span>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
              >
                <span className="h-[2px] w-12 bg-red-500"></span>
                Supporting The Athletes
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic">
                TALENT <span className="text-red-500">SPONSORS.</span>
              </h2>
            </div>
            <p className="text-lg text-gray-500 max-w-xs font-medium border-l-2 border-red-500 pl-6 py-2">
              The organizations and individuals directly funding and supporting
              the players and teams across our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Corporate Sponsors */}
            <div className="lg:col-span-12">
              <h3 className="text-xl font-black tracking-widest uppercase text-gray-900 mb-8 flex items-center gap-3">
                <Building2 className="text-red-500" /> Corporate Sponsors
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {presentSponsors.map((sponsor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-1 min-w-[200px] max-w-[240px] relative group overflow-hidden rounded-[2rem] bg-gray-900 aspect-square shadow-xl"
                  >
                    <img
                      src={sponsor.img}
                      alt={sponsor.name}
                      className="absolute inset-0 h-full w-full object-contain transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-100 group-hover:opacity-100"
                    />
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" /> */}

                    <div className="absolute top-6 right-6 z-20">
                      <div className="px-3 py-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm text-white font-black text-[10px] tracking-widest uppercase">
                        {sponsor.type}
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                      {/* <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                        {sponsor.name}
                      </h4> */}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-20 bg-red-600/95 backdrop-blur-md p-6 flex flex-col justify-center -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-6">
                        {sponsor.name}
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <p className="text-red-200 font-black text-[10px] uppercase tracking-widest mb-1">
                            Type
                          </p>
                          <p className="text-white font-bold flex items-center gap-2">
                            <Building2 size={16} /> {sponsor.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-red-200 font-black text-[10px] uppercase tracking-widest mb-1">
                            Location
                          </p>
                          <p className="text-white font-bold flex items-center gap-2">
                            <MapPin size={16} /> {sponsor.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Individual Sponsors */}
            <div className="lg:col-span-12 mt-12">
              <h3 className="text-xl font-black tracking-widest uppercase text-gray-900 mb-8 flex items-center gap-3">
                <User className="text-red-500" /> Individual Backers
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {individualSponsors.map((sponsor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-1 min-w-[200px] max-w-[240px] relative group overflow-hidden rounded-[2rem] bg-gray-900 aspect-square shadow-xl"
                  >
                    {sponsor.img ? (
                      <img
                        src={sponsor.img}
                        alt={sponsor.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-100 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <User size={80} className="text-gray-700" />
                      </div>
                    )}

                    <div className="absolute top-6 right-6 z-20">
                      <div className="px-3 py-1.5 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white font-black text-[10px] tracking-widest uppercase">
                        Backer
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                        {sponsor.name}
                      </h4>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-20 bg-gray-900/95 backdrop-blur-md p-6 flex flex-col justify-center -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-6">
                        {sponsor.name}
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">
                            Profession
                          </p>
                          <p className="text-white font-bold flex items-center gap-2">
                            <Briefcase size={16} className="text-red-500" />{" "}
                            {sponsor.profession}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">
                            Location
                          </p>
                          <p className="text-white font-bold flex items-center gap-2">
                            <MapPin size={16} className="text-red-500" />{" "}
                            {sponsor.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Hint */}
          <div className="mt-20 flex justify-between items-center border-t border-gray-100 pt-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Interested in partnership opportunities?
            </p>
            <button
              className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-[0.2em] group"
              onClick={() => {
                nav("/contactus");
              }}
            >
              Contact Board{" "}
              <ArrowRightIcon
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Global utility styles for hiding scrollbars in carousels */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
