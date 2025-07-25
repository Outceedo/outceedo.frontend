import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import contactus from "../../assets/images/contactform.png";
import { ArrowLeft } from "lucide-react";
import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "",
    phoneNumber: "",
    message: "",
    agreeToPolicy: false,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  // Show go back button only if url is /contactus
  const showGoBack = location.pathname === "/contactus";

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 mt-24">
        {showGoBack && (
          <button
            className="mb-4 flex items-center gap-2 text-gray-800 hover:text-red-500 font-medium"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
            Go Back
          </button>
        )}
        <div className="text-red-500 text-center p-3 text-3xl mb-8 mt-8 font-bold">
          Reach Out to us
        </div>
        <div
          className="flex flex-col md:flex-row bg-yellow-50 rounded-lg shadow-md max-w-6xl mx-8 sm:mx-auto mb-8 space-x-4 "
          id="contactus"
        >
          {/* Left Section - Get in Touch */}
          <div className="bg-yellow-50 hidden md:block md:w-1/2 rounded-l-lg">
            <img src={contactus} alt="football" />
          </div>

          {/* Right Section - Contact Form */}
          <div className="p-8 md:w-2/3 ">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Your Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Your Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email id
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="phoneCode"
                    name="phoneCode"
                    placeholder="Code"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="w-1/8 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Your Phone"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-10/11 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeToPolicy"
                  name="agreeToPolicy"
                  checked={formData.agreeToPolicy}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="agreeToPolicy"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I'd like to receive more information about company. I
                  understand and agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <OutceedoFooter />
    </>
  );
};

export default Contact;
