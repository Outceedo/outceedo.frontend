import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";

const Features: React.FC = () => {
  return (
    <>
      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 font-Raleway">
              What We Offer
            </h1>
            <p className="text-lg mb-16 font-Opensans">
              We are a passionate team dedicated to providing the best service
              and products for our users.<br></br> Our mission is to
              revolutionize the industry with cutting-edge solutions and a
              user-centric approach.
            </p>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col sm:flex-row justify-center space-y-8 sm:space-x-8 sm:space-y-0 w-10/11 mx-auto">
            {/* Card 1 */}
            <div className="flex flex-col items-center p-6 text-center sm:w-auto">
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ fontSize: "100px", color: "#0a0a0a" }}
              />
              <h3 className="text-xl font-semibold mt-4">Football</h3>
              <p className="text-md mt-2">
                This is some text about the football service we offer. Great
                feature for users!
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center p-6 text-center w-full sm:w-auto">
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ fontSize: "100px", color: "#0a0a0a" }}
              />
              <h3 className="text-xl font-semibold mt-4">Football</h3>
              <p className="text-md mt-2">
                This is another exciting feature related to football.
                Revolutionizing the game!
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-center p-6 text-center w-full sm:w-auto">
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ fontSize: "100px", color: "#0a0a0a" }}
              />
              <h3 className="text-xl font-semibold mt-4">Football</h3>
              <p className="text-md mt-2">
                More insights into the football-related features we bring to the
                table.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;
