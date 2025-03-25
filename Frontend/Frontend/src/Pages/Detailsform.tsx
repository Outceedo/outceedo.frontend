



import React, { ChangeEvent, useState, useEffect } from "react";

import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as countryCodes from "country-codes-list";



interface Country {
  name: string;
  iso2: string;
  flag: string;
  dialCode: string;
}

interface CityResponse {
  data: { country: string; cities: string[] }[];
}
interface Certificate {
    id: number;
  }
   interface Award {
    id: number;
  }
const Detailsform: React.FC = () => {
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const [text, setText] = useState<string>("");
  const [certificates, setCertificates] = useState<Certificate[]>([{ id: 1 }]);
  const [awards, setAwards] = useState<Award[]>([{ id: 1 }]);
  const addCertificate = () => {
    setCertificates([...certificates, { id: Date.now() }]);
  };

  const removeCertificate = (id: number) => {
    if (certificates.length > 1) {
      setCertificates(certificates.filter(cert => cert.id !== id));
    }
  };

  const addAward = () => {
    setAwards([...awards, { id: Date.now() }]);
  };

  const removeAward = (id: number) => {
    if (awards.length > 1) {
      setAwards(awards.filter(award => award.id !== id));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    const words = inputText.trim().split(/\s+/);

    if (words.length <= 250 || inputText === "") {
      setText(inputText);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
    <div className="flex flex-col items-center mb-12">
      <div className="flex w-full max-w-lg items-center relative">
        {/* Step 1 */}
        <div className="relative flex flex-col items-center w-1/4">
          <div className={`w-8 h-8 ${step >= 1 ? 'bg-red-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>1</div>
        </div>
        {/* Line Between Step 1 & Step 2 */}
        <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
          <div className={`absolute top-0 left-0 h-1 rounded-full ${step >= 2 ? 'bg-red-500 w-full' : 'w-0'} transition-all duration-500`}></div>
        </div>
        {/* Step 2 */}
        <div className="relative flex flex-col items-center w-1/4">
          <div className={`w-8 h-8 ${step >= 2 ? 'bg-red-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>2</div>
        </div>
        {/* Line Between Step 2 & Step 3 */}
        <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
          <div className={`absolute top-0 left-0 h-1 rounded-full ${step >= 3 ? 'bg-red-500 w-full' : 'w-0'} transition-all duration-500`}></div>
        </div>
        {/* Step 3 */}
        <div className="relative flex flex-col items-center w-1/4">
          <div className={`w-8 h-8 ${step >= 3 ? 'bg-red-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>3</div>
        </div>
        {/* Line Between Step 2 & Step 3 */}
        <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
          <div className={`absolute top-0 left-0 h-1 rounded-full ${step >= 4 ? 'bg-red-500 w-full' : 'w-0'} transition-all duration-500`}></div>
        </div>
        {/* Step 4 */}
        <div className="relative flex flex-col items-center w-1/4">
          <div className={`w-8 h-8 ${step >= 4 ? 'bg-red-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>4</div>
        </div>
      </div>
      {/* Labels Below Steps */}
      <div className="flex w-full max-w-lg justify-between mt-2">
        <div className="w-1/4 text-center text-sm font-medium">Personal Details</div>
        <div className="w-1/4 text-center text-sm font-medium">More Details</div>
        <div className="w-1/4 text-center text-sm font-medium">Certification/Awards</div>
        <div className="w-1/4 text-center text-sm font-medium">Links</div>
      </div>
    </div>
    {step === 1 && <Step1 handleChange={handleChange} text={text}  />}
    {step === 2 && <Step2 handleChange={handleChange} text={text} />}
    {step === 3 && (<Step3 certificates={certificates} addCertificate={addCertificate} removeCertificate={removeCertificate} awards={awards} addAward={addAward}  removeAward={removeAward}  />)}
    {step === 4 && <Step4 />}
    <div className="flex justify-end mt-6 space-x-4">
      {step > 1 && <button onClick={prevStep} className="border border-customGrey text-black px-4 py-2 rounded">Back</button>}
      <button onClick={nextStep} className="bg-customYellow text-black px-4 py-2 rounded">{step === 4 ? "Submit" : "Save & Next"}</button>
    </div>
  </div>

  );
};
// step 1 personal details form

const Step1: React.FC<{ handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; text: string }> = ({ handleChange, text }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File size should not exceed 2MB.");
        return;
      }
      setErrorMessage(""); // Clear error if file is within limit
      console.log("File uploaded:", file.name);
    }
  };

  return (

  <div>
    <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
    <label className="block text-grey mb-1">Profile Picture</label>
<div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
<span className="text-gray-500">Upload a photo here, max size 2MB</span>
      <input
        type="file"
        id="fileUpload"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <button
        className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold"
        onClick={() => document.getElementById("fileUpload")?.click()}
      >
        Browse
      </button>
      {errorMessage && <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>}
</div>

<div className="flex space-x-4 mb-2">
  <div className="w-1/2">
    <label className="block text-black mb-1">First Name</label>
    <input type="text" placeholder="First Name" className="border p-2 w-full rounded" />
  </div>
  <div className="w-1/2">
    <label className="block text-black mb-1">Last Name</label>
    <input type="text" placeholder="Last Name" className="border p-2 w-full rounded" />
  </div>
</div>
<div className="flex space-x-4 mb-2">
  <div className="w-1/2">
    <label className="block text-black mb-1">Profession</label>
    <select className="border p-2 w-full rounded">
      <option>Select </option>
          </select>
  </div>
  <div className="w-1/2">
    <label className="block text-black mb-1">Sub Profession</label>
    <select className="border p-2 w-full rounded">
      <option>Select </option>
        </select>
  </div>
</div>
<div className="flex space-x-4 mb-2">
  <div className="w-1/3">
    <label className="block text-black mb-1">Age</label>
    <input list="ageOptions" className="border p-2 w-full rounded" placeholder="Select or Type Age" />
    <datalist id="ageOptions">
      {Array.from({ length: 100 }, (_, i) => (
        <option key={i + 1} value={i + 1} />
      ))}
    </datalist>
  </div>
  <div className="w-1/3">
    <label className="block text-black mb-1">Birth Year</label>
    <input list="yearOptions" className="border p-2 w-full rounded" placeholder="Select or Type Year" />
    <datalist id="yearOptions">
      {Array.from({ length: 100 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return <option key={year} value={year} />;
      })}
    </datalist>
  </div>
  <div className="w-1/3">
    <label className="block text-black mb-1">Gender</label>
    <input list="genderOptions" className="border p-2 w-full rounded" placeholder="Select or Type Gender" />
    <datalist id="genderOptions">
      <option value="Male" />
      <option value="Female" />
      <option value="Other" />
      <option value="Prefer not to say" />
    </datalist>
      </div>
</div>

<div className="flex space-x-4 mb-2">
<div className="w-1/3">
    <label className="block text-black mb-1">Languages</label>
    <input type="text" placeholder="Language" className="border p-2 w-full rounded" />
  </div>
  <div className="w-1/3">
    <label className="block text-black mb-1">Height (cm)</label>
    <input type="text" placeholder="Height" className="border p-2 w-full rounded" />
  </div>
  <div className="w-1/3">
    <label className="block text-black mb-1">Weight (kg)</label>
    <input type="text" placeholder="Weight" className="border p-2 w-full rounded" />
  </div>
</div>
</div>
);
};
// step 2
const Step2: React.FC<{ handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; text: string }> = ({ handleChange, text }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [dialCode, setDialCode] = useState<string>(""); // Default country code
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [showDialCodeDropdown, setShowDialCodeDropdown] = useState<boolean>(false);
   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File size should not exceed 2MB.");
        return;
      }
      setErrorMessage(""); // Clear error if file is within limit
      console.log("File uploaded:", file.name);
    }
  };
  
  // Fetch countries with flags
  useEffect(() => {
    const fetchCountries = async (): Promise<void> => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        setCountries(
          data.map((country: any) => ({
            name: country.name.common,
            iso2: country.cca2,
            flag: country.flags.svg,
            dialCode: country.idd.root
              ? `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ""}`
              : "+1",
          }))
        );
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country is selected
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchCities = async () => {
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries");
        if (!response.ok) throw new Error("Failed to fetch cities");

        const cityData: CityResponse = await response.json();
        const countryCities = cityData.data.find(
          (c) => c.country.toLowerCase() === selectedCountry.name.toLowerCase()
        );

        setCities(countryCities ? countryCities.cities : []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  return (

  <div>
    <h2 className="text-xl font-semibold mb-2">More Details</h2>
    <label className="block text-grey mb-1">Professional Picture</label>
<div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
<span className="text-gray-500">Upload a photo here, max size 2MB</span>
      <input
        type="file"
        id="fileUpload"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <button
        className="absolute right-2 bg-lightYellow text-black-500 px-3 py-1 rounded text-sm font-semibold"
        onClick={() => document.getElementById("fileUpload")?.click()} >
        Browse
      </button>
      {errorMessage && <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>}
</div>
<div className="flex space-x-4 mb-2">
        <div className="w-1/2 relative">
        <label className="block text-black mb-1">Country</label>
        <input
          type="text"
          placeholder="Search Country"
          className="border p-2 w-full rounded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowCountryDropdown(true);
          }}
          onFocus={() => setShowCountryDropdown(true)}
        />
        {showCountryDropdown && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
            {countries
              .filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((country, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelectedCountry(country);
                    setDialCode(country.dialCode);
                    setSearchTerm(country.name);
                    setShowCountryDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                >
                  <img src={country.flag} alt={country.name} className="w-6 h-4 mr-2" />
                  {country.name}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* City Section */}
      <div className="w-1/2 relative">
        <label className="block text-black mb-1">City</label>
        <input
          type="text"
          placeholder="Search City"
          className="border p-2 w-full rounded"
          value={citySearchTerm}
          onChange={(e) => {
            setCitySearchTerm(e.target.value);
            setShowCityDropdown(true);
          }}
          onFocus={() => setShowCityDropdown(true)}
        />
        {showCityDropdown && selectedCountry && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
            {cities
              .filter((city) => city.toLowerCase().includes(citySearchTerm.toLowerCase()))
              .map((city, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCitySearchTerm(city);
                    setShowCityDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {city}
                </li>
              ))}
          </ul>
        )}
        </div>
      </div>
      <div className="flex space-x-4 mb-2">
  <div className="w-1/2">
    <label className="block text-black mb-1">Football club</label>
    <select className="border p-2 w-full rounded">
      <option>Select </option>
          </select>
  </div>
<div className="w-1/2">
<label className="block text-black mb-1">Mobile Number</label>
        <div className="flex relative">
          <input
            type="text"
            value={dialCode}
            placeholder="country code"
            onChange={(e) => setDialCode(e.target.value)}
            className="border p-2 w-1/3 rounded-l text-center"
            onFocus={() => setShowDialCodeDropdown(true)}
          />
          {showDialCodeDropdown && (
            <ul className="absolute w-1/3 bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10">
              {countries.map((country, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setDialCode(country.dialCode);
                    setShowDialCodeDropdown(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                >
                  <img src={country.flag} alt={country.name} className="w-6 h-4 mr-2" />
                  {country.dialCode}
                </li>
              ))}
            </ul>
          )}
          <input type="text" placeholder="Mobile Number" className="border p-2 w-2/3 rounded-r" maxLength={10} />
          </div>
      </div>
      </div>
      <div className="relative w-full">
  <label className="block text-black mb-1">Bio Data</label>
  <textarea
    placeholder="Enter your Bio Data"
    className="border p-2 w-full rounded resize-none"
    value={text}
    onChange={handleChange}
    rows={4} // Allows multiline input
  />
  <span className="absolute right-4 bottom-2 text-gray-500 text-sm">
    {text.trim() ? text.trim().split(/\s+/).length : 0}/250
  </span>
</div>
  </div>
);
};
// step 3 uploading certification/awards
interface Step3Props {
    certificates: Certificate[];
    addCertificate: () => void;
    removeCertificate: (id: number) => void;
    awards: Award[];
    addAward: () => void;
    removeAward: (id: number) => void;
  }
  const Step3: React.FC<Step3Props> = ({ certificates, addCertificate,removeCertificate, awards, addAward,removeAward }) => {
    return (
  
<div>
      <h2 className="text-xl font-semibold mb-4">Certification</h2>
      {certificates.map((cert) => (
        <div key={cert.id} className="relative mb-4 border p-4 rounded shadow">
          {certificates.length > 1 && (
            <button className="absolute -top-2 right-2 text-red-500 text-lg" onClick={() => removeCertificate(cert.id)}>×</button>
          )}
          <div className="relative border-4 border-dotted border-gray-400 p-2 w-full mb-2 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Upload certificate here</span>
            <input type="file" id={`fileUpload-${cert.id}`} className="hidden" accept="image/*" />
            <button className="absolute right-2 bg-lightYellow text-black px-3 py-1 rounded text-sm font-semibold" onClick={() => document.getElementById(`fileUpload-${cert.id}`)?.click()}>
              Browse
            </button>
          </div>
          <label className="block text-black mb-1">Certificate Name</label>
          <input type="text" placeholder="Certificate Name" className="border p-2 w-full rounded mb-2" />
          <label className="block text-black mb-1">Organization Name</label>
          <input type="text" placeholder="Organization Name" className="border p-2 w-full rounded mb-2" />
        </div>
      ))}
      <div className="flex justify-end">
        <button onClick={addCertificate} className="bg-lightYellow text-black px-3 py-1 rounded font-semibold">+ Add</button>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 mt-4">Awards</h2>
      {awards.map((award) => (
        <div key={award.id} className="relative mb-2 border p-4 rounded shadow">
          {awards.length > 1 && (
            <button className="absolute -top-2 right-2 text-red-500 text-lg" onClick={() => removeAward(award.id)}>×</button>
          )}
          <input type="text" placeholder="Award" className="border p-2 w-full rounded mb-2" />
        </div>
      ))}
      <div className="flex justify-end">
        <button onClick={addAward} className="bg-lightYellow text-black px-3 py-1 rounded font-semibold">+ Add</button>
      </div>
    </div>
    );
  };
  // step 4 uploading social media links
const Step4: React.FC = () => (
    <div>
    <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
    
    <div className="flex items-center w-1/2 mb-2">
    <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-3xl me-3 cursor-pointer" />
      <input type="text" placeholder="LinkedIn" className="border p-2 w-full rounded outline-none" />
    </div>

    <div className="flex items-center w-1/2 mb-2">
    <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-3xl mr-3 cursor-pointer" />
                
      <input type="text" placeholder="Facebook" className="border p-2 w-full rounded outline-none" />
    </div>

    <div className="flex items-center w-1/2 mb-2">
    <FontAwesomeIcon icon={faFacebook} className="text-blue-800 text-3xl mr-3 cursor-pointer" />
                
      <input type="text" placeholder="Instagram" className="border p-2 w-full rounded outline-none" />
    </div>

    <div className="flex items-center w-1/2 mb-2">
    <FontAwesomeIcon icon={faTwitter}  className="text-blue-600 text-3xl mr-3 cursor-pointer" />
      <input type="text" placeholder="Twitter" className="border p-2 w-full rounded outline-none" />
    </div>
  </div>
);

export default Detailsform;


function setCities(arg0: any): any {
  throw new Error("Function not implemented.");
}

 
                
                