import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";

function Aboutus() {
  
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-red-600 mb-6 text-center mt-6">
            About Us
          </h1>
          <div className="bg-[#f7fafb] rounded-xl shadow-md p-8 mb-8">
            <p className="text-lg text-gray-800 mb-4 ">
             Outceedo is a UK registered company.  

            </p>
            <p className="text-lg text-gray-800 mb-4 "><span className=" text-red-500 font-bold">Arun Muppana</span>{" "} and <span className=" text-red-500 font-bold">Karthik Reddy</span>{","} a passionate football fans cofounded this company in 2025.</p>
            <span className="text-lg text-gray-800 mb-4 font-bold text-red-500">
              Our mission is to create the best football players for a team by
              connecting them with worldwide experts for real-time performance
              assessment and guidance.
            </span>
            <br />
            <br />

            <p className="text-lg text-gray-800 mb-4">
              Outceedo is an online platform where football players connect with
              global experts to get their sports skills and performances
              assessed. We proudly serve{" "}
              <span className="font-semibold text-red-500">
                players, managers, coaches, scouts, sponsors, fans
              </span>{" "}
              and <span className="font-semibold text-red-500">followers</span>,
              creating a dynamic and supportive football community.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              We know how competitive it is for players to get into the best teams. It is hard to get a place in league or national teams, so we believe that expert assessment is essential to understand one’s skills and enter the next level in sports. 
            </p>
            <p className="text-lg text-gray-800 mb-4">Outceedo helps elevate every player's game through professional guidance and expert analysis.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Our Vision
              </h2>
              <p className="text-gray-700 text-base mb-3">
                To revolutionize the football industry with cutting-edge
                solutions using technology and a user-centric approach. Outceedo
                bridges the gap between players and experts, empowering football
                talents to grow, transform weaknesses into strengths, and excel
                in their sporting careers.
              </p>
              <p className="text-gray-700 text-base">
                Whether you’re a parent seeking expert training for your child,
                an aspiring player aiming for professional leagues, or a
                seasoned footballer looking to refine your skills, Outceedo
                makes it easier to find the perfect expert to guide you.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Why Outceedo?
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Connect with certified football experts worldwide</li>
                <li>
                  Get real-time expert analysis of your game, skill level,
                  strengths and weaknesses
                </li>
                <li>
                  Receive actionable expert reports and personalized training
                  guidance
                </li>
                <li>
                  Enhance your opportunities for team selection, sponsorships,
                  and career advancement
                </li>
                <li>
                  Become part of a supportive community of players,
                  professionals, and fans
                </li>
                <li>
                  Expert coaches assess player performance in real time and
                  support their growth with tailored advice.
                </li>
                <li>
                  Outceedo simplifies the path for players to enter the next
                  level in sports leagues by offering essential skill
                  assessments and strategic insights.
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <span className="inline-block bg-red-100 text-red-600 px-6 py-3 rounded-full text-lg font-semibold shadow">
              Outceedo — Where Football Meets Expertise
            </span>
          </div>
        </div>
      </section>
      <OutceedoFooter />
    </div>
  );
}

export default Aboutus;
