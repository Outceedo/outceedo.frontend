import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+44",
    phoneNumber: "",
    message: "",
    agreeToPolicy: false,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const showGoBack = location.pathname === "/contactus";

  return (
    <>
      <Navbar />
      <section className="relative bg-white min-h-screen pt-32 pb-20 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Go Back Button */}
          {showGoBack && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-slate-600 hover:text-red-500 font-bold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </motion.button>
          )}

          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-8 bg-red-500"></span>
              Get In Touch
              <span className="h-[2px] w-8 bg-red-500"></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl uppercase italic"
            >
              CONTACT <span className="text-red-500">US.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-gray-500 max-w-xl mx-auto font-medium"
            >
              Have questions about Outceedo? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Email Card */}
              <div className="group p-6 rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                  Email Us
                </h3>
                <a
                  href="mailto:info@outceedo.com"
                  className="text-gray-500 font-medium hover:text-red-500 transition-colors"
                >
                  info@outceedo.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="group p-6 rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                  Call Us
                </h3>
                <a
                  href="tel:+447707201236"
                  className="text-gray-500 font-medium hover:text-red-500 transition-colors"
                >
                  +44 7707 201236
                </a>
              </div>

              {/* Location Card */}
              <div className="group p-6 rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                  Visit Us
                </h3>
                <p className="text-gray-500 font-medium">
                  82 Berryden Gardens<br />
                  Aberdeen, AB25, UK
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <div className="p-10 rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-xl" id="contactus">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-red-500">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      Send a Message
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        id="phoneCode"
                        name="phoneCode"
                        placeholder="+44"
                        value={formData.phoneCode}
                        onChange={handleChange}
                        className="w-24 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-center"
                      />
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="7707 201236"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      name="agreeToPolicy"
                      checked={formData.agreeToPolicy}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agreeToPolicy"
                      className="text-sm text-gray-500 font-medium"
                    >
                      I'd like to receive more information about Outceedo. I understand and agree to the{" "}
                      <a
                        href="/privacy"
                        className="text-red-500 hover:text-red-600 font-bold"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-red-500 font-black uppercase tracking-widest text-sm text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95"
                  >
                    Send Message <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <FooterSection />
    </>
  );
};

export default Contact;
