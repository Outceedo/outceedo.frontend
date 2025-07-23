import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

const SponsorForm = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md dark:bg-gray-900">
      <div className="flex gap-10 justify-end items-end"></div>
      <div className=" mb-6 text-center">
        <h1 className=" text-3xl mt-6 mb-6 font-bold">Sports App</h1>
        <h1 className="text-2xl font-semibold">
          Athlete/Team Sponsorship Application
        </h1>
      </div>
      <div className="flex gap-10 justify-end items-end">
        <Download className="w-7 h-7 cursor-pointer" />
      </div>

      <form className="space-y-6 mt-8 bg-amber-50 p-10 rounded-lg dark:bg-gray-800">
        {/* Full Name */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name:</Label>
            <div className="w-full sm:w-full md:w-[32rem] mx-auto mt-4">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First" />
                <Input placeholder="Last" />
              </div>
            </div>
          </div>
        </div>

        {/* Profession & Team Name */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Profession:</Label>
            <div className="mt-4">
              <Input placeholder="Your profession" />
            </div>
          </div>
          <div>
            <Label>Team/Club Name:</Label>
            <div className="mt-4">
              <Input placeholder="Team or club name" />
            </div>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>E-mail:</Label>
            <div className="mt-4">
              <Input placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <Label>Phone Number:</Label>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <select className="border rounded p-2">
                <option>+91</option>
                <option>+1</option>
                <option>+44</option>
              </select>
              <div className="col-span-2">
                <Input placeholder="Phone number" />
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Reason */}
        <div>
          <Label>Why do you require sponsorship?</Label>
          <div className="mt-4 ">
            <Textarea placeholder="Explain your need for sponsorship..." />
          </div>
        </div>

        {/* Unique Factor */}
        <div>
          <Label>What makes you stand out from the other athletes/Teams?</Label>
          <div className="mt-4">
            <Textarea placeholder="Describe your unique qualities..." />
          </div>
        </div>

        {/* Sponsorship Preference */}
        <div>
          <Label>What kind of sponsorship do you prefer?</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <Checkbox />
              <span>Product</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox />
              <span>Money (Cash/Gift Card/Professional Fees)</span>
            </label>
          </div>
        </div>

        {/* Website or Social Profile */}
        <div>
          <Label>Your website or social media profile:</Label>
          <div className="mt-4">
            <Input placeholder="https://yourprofile.com" />
          </div>
        </div>

        {/* Other Info */}
        <div>
          <Label>Other Useful Information:</Label>
          <div className="mt-4">
            <Textarea placeholder="Any additional information..." />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SponsorForm;
