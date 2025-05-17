import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Instagram, Linkedin, Facebook, X } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setStep(2);
  };

  const submitForm = () => {
    console.log('Form Submitted:', form);
  };

  return (
    <div className="w-full p-20 mx-auto ">
  
        {/* Step progress */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex w-full max-w-lg items-center relative">
            {/* Step indicators */}
            {[1, 2].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className="relative flex flex-col items-center w-1/4">
                  <div
                    className={`w-8 h-8 ${
                      step >= stepNum ? "bg-red-500" : "bg-gray-300"
                    } rounded-full flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {stepNum}
                  </div>
                </div>
  
                {stepNum < 2 && (
                  <div className="flex-1 h-1 bg-gray-300 rounded-full -mx-14 relative">
                    <div
                      className={`absolute top-0 left-0 h-1 rounded-full ${
                        step > stepNum ? "bg-red-500 w-full" : "w-0"
                      } transition-all duration-500`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
  
          {/* Step labels */}
          <div className="flex w-full max-w-lg justify-between mt-2">
            <div className="w-1/4 text-center text-sm font-medium">
              Profile Details
            </div>
            <div className="w-1/4 text-center text-sm font-medium">
              More Details
            </div>
            </div>
        </div>

      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
          <Label className="text-sm text-gray-400 mb-1">PROFILE PICTURE</Label>
          <Card className="border-dashed border border-gray-300 p-4 w-3/4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xl">🖼️</span>
                  </div>
                  <span className="text-sm text-gray-700">Upload a profile picture. Max size 2MB</span>
                    <label className=" cursor-pointer px-4 py-2 bg-gray-100 border rounded text-sm text-gray-700 hover:bg-gray-200">
                  Browse
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log("Selected file:", file);
                        // You can update state or preview the image here
                      }
                    }}
                  />
                </label>
                </div>
                </Card>
          <div className="grid grid-cols-1 md:grid-cols-3  gap-6 mt-6">
            <div>
            <label className="text-sm font-medium text-gray-700">Team Name</label>
            <Input name="teamName"  value={form.teamName} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-1">
                  <label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Sport Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="border p-2 rounded text-sm text-gray-700" >
                    <option value="">Select a sport</option>
                    <option value="football">Football</option>
                    <option value="tennis">Tennis</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3  gap-6 mt-6">
                <div>
                <label htmlFor="type" className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                  </div>
            <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
            </div>
            <Input name="clubName" placeholder="Club Name" value={form.clubName} onChange={handleChange} />
            <select name="city" value={form.city} onChange={handleChange} className="border p-2 rounded">
              <option>Dropdown</option>
              <option>London</option>
              <option>Delhi</option>
            </select>
            <select name="country" value={form.country} onChange={handleChange} className="border p-2 rounded">
              <option>Dropdown</option>
              <option>India</option>
              <option>UK</option>
            </select>
            <Input name="address" placeholder="street no" value={form.address} onChange={handleChange} />
            <select name="countryCode" value={form.countryCode} onChange={handleChange} className="border p-2 rounded">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
            <Input name="email" placeholder="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="text-right mt-6">
            <Button onClick={nextStep} className="bg-yellow-500 text-white">Save & Next</Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4">More Details</h2>
          <Textarea name="bio" value={form.bio} onChange={handleChange} className="mb-6" placeholder="Bio data" maxLength={500} />

          <Label className="text-md font-semibold mb-2">Social Media Links</Label>
          <div className="space-y-4 mt-4">
            {[
              { icon: <Instagram className="w-5 h-5" />, name: 'instagram' },
              { icon: <Linkedin className="w-5 h-5" />, name: 'linkedin' },
              { icon: <Facebook className="w-5 h-5" />, name: 'facebook' },
              { icon: <X className="w-5 h-5" />, name: 'twitter' },
            ].map((social) => (
              <div key={social.name} className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border rounded">
                  {social.icon}
                </div>
                <Input
                  name={social.name}
                  value={form.socialLinks[social.name as keyof typeof form.socialLinks]}
                  onChange={(e) => handleChange({
                    target: {
                      name: `socialLinks.${social.name}`,
                      value: e.target.value,
                    }
                  } as any)}
                  className="flex-1"
                  placeholder="Name"
                />
              </div>
            ))}
          </div>

          <div className="text-right mt-6">
            <Button onClick={submitForm} className="bg-yellow-500 text-white">Submit</Button>
          </div>
        </>
      )}
    </div>
  );
}
