import { Button } from "@/components/ui/button";

import { FaForward } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ball from "../../assets/images/aboutimg.jpg";

const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* About Section */}
      <section
        className="bg-[#FFF8DA] py-6 px-12 md:px-8 rounded-2xl max-w-md sm:max-w-5xl mx-auto mb-6"
        id="about"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:gap-28 items-center">
            <div className="w-full md:w-1/2 px-4">
              <h3 className="text-red-600 font-medium text-3xl mb-3">
                Why Choose Us
              </h3>

              <div className="space-y-6">
                <p className="text-gray-600">
                  Our vision is to revolutionize the football industry with
                  cutting-edge solutions and a user-centric approach.
                </p>
                <p className="text-gray-600">
                  Outceedo is an online platform where football players connect
                  with experts to get their sports skills and performances
                  assessed. We serve players, managers, coach's, scouts,
                  sponsors, fans and followers
                </p>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center"
                  onClick={() => {
                    navigate("/about");
                  }}
                >
                  Know more <FaForward />
                </Button>
              </div>
            </div>
            <div className="w-1/2 md:w-1/3 hidden sm:block mt-8">
              <img
                src={ball}
                alt="Soccer ball in goal net"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default About;
