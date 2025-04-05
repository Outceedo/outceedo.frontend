const About: React.FC = () => {
  return (
    <>
      {/* About Section */}
      <section
        className="bg-[#FFF8DA] py-6 px-12 md:px-8 rounded-2xl max-w-5xl mx-auto mb-6"
        id="about"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:gap-28 items-center">
            <div className="w-full md:w-1/2 px-4">
              <h3 className="text-red-600 font-medium text-xl mb-3">
                Why Choose Us
              </h3>
              <h2 className="text-[#0a192f] text-3xl md:text-4xl font-bold mb-6">
                Lorem ipsum dolor sit amet pretium
              </h2>
              <div className="space-y-6">
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet pretium consectetur adipiscing
                  elit. Lorem consectetur adipiscing elit.Lorem ipsum dolor sit
                  amet pretium consectetur adipiscing elit. Lorem consectetur
                  adipiscing elit.
                </p>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet pretium consectetur adipiscing
                  elit. Lorem consectetur adipiscing elit. Lorem ipsum dolor sit
                  amet pretium consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="w-1/2 md:w-1/3 hidden md:block">
              <img
                src="src/assets/images/aboutimg.jpg"
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
