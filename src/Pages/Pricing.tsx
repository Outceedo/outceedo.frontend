


const Pricing:React.FC = () =>{
    return(
        <>
           {/* Pricing Section */}
    <div id="pricing" className="py-20 bg-slate-100">
    <div className="flex flex-col sm:flex-row justify-center gap-6 p-8">

    {/* Basic Plan */}
    <div className="w-full sm:w-80 lg:w-96 xl:w-96 border rounded-lg p-6 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 font-Raleway">Basic</h3>
      <p className="text-gray-600 mt-2 font-Opensans">Lorem ipsum dolor sit amet premium consectetur adipiscing elit.</p>
      <button className="w-full  bg-[#F9DC5C] font-Raleway text-black py-2 mt-4 rounded-lg font-semibold hover:bg-yellow-500 transition">
        Get Started
      </button>
      <ul className="mt-4 space-y-2 text-gray-600 font-Opensans">
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        
      </ul>
    </div>

    {/* Premium Plan */}
    <div className="w-full sm:w-80 lg:w-96 xl:w-96 border-2 bg-white border-[#FE221E] rounded-lg p-6 shadow-md relative transition-all duration-300 hover:shadow-lg">
      <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#FE221E] text-white text-sm px-3 py-1 rounded-full">
        Popular
      </span>
      <h3 className="text-xl font-semibold text-gray-800 font-Raleway">Premium</h3>
      <p className="text-gray-600 mt-2 font-Opensans">Lorem ipsum dolor sit amet premium consectetur adipiscing elit.</p>
      <button className="w-full bg-[#F9DC5C] font-Opensans text-black py-2 mt-4 rounded-lg font-semibold hover:bg-yellow-500 transition">
        Get Started
      </button>
      <ul className="mt-4 space-y-2 text-gray-600 font-Opensans">
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
        <li>✔ Lorem ipsum dolor</li>
      </ul>
    </div>

  </div>
</div>


        </>
    )
}

export default Pricing