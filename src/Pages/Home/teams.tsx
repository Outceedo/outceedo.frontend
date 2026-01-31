import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Code, Palette, Linkedin } from "lucide-react";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";
import Farhan from "../../assets/team/Farhan.jpg";
import Neekunj from "../../assets/team/Neekunj.jpg";
import Arun from "../../assets/team/Arun.jpg";
import Nikitha from "../../assets/team/Nikitha.jpg";
import Vamshi from "../../assets/team/Vamshi.jpg";
import Dinesh from "../../assets/team/Dinesh.jpg";
import Sindhu from "../../assets/team/Sindhu.jpg";
import Riktha from "../../assets/team/Riktha.jpg";
import Deepthika from "../../assets/team/Deepthika.jpg";
import Abhiram from "../../assets/team/Abhiram.jpg";

const managementTeam = [
  {
    name: "Arun Muppana",
    designation: "Founder & CEO",
    photo: Arun,
  },
  {
    name: "Karthik Reddy",
    designation: "Co-Founder & CTO",
    photo: Vamshi,
  },
];

const technicalTeam = [
  {
    name: "Shakir Farhan",
    designation: "Backend Systems Engineer",
    photo: Farhan,
  },
  {
    name: "Neekunj Chaturvedi",
    designation: "Frontend and Integration Engineer",
    photo: Neekunj,
  },
  {
    name: "Abhiram Mangipudi",
    designation: "Backend and AI Engineer",
    photo: Abhiram,
  },
  {
    name: "Sindhu",
    designation: "Frontend Developer",
    photo: Sindhu,
  },
  {
    name: "Nikitha",
    designation: "Frontend Developer",
    photo: Nikitha,
  },
  {
    name: "Rella Dinesh",
    designation: "Quality Assurance and Responsive Testing",
    photo: Dinesh,
  },
];

const designTeam = [
  {
    name: "Riktha Reddy",
    designation: "UI/UX Designer",
    photo: Riktha,
  },
  {
    name: "Deepthika",
    designation: "UI/UX Designer",
    photo: Deepthika,
  },
];

interface TeamMember {
  name: string;
  designation: string;
  photo: string;
}

interface TeamSectionProps {
  title: string;
  icon: React.ElementType;
  members: TeamMember[];
  delay: number;
}

const TeamSection = ({ title, icon: Icon, members, delay }: TeamSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="mb-20"
  >
    <div className="flex items-center justify-center gap-3 mb-10">
      <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
        <Icon size={24} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
        {title}
      </h2>
    </div>

    <div className="flex flex-wrap gap-8 justify-center">
      {members.map((member, index) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + index * 0.1 }}
          whileHover={{ y: -10 }}
          className="group relative w-64 rounded-[2rem] border border-gray-100 bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Hover Social Link */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <button className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 hover:bg-red-500 hover:text-white transition-colors">
                <Linkedin size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">
              {member.name}
            </h3>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
              {member.designation}
            </p>
          </div>

          {/* Red accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

function Teams() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <Navbar />

      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        </div>

        {/* Background Watermark */}
        <div className="absolute top-1/4 left-0 right-0 flex justify-center opacity-[0.02] pointer-events-none">
          <span className="text-[20vw] font-black italic tracking-tighter leading-none">
            TEAM
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          {/* Go Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-slate-600 hover:text-red-500 font-bold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </motion.button>

          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-8 bg-red-500"></span>
              The People Behind
              <span className="h-[2px] w-8 bg-red-500"></span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic mb-6"
            >
              WE ARE <span className="text-red-500">OUTCEEDO.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-500 max-w-xl mx-auto font-medium"
            >
              Meet the passionate minds and creative talent driving our vision forward.
            </motion.p>
          </div>

          {/* Team Sections */}
          <TeamSection
            title="Management Team"
            icon={Crown}
            members={managementTeam}
            delay={0.3}
          />

          <TeamSection
            title="Technical Team"
            icon={Code}
            members={technicalTeam}
            delay={0.4}
          />

          <TeamSection
            title="Design Team"
            icon={Palette}
            members={designTeam}
            delay={0.5}
          />

          {/* Footer Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 text-white">
              <span className="text-lg font-black uppercase tracking-tight">
                Together, we are shaping the future of{" "}
                <span className="text-red-500">Outceedo.</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

export default Teams;
