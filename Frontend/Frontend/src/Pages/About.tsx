import aboutimg from "../assets/images/aboutimg.jpg";

const About:React.FC = () =>{
    return(
      <>
         {/* About Section */}
      <div id="about" className="px-4 sm:px-8 md:px-16 lg:px-40 mt-24">
        {/* Container for the content */}
        <div className="flex flex-col md:flex-row items-center bg-[#FFF8DA] p-4 md:p-12 rounded-xl shadow-lg">
          
          {/* Left Content */}
          <div className="md:w-1/2 text-left mb-6 md:mb-0">
            <h4 className="text-[#FE221E] bg font-semibold font-Raleway">Why Choose Us</h4>
            <h2 className="text-2xl font-bold text-gray-900 mt-2 font-Opensans">Lorem ipsum dolor sit amet pretium</h2>
            <p className="text-gray-600 mt-4 font-Opensans">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem consectetur adipiscing elit.Lorem ipsum dolor sit amet pretium consectetur adipiscing elit. Lorem consectetur adipiscing elit.
            </p>
            <p className="text-gray-600 mt-2 font-Opensans">
              Lorem ipsum dolor sit amet pretium consectetur adipiscing elit. Lorem consectetur adipiscing elit.Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.
            </p>
            <button className="mt-4 bg-[#FE221E] text-white px-6 py-2 rounded-lg hover:bg-red-500 transition font-Raleway">
              Get Started
            </button>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 mt-6 md:mt-0 md:ml-6">
            <img
              src={aboutimg}
              alt="Soccer Ball in Goal"
              className="rounded-lg shadow-md w-full md:w-96 mx-auto" 
            />
          </div>
        </div>
      </div>

      </>
    )
}
export default About

