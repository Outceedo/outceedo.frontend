import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Contact:React.FC = () =>{
    return(
        <>
        {/* Contact Section */}
        <div id="contact" className="py-20 bg-white">
          <div className="bg-[#f8fefa] p-10">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
              {/* Get in Touch Section */}
              <div className="bg-[#FFF8DA]  p-6 rounded-lg">
                <h2 className="text-lg font-bold font-Raleway">Get in Touch</h2>
                <div className="mt-4">
                  <p className="font-semibold font-Raleway">Visit us</p>
                  <p className="text-gray-600 font-Opensans">Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.</p>
                </div>
                <div className="mt-4">
                  <p className="font-semibold">Chat to us</p>
                  <p className="text-gray-600 font-Opensans">Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.</p>
                </div>
                <div className="mt-4">
                  <p className="font-semibold">Call us</p>
                  <p className="text-gray-600 font-Opensans">Lorem ipsum dolor sit amet pretium consectetur adipiscing elit.</p>
                </div>
                <div className="mt-4 flex space-x-3 text-xl">
                  <FontAwesomeIcon icon={faLinkedin} className="cursor-pointer" />
                  <FontAwesomeIcon icon={faFacebook} className="cursor-pointer" />
                  <FontAwesomeIcon icon={faTwitter} className="cursor-pointer" />
                  <FontAwesomeIcon icon={faInstagram} className="cursor-pointer" />
                </div>
              </div>
        
              {/* Form Section */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="border p-2 w-full rounded font-Opensans" />
                  <input type="text" placeholder="Last Name" className="border p-2 w-full rounded font-Opensans" />
                </div>
                <input type="email" placeholder="Email id" className="border p-2 w-full rounded mt-4 font-Opensans" />
                <div className="flex gap-2 mt-4 font-Opensans">
                  <input type="text" placeholder="Code" className="border p-2 w-1/4 rounded font-Opensans" />
                  <input type="text" placeholder="Your Phone" className="border p-2 w-3/4 rounded font-Opensans" />
                </div>
                <textarea placeholder="Message" className="border p-2 w-full rounded mt-4 h-24 font-Opensans"></textarea>
                <div className="mt-2 flex items-center text-sm">
                  <input type="checkbox" className="mr-2 font-Opensans" />
                  <span>I'd like to receive more information about the company, I understand and agree to the <span className="text-blue-600">Privacy Policy</span></span>
                </div>
                <button className="w-full bg-[#FE221E] hover:bg-red-500 text-white py-2 mt-4 rounded-lg font-semibold font-Raleway">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
        
        </>
    )
}

export default Contact