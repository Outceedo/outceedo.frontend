import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';



interface FormData {
  teamName: string;
  type: string;
  firstName: string;
  lastName: string;
  clubName: string;
  city: string;
  country: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  bio: string;
  socialLinks: {
    instagram: string;
    linkedin: string;
    facebook: string;
    twitter: string;
  };

}

export default function TeamDetailsForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const goBack = () => {
  navigate(-1); // goes to previous page
};
  

  const [form, setForm] = useState<FormData>({
  teamName: '',
    type: '',
    firstName: '',
    lastName: '',
    clubName: '',
    city: '',
    country: '',
    address: '',
    countryCode: '+91',
    phone: '',
    email: '',
    bio: '',
    socialLinks: {
      instagram: '',
      linkedin: '',
      facebook: '',
      twitter: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handling nested socialLinks
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitForm = () => {
    setIsSubmitting(true);
    console.log('Form Submitted:', form);

    setTimeout(() => {
      setIsSubmitting(false);
      alert('Form submitted successfully!');
      navigate('/thank-you'); // redirect if needed
    }, 1000);
  };

  return (
    <div className="w-full p-20 mx-auto dark:bg-gray-900">
    <button
  onClick={goBack}
  className="flex items-center text-gray-700 hover:text-black text-sm font-medium mb-4 dark:text-white cursor-pointer"
>
  <ArrowLeft className="w-5 h-5 mr-1" />
  
</button>

      {/* Step Indicator */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex w-full max-w-lg items-center relative">
          {[1, 2].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className="relative flex flex-col items-center w-1/4">
                <div
                  className={`w-8 h-8 ${
                    step >= stepNum ? 'bg-red-500' : 'bg-gray-300'
                  } rounded-full flex items-center justify-center text-white font-bold text-sm`}
                >
                  {stepNum}
                </div>
              </div>
              {stepNum < 2 && (
                <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
                  <div
                    className={`absolute top-0 left-0 h-1 rounded-full ${
                      step > stepNum ? 'bg-red-500 w-full' : 'w-0'
                    } transition-all duration-500`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex w-full max-w-lg justify-between mt-2 ">
          <div className="w-1/4 text-center text-sm font-medium">Profile Details</div>
          <div className="w-1/4 text-center text-sm font-medium">More Details</div>
        </div>
      </div>

      {/* Step 1: Profile Details */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
          <Label className="text-sm text-gray-400 mb-1">PROFILE PICTURE</Label>
          <Card className="border-dashed border border-gray-300 p-4 w-5/6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xl">🖼️</span>
              </div>
              <span className="text-sm text-gray-700">
                Upload a profile picture. Max size 2MB
              </span>
              <label className="cursor-pointer px-4 py-2 bg-gray-100 border rounded text-sm text-gray-700 hover:bg-gray-200">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Selected file:', file);
                    }
                  }}
                />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Team Name</label>
    <select
      name="sponsorType"
      value={form.teamName}
      onChange={handleChange}
      className="border p-2 rounded text-sm text-gray-700 w-full"
    >
      <option value="">option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </select>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Type</label>
    <select
      name="sportInterest"
      value={form.type}
      onChange={handleChange}
      className="border p-2 rounded text-sm text-gray-700 w-full"
    >
      <option value="">Dropdown</option>
      <option value="football">option 1</option>
      <option value="tennis">option 2</option>
    </select>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">First Name</label>
    <Input name="firstName" value={form.firstName} onChange={handleChange} />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
    <Input name="lastName" value={form.lastName} onChange={handleChange} />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Club Name</label>
    <Input name="companyName" value={form.clubName} onChange={handleChange} />
  </div>

  

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Country</label>
    <select
      name="country"
      value={form.country}
      onChange={handleChange}
      className="border p-2 rounded text-sm text-gray-700 w-full"
    >
      <option value="">Select Country</option>
      <option value="India">India</option>
      <option value="UK">UK</option>
    </select>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">City</label>
    <select
      name="city"
      value={form.city}
      onChange={handleChange}
      className="border p-2 rounded text-sm text-gray-700 w-full"
    >
      <option value="">Select City</option>
      <option value="Delhi">Delhi</option>
      <option value="London">London</option>
    </select>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Address</label>
    <Input name="address" placeholder="Street no." value={form.address} onChange={handleChange} />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Country Code</label>
    <select
      name="countryCode"
      value={form.countryCode}
      onChange={handleChange}
      className="border p-2 rounded text-sm text-gray-700 w-full"
    >
      <option value="+91">+91</option>
      <option value="+1">+1</option>
    </select>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
    <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-900 dark:text-white">Email</label>
    <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
  </div>
</div>


          <div className="text-right mt-6">
            <Button onClick={nextStep} className="bg-yellow-400 text-white hover:bg-amber-500 cursor-pointer">
              Save & Next
            </Button>
          </div>
        </>
      )}

      {/* Step 2: More Details */}
      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">More Details</h2>
         

<label className="text-sm font-medium text-gray-900 dark:text-white">Bio Data</label>
          <Textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="mb-6"
            placeholder="Bio data"
            maxLength={500}
          />

          <Label className="text-md font-semibold mb-2 dark:text-white">Social Media Links</Label>
          <div className="space-y-4 mt-4">
          
         {[
  {
    icon: faInstagram,
    name: 'instagram',
    bg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  },
  {
    icon: faLinkedinIn,
    name: 'linkedin',
    bg: 'bg-blue-700',
  },
  {
    icon: faFacebookF,
    name: 'facebook',
    bg: 'bg-blue-600',
  },
  {
    icon: faXTwitter,
    name: 'twitter',
    bg: 'bg-black',
  },
].map((social) => (
  <div key={social.name} className="flex items-center gap-3">
    <div className={`w-10 h-10 flex items-center justify-center border rounded ${social.bg}`}>
      <FontAwesomeIcon icon={social.icon} className="w-6 h-6 text-white" />
    </div>
    <Input
      name={`socialLinks.${social.name}`}
      value={form.socialLinks[social.name as keyof typeof form.socialLinks]}
      onChange={handleChange}
      className=" w-full px-4 py-2 "
      placeholder={`Your ${social.name} link`}
    />
  </div>
))}


          </div>

          {/* Navigation Buttons */}
          <div className="flex  justify-end  mt-6 ">
            <Button
              onClick={prevStep}
              className="border border-gray-400 text-black bg-amber-50 hover:bg-amber-50 rounded mr-9 cursor-pointer"
              disabled={isSubmitting}
              type="button"
            >
              Back
            </Button>

            <Button
              onClick={submitForm}
              className="bg-yellow-400 text-white hover:bg-yellow-500 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
