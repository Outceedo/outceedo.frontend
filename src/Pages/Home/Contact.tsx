import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+44",
    phoneNumber: "",
    subject: "",
    message: "",
    agreeToPolicy: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });

    if (!formData.agreeToPolicy) {
      setSubmitStatus({ type: "error", message: "Please agree to the Privacy Policy to continue." });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/v1/auth/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: `${formData.phoneCode} ${formData.phoneNumber}`,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSubmitStatus({
        type: "success",
        message: data.message || "Your message has been sent successfully!",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneCode: "+44",
        phoneNumber: "",
        subject: "",
        message: "",
        agreeToPolicy: false,
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showGoBack = location.pathname === "/contactus";

  return (
    <>
      <Navbar />
      <section className="relative bg-white min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
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
          <div className="mb-8 sm:mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-6 sm:w-8 bg-red-500"></span>
              Get In Touch
              <span className="h-[2px] w-6 sm:w-8 bg-red-500"></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase italic"
            >
              CONTACT <span className="text-red-500">US.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-xl mx-auto font-medium px-2"
            >
              Have questions about Outceedo? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4 sm:gap-6"
            >
              {/* Email Card */}
              <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={20} className="sm:hidden" />
                  <Mail size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight mb-1 sm:mb-2">
                  Email Us
                </h3>
                <a
                  href="mailto:info@outceedo.com"
                  className="text-sm sm:text-base text-gray-500 font-medium hover:text-red-500 transition-colors break-all"
                >
                  info@outceedo.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={20} className="sm:hidden" />
                  <Phone size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight mb-1 sm:mb-2">
                  Call Us
                </h3>
                <a
                  href="tel:+447707201236"
                  className="text-sm sm:text-base text-gray-500 font-medium hover:text-red-500 transition-colors"
                >
                  +44 7707 201236
                </a>
              </div>

              {/* Location Card */}
              <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-500 flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <MapPin size={20} className="sm:hidden" />
                  <MapPin size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight mb-1 sm:mb-2">
                  Visit Us
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-medium">
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
              <div className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-xl" id="contactus">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-50 flex items-center justify-center text-red-500 flex-shrink-0">
                    <MessageSquare size={20} className="sm:hidden" />
                    <MessageSquare size={24} className="hidden sm:block" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                      Send a Message
                    </h2>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:tracking-widest">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        type="text"
                        id="phoneCode"
                        name="phoneCode"
                        placeholder="+44"
                        value={formData.phoneCode}
                        onChange={handleChange}
                        className="w-20 sm:w-24 px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-center text-sm sm:text-base"
                      />
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="7707 201236"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors bg-white text-sm sm:text-base"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Support">Support</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2"
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-red-500 font-medium transition-colors resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      name="agreeToPolicy"
                      checked={formData.agreeToPolicy}
                      onChange={handleChange}
                      className="mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 text-red-500 focus:ring-red-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <label
                      htmlFor="agreeToPolicy"
                      className="text-xs sm:text-sm text-gray-500 font-medium"
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

                  {submitStatus.type && (
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl ${
                        submitStatus.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {submitStatus.type === "success" ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="font-medium">{submitStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-red-500 font-black uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
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
