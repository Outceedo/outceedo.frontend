import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
} from "lucide-react";
import logo from "@/assets/images/logosmall.png";

export default function FooterSection() {
  const navigate = useNavigate();
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=82+Berryden+Gardens,+Aberdeen,+UK";

  const platformLinks = [
    { label: "About", path: "/about" },
    { label: "Team", path: "/teams" },
    { label: "Pricing", path: "/plans" },
    { label: "Contact", path: "/contactus" },
  ];

  return (
    <footer className="relative overflow-hidden bg-white pt-32 pb-12 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-8">
              <img src={logo} alt="Outceedo" className="w-10 h-10" />
              <span className="text-3xl font-black tracking-tighter uppercase italic">
                OUTCEEDO<span className="text-red-500">.</span>
              </span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed mb-8 max-w-sm">
              The global ecosystem built for elite football recruitment,
              technical assessments, and professional career growth.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, url: "https://x.com/outceedo" },
                { icon: Instagram, url: "https://www.instagram.com/outceedo/" },
                {
                  icon: Facebook,
                  url: "https://www.facebook.com/profile.php?id=61577579885680",
                },
                { icon: Youtube, url: "https://www.youtube.com/@outceedo" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  className="h-14 w-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-4">
            <h3 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-red-500">
              Platform
            </h3>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-md font-bold text-gray-600 hover:text-black transition-colors flex items-center gap-1 group"
                  >
                    {link.label}{" "}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Location Column */}
          <div className="md:col-span-4">
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-red-500">
              Headquarters
            </h3>
            <div className="space-y-6">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-red-200 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 tracking-widest leading-none mb-1">
                    Aberdeen, UK
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    82 Berryden Gardens, AB25
                  </p>
                </div>
              </a>

              <div className="flex flex-col gap-4">
                <a
                  className="flex items-center gap-3 text-sm font-bold text-gray-600"
                  href="mailto:info@outceedo.com"
                >
                  <Mail size={16} className="text-red-500" />
                  <span className="font-mono text-md tracking-tight">
                    info@outceedo.com
                  </span>
                </a>
                <a
                  className="flex items-center gap-3 text-sm font-bold text-gray-600"
                  href="tel:+447707201236"
                >
                  <Phone size={16} className="text-red-500" />
                  <span className="font-mono text-md tracking-tight">
                    +44 7707 201236
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[14px] font-black uppercase tracking-widest text-gray-600">
            © 2026 OUTCEEDO LIMITED. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <button
              onClick={() => navigate("/privacy")}
              className="text-[12px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="text-[12px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Massive Background Watermark */}
      <div className="pointer-events-none absolute -bottom-10 left-0 right-0 flex justify-center opacity-[0.03]">
        <h1 className="text-[22vw] font-black leading-none tracking-tighter text-red-900 select-none italic">
          OUTCEEDO
        </h1>
      </div>
    </footer>
  );
}
