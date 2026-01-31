import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Profiles from "./Profiles";
import HowItWorks from "./HowItWorks";
import PricingSection from "./PricingSection";
import Advisors from "./Advisors";
import Testimonials from "./Testimonials";
import FooterSection from "./FooterSection";

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
      <Navbar />
      <Hero />
      <Profiles />
      <HowItWorks />
      <PricingSection />
      {/* <Advisors /> */}
      {/* <Testimonials /> */}
      <FooterSection />
    </div>
  );
};

export default HomePage;
