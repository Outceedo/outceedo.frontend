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
            <p className="text-lg text-gray-800 mb-4">
              <span className="font-semibold text-red-500">Outceedo</span> is a
              start-up company registered in Scotland, with operations based in
              the United Kingdom.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              Our mission is to revolutionize the football industry through
              cutting-edge technology and a user-centric approach.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              Outceedo is an online platform where football players connect with
              experts to get their sports skills and performances assessed.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              We proudly serve{" "}
              <span className="font-semibold text-red-500">
                players, managers, coaches, scouts, sponsors, fans
              </span>{" "}
              and <span className="font-semibold text-red-500">followers</span>,
              creating a dynamic and supportive football community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Our Vision
              </h2>
              <p className="text-gray-700 text-base">
                To empower football talents and professionals by bridging the
                gap between players and experts, fostering growth, opportunity,
                and excellence in the sport.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Why Outceedo?
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Connect with certified football experts easily</li>
                <li>Receive professional skill and performance assessments</li>
                <li>
                  Grow as a player or expert within a supportive community
                </li>
                <li>Access opportunities for sponsorship and recognition</li>
                <li>Be part of a movement shaping the future of football</li>
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
