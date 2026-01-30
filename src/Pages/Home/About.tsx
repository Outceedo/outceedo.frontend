import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Users, Zap, Trophy } from "lucide-react";
import ball from "../../assets/images/aboutimg.jpg";

const features = [
  {
    icon: Target,
    title: "Data-Driven",
    desc: "Technical assessments backed by real metrics",
  },
  {
    icon: Users,
    title: "Global Network",
    desc: "Connect with experts worldwide",
  },
  {
    icon: Zap,
    title: "Fast Growth",
    desc: "Accelerate your professional career",
  },
  {
    icon: Trophy,
    title: "Elite Access",
    desc: "Reach top scouts and managers",
  },
];

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-32 overflow-hidden" id="about">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-12 bg-red-500"></span>
              About Us
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-gray-900 sm:text-6xl uppercase italic mb-6"
            >
              WHY CHOOSE <span className="text-red-500">OUTCEEDO?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-500 font-medium leading-relaxed mb-6"
            >
              Our vision is to revolutionize the football industry with
              cutting-edge solutions and a user-centric approach.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-500 font-medium leading-relaxed mb-10"
            >
              Outceedo is an online platform where football players connect
              with experts to get their sports skills and performances
              assessed. We serve players, managers, coaches, scouts,
              sponsors, fans and followers.
            </motion.p>

            {/* Feature Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mb-10"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-xl bg-white group-hover:bg-red-500 flex items-center justify-center text-red-500 group-hover:text-white mb-3 transition-all duration-300 shadow-sm">
                    <feature.icon size={20} />
                  </div>
                  <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate("/about")}
              className="group h-14 px-8 bg-red-500 rounded-2xl flex items-center justify-center gap-3 text-white font-bold hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-red-500/20"
            >
              Learn More About Us
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </motion.button>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
                src={ball}
                alt="Soccer ball in goal net"
                className="w-full h-[500px] object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Stats Overlay */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-black text-red-500">5K+</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Players
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-red-500">150+</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Experts
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-red-500">99%</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Satisfaction
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
