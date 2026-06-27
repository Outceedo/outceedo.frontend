import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

import Seo from "@/components/seo/Seo";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Profiles from "./Profiles";
import HowItWorks from "./HowItWorks";
import PricingSection from "./PricingSection";
import Advisors from "./Advisors";
import Testimonials from "./Testimonials";
import FooterSection from "./FooterSection";
import CookieConsent from "./CookieConsent";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          user?.role === "expert"
            ? "/expert/dashboard"
            : "/player/dashboard"
        }
      />
    );
  }

  return (
    <div className="bg-white">
      <Seo
        title="Outceedo — Outdo Your Sport to Succeed"
        description="Outceedo is the sports platform connecting players, experts, teams, sponsors, scouts and fans. Get assessed, get discovered, outdo your sport to succeed."
        canonicalPath="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Outceedo",
            url: "https://outceedo.com",
            logo: "https://outceedo.com/og-default.png",
            slogan: "Outdo your sport to succeed",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Outceedo",
            url: "https://outceedo.com",
          },
        ]}
      />
      <Navbar />
      <Hero />
      <Profiles />
      <HowItWorks />
      <PricingSection />
      {/* <Advisors /> */}
      {/* <Testimonials /> */}
      <FooterSection />
      <CookieConsent />
    </div>
  );
};

export default HomePage;
