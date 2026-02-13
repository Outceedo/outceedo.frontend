import { motion } from "motion/react";
import { Target, Eye, Users, Award, TrendingUp, Shield } from "lucide-react";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

function Aboutus() {
  const features = [
    {
      icon: Users,
      title: "Connect with Experts",
      description:
        "Access certified football experts worldwide for real-time guidance.",
    },
    {
      icon: TrendingUp,
      title: "Expert Analysis",
      description:
        "Get real-time expert analysis of your game, skill level, strengths and weaknesses.",
    },
    {
      icon: Award,
      title: "Actionable Reports",
      description:
        "Receive actionable expert reports and personalized training guidance.",
    },
    {
      icon: Shield,
      title: "Career Advancement",
      description:
        "Enhance opportunities for team selection, sponsorships, and career advancement.",
    },
  ];

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-12 bg-red-500"></span>
              About Us
              <span className="h-[2px] w-12 bg-red-500"></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black tracking-tighter text-gray-900 uppercase italic mb-6"
            >
              WHERE FOOTBALL <br />
              <span className="text-red-500">MEETS EXPERTISE.</span>
            </motion.h1>
          </div>

          {/* Founders Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 rounded-[2.5rem] p-10 mb-12 border border-gray-100"
          >
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
              Outceedo is a UK registered company.{" "}
              <span className="text-red-500 font-bold">Arun Muppana</span> and{" "}
              <span className="text-red-500 font-bold">Karthik Reddy</span>,
              passionate football fans, co-founded this company in 2026.
            </p>
            <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
              <p className="text-xl text-red-500 font-bold leading-relaxed">
                Our mission is to create the best football players for a team by
                connecting them with worldwide experts for real-time performance
                assessment and guidance.
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
              Outceedo is an online platform where football players connect with
              global experts to get their sports skills and performances
              assessed. We proudly serve{" "}
              <span className="font-bold text-red-500">
                players, managers, coaches, scouts, sponsors, fans
              </span>{" "}
              and <span className="font-bold text-red-500">followers</span>,
              creating a dynamic and supportive football community.
            </p>
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
              We know how competitive it is for players to get into the best
              teams. It is hard to get a place in league or national teams, so
              we believe that expert assessment is essential to understand one's
              skills and enter the next level in sports.
            </p>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              Outceedo helps elevate every player's game through professional
              guidance and expert analysis.
            </p>
          </motion.div>

          {/* Vision & Why Outceedo Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <Eye className="h-7 w-7" />
                </div>
                <span className="text-6xl font-black text-gray-100 group-hover:text-red-100 transition-colors">
                  01
                </span>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter text-gray-900">
                Our Vision
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-4">
                To revolutionize the football industry with cutting-edge
                solutions using technology and a user-centric approach. Outceedo
                bridges the gap between players and experts, empowering football
                talents to grow, transform weaknesses into strengths, and excel
                in their sporting careers.
              </p>
              <p className="text-gray-500 font-medium leading-relaxed">
                Whether you're a parent seeking expert training for your child,
                an aspiring player aiming for professional leagues, or a
                seasoned footballer looking to refine your skills, Outceedo
                makes it easier to find the perfect expert to guide you.
              </p>
            </motion.div>

            {/* Why Outceedo Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-black p-10 text-white transition-all duration-500 shadow-2xl shadow-red-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-90" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Target className="h-7 w-7" />
                  </div>
                  <span className="text-6xl font-black text-white/20">02</span>
                </div>
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">
                  Why Outceedo?
                </h3>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <feature.icon size={14} className="text-white" />
                      </div>
                      <div>
                        <span className="text-white font-bold">
                          {feature.title}:
                        </span>
                        <span className="text-red-100 font-medium">
                          {" "}
                          {feature.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-red-50 border-2 border-red-500 text-red-600 px-8 py-4 rounded-2xl text-lg font-black uppercase tracking-tight shadow-sm">
              <Award className="w-6 h-6" />
              Outceedo - Where Football Meets Expertise
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

export default Aboutus;
