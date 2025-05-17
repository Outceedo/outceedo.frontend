import { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import { MoveLeft } from "lucide-react";
interface Country {
  idd: {
    root: string;
    suffixes: string[];
  };
  cca2: string;
  name: {
    common: string;
  };
}

export default function SponsorshipForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    profession: '',
    teamName: '',
    email: '',
    countryCode: '',
    phone: '',
    reason: '',
    standout: '',
    sponsorshipTypes: [] as string[],
    website: '',
    otherInfo: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((res) => res.json())
      .then((data) => {
        const withDial = data.filter((c: Country) => c.idd && c.idd.root && c.idd.suffixes?.length);
        const sorted = withDial.sort((a: Country, b: Country) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      });
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: boolean } = {};
    Object.keys(form).forEach((key) => {
      if (!form[key as keyof typeof form] || (Array.isArray(form[key as keyof typeof form]) && form[key as keyof typeof form].length === 0)) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log(form);
  };

  const filteredCountries = countries.filter(c => {
    const dial = `${c.idd.root}${c.idd.suffixes[0]}`;
    return dial.includes(countrySearch) || c.name.common.toLowerCase().includes(countrySearch.toLowerCase());
  });

  const inputClass = (name: string) => `border p-2 rounded w-full ${errors[name] ? 'border-red-500' : ''}`;
  const labelClass = (name: string) => `block mb-1 font-medium ${errors[name] ? 'text-red-600' : ''}`;
  const navigate = useNavigate();
  return (
    <div>
    <button
    onClick={() => navigate(-1)}
    className="text-3xl font-bold cursor-pointer"
  >
    <MoveLeft />
  </button>
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-xl font-semibold text-center mb-4">Athlete/Team Sponsorship Application</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">Please fill in the required information below.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass('firstName')}>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass('firstName')} />
          </div>
          <div>
            <label className={labelClass('lastName')}>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass('lastName')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass('profession')}>Profession</label>
            <input name="profession" value={form.profession} onChange={handleChange} className={inputClass('profession')} />
          </div>
          <div>
            <label className={labelClass('teamName')}>Team/Club Name</label>
            <input name="teamName" value={form.teamName} onChange={handleChange} className={inputClass('teamName')} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  {/* Email */}
  <div>
    <label className={labelClass('email')}>Email</label>
    <input
      name="email"
      value={form.email}
      onChange={handleChange}
      className={inputClass('email')}
    />
  </div>
  <div className="flex gap-4 items-end">
  {/* Country Code */}
  <div className="w-40">
    <label className={labelClass('countryCode')}> Country Code</label>
    <input
      type="text"
      className={`border p-2 rounded w-full ${errors.countryCode ? 'border-red-500' : ''}`}
      value={countrySearch}
      placeholder="+XX"
      onFocus={() => setShowDropdown(true)}
      onChange={(e) => {
        setCountrySearch(e.target.value);
        setErrors(prev => ({ ...prev, countryCode: false }));
      }}
    />
    {showDropdown && (
      <div className="absolute bg-white border w-52 max-h-60 overflow-auto z-10 shadow-md mt-1">
        {filteredCountries.map((c) => (
          <div
            key={c.cca2}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              const code = `${c.idd.root}${c.idd.suffixes[0]}`;
              setForm(prev => ({ ...prev, countryCode: code }));
              setCountrySearch(code);
              setShowDropdown(false);
            }}
          >
            {`${c.idd.root}${c.idd.suffixes[0]} (${c.name.common})`}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Phone Number */}
  <div className="w-full ">
    <label className={labelClass('phone')}>Phone Number</label>
    <input
      name="phone"
      value={form.phone}
      onChange={(e) => {
        const numeric = e.target.value.replace(/\D/g, '');
        if (numeric.length <= 10) {
          setForm(prev => ({ ...prev, phone: numeric }));
          setErrors(prev => ({ ...prev, phone: false }));
        }
      }}
      className={inputClass('phone')}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={10}
      placeholder="Enter 10-digit number"
    />
  </div>
</div>
</div>
        <label className={labelClass('reason')}>Why do you require sponsorship?</label>
        <textarea name="reason" value={form.reason} onChange={handleChange} className={`${inputClass('reason')} h-20`} />

        <label className={labelClass('standout')}>What makes you stand out from other athletes/teams?</label>
        <textarea name="standout" value={form.standout} onChange={handleChange} className={`${inputClass('standout')} h-20`} />

        <div>
          <p className={`${errors.sponsorshipTypes ? 'text-red-600' : ''} mb-2`}>What kind of sponsorship do you prefer?</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sponsorshipType"
                value="Product"
                checked={form.sponsorshipTypes[0] === 'Product'}
                onChange={() => {
                  setForm(prev => ({ ...prev, sponsorshipTypes: ['Product'] }));
                  setErrors(prev => ({ ...prev, sponsorshipTypes: false }));
                }}
              />
              Product
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sponsorshipType"
                value="Money"
                checked={form.sponsorshipTypes[0] === 'Money'}
                onChange={() => {
                  setForm(prev => ({ ...prev, sponsorshipTypes: ['Money'] }));
                  setErrors(prev => ({ ...prev, sponsorshipTypes: false }));
                }}
              />
              Money (Cash/Gift Card/Professional Fees)
            </label>
          </div>
        </div>

        <label className={labelClass('website')}>Your website or social media profile</label>
        <input name="website" value={form.website} onChange={handleChange} placeholder="Link" className={inputClass('website')} />

        <label className={labelClass('otherInfo')}>Other useful information</label>
        <textarea name="otherInfo" value={form.otherInfo} onChange={handleChange} className={`${inputClass('otherInfo')} h-20`} />

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="w-48 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded text-lg">
            Apply
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
