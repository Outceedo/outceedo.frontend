import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoIosRefresh } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

interface SponsorCardProps {
  name: string;
  company: string;
  description: string;
  rating: number;
  sponsoredCount: number;
  imageUrl: string;
  country: string;
  fundingType: string;
  fundingRange: string;
}

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

const SponsorCard = ({ name, company, description, rating, sponsoredCount, imageUrl }: SponsorCardProps) => {
    const navigate = useNavigate();
     return (
    <div className="flex gap-4 p-4 border rounded-lg shadow-sm bg-white">
      <img src={imageUrl} alt="Sponsor" className="w-24 h-24 object-cover rounded-md" />
      <div className="flex-1">
        <h2 className="font-semibold text-lg">{name}</h2>
        <p className="text-sm text-gray-500">{company}</p>
        <p className="text-sm mt-2 text-gray-700">{description}</p>
        <div className="flex items-center mt-2">
          <FaStar className="text-yellow-500 mr-1" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-gray-500 ml-2">(Sponsored-{sponsoredCount} players)</span>
        </div>
      </div>
      <div className="flex flex-row justify-between items-start gap-5">
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition" onClick={() => navigate("/player/sponsor_application")}>View More</button>
        <button className="text-gray-500 text-xl font-bold px-2">...</button>
      </div>
    </div>
  );
};

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<SponsorCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedFundingType, setSelectedFundingType] = useState("");
  const [selectedFundingRange, setSelectedFundingRange] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const data = Array(4).fill({
      name: 'William',
      company: 'Company Name',
      description:
        'I, William, a British citizen residing in London, am sponsoring my cousin Riya Sharma for her UK visit and will provide full financial and accommodation support.',
      rating: 4.5,
      sponsoredCount: 10,
      imageUrl: 'https://via.placeholder.com/100x100',
      country: 'Canada',
      fundingType: 'Type A',
      fundingRange: '10K-50K',
    });
    setSponsors(data);
  }, []);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      });
  }, []);

  const handleClear = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedFundingType("");
    setSelectedFundingRange("");
  };

  const filteredSponsors = sponsors.filter((s) => {
    return (
      (!searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCountry || s.country === selectedCountry) &&
      (!selectedFundingType || s.fundingType === selectedFundingType) &&
      (!selectedFundingRange || s.fundingRange === selectedFundingRange)
    );
  });

  return (
    <div className="p-6 w-full mx-auto">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search company / person"
          className="border p-2 rounded w-full sm:w-60"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="border p-2 rounded w-full sm:w-52" value={selectedFundingRange} onChange={(e) => setSelectedFundingRange(e.target.value)}>
          <option value="">Funding Range</option>
          <option value="10K-50K">10K-50K</option>
          <option value="50K-100K">50K-100K</option>
        </select>
        <select className="border p-2 rounded w-full sm:w-52" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c.cca2} value={c.name.common}>{c.name.common}</option>
          ))}
        </select>
        <select className="border p-2 rounded w-full sm:w-52" value={selectedFundingType} onChange={(e) => setSelectedFundingType(e.target.value)}>
          <option value="">Funding Type</option>
          <option value="Type A">Type A</option>
          <option value="Type B">Type B</option>
        </select>
        <button className="border flex items-center gap-2 text-sm px-8 py-2 bg-gray-100 rounded hover:bg-gray-200" onClick={handleClear}>
          <span>Clear</span>
          <IoIosRefresh />
        </button>
      </div>

      {/* Sponsor List */}
      <div className="space-y-4">
        {filteredSponsors.map((sponsor, index) => (
          <SponsorCard key={index} {...sponsor} />
        ))}
      </div>
    </div>
  );
}
