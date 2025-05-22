import { useEffect, useState } from 'react';
import { IoIosRefresh } from 'react-icons/io';
import sponsor2 from '../assets/images/sponsor2.jpg';
import { Card, CardContent } from '@/components/ui/card';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationForm from '../expertpages/ApplicationForm';
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

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<SponsorCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedFundingType, setSelectedFundingType] = useState('');
  const [selectedFundingRange, setSelectedFundingRange] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const navigate = useNavigate();

  const openReportModal = () => setIsReportOpen(true);
  const closeReportModal = () => setIsReportOpen(false);

  const handleClick = () => {
    navigate('/sponsor/Sponsorinfo');
  };

  // Initialize sponsors data
  useEffect(() => {
    const data = Array(4).fill({
      name: 'William',
      company: 'Company Name',
      description:
        'I, William, a British citizen residing in London, am sponsoring my cousin Riya Sharma for her UK visit and will provide full financial and accommodation support.',
      rating: 4.5,
      sponsoredCount: 10,
      imageUrl: sponsor2,
      country: 'Canada',
      fundingType: 'Type A',
      fundingRange: '10K-50K',
    });
    setSponsors(data);
  }, []);

  // Fetch list of countries
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((res) => res.json())
      .then((data: Country[]) => {
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      });
  }, []);

  // Clear filters
  const handleClear = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedFundingType('');
    setSelectedFundingRange('');
  };

  // Filter sponsors based on inputs
  const filteredSponsors = sponsors.filter((s) => {
    return (
      (!searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
        <select
          className="border p-2 rounded w-full sm:w-52"
          value={selectedFundingRange}
          onChange={(e) => setSelectedFundingRange(e.target.value)}
        >
          <option value="">Funding Range</option>
          <option value="10K-50K">10K-50K</option>
          <option value="50K-100K">50K-100K</option>
        </select>
        <select
          className="border p-2 rounded w-full sm:w-52"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c.cca2} value={c.name.common}>
              {c.name.common}
            </option>
          ))}
        </select>
        <select
          className="border p-2 rounded w-full sm:w-52"
          value={selectedFundingType}
          onChange={(e) => setSelectedFundingType(e.target.value)}
        >
          <option value="">Funding Type</option>
          <option value="Type A">Type A</option>
          <option value="Type B">Type B</option>
        </select>
        <button
          className="border flex items-center gap-2 text-sm px-8 py-2 bg-gray-100 rounded hover:bg-gray-200"
          onClick={handleClear}
        >
          <span>Clear</span>
          <IoIosRefresh />
        </button>
      </div>

      {/* Sponsor List */}
      {filteredSponsors.map((sponsor, idx) => (
        <Card
          key={idx}
          className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 dark:bg-gray-800"
        >
          <img
            src={sponsor.imageUrl}
            alt={sponsor.name}
            className="w-58 h-28 object-fill rounded-md"
          />
          <CardContent className="flex-1 p-0">
            <h2 className="text-lg font-semibold">{sponsor.name}</h2>
            <p className="text-sm text-gray-600 dark:text-white">
              {sponsor.company}
            </p>
            <p className="text-sm mt-1">{sponsor.description}</p>
            <div className="flex items-center mt-2 text-sm text-gray-700">
              <div className="flex items-center text-yellow-400 mr-2">
                {Array.from({ length: Math.floor(sponsor.rating) }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400"
                    />
                  )
                )}
              </div>
              <span className="text-yellow-400 text-lg">{sponsor.rating}</span>
              <span className="ml-2 text-gray-500 dark:text-white">
                (Sponsored - {sponsor.sponsoredCount} players)
              </span>
            </div>
          </CardContent>
          <div className="flex flex-row justify-start items-start gap-5">
            <Button
              onClick={handleClick}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              View More
            </Button>
            <Button
              variant="ghost"
              className="text-2xl font-bold bg-gray-100 text-gray-800 flex items-center justify-center"
              onClick={openReportModal}
            >
              ...
            </Button>
            {isReportOpen && (
              <div className="fixed inset-0 z-50 bg-white flex flex-col dark:bg-gray-800">
                <div className="flex justify-end p-4">
                  <button onClick={closeReportModal}>
                    <X className="w-7 h-7 cursor-pointer text-gray-800 hover:text-black dark:text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-md mx-8 my-6 p-6">
                  <ApplicationForm />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

