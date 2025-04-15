import React from "react";
import {  CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Share2, Star,X } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import profile3 from "../assets/images/profile3.jpg"
import { useState } from 'react';
interface Stat {
  label: string;
  percentage: number;
  color: string;
  subskills: string[];
}

const attributes: Stat[] = [
  { label: "Pace", percentage: 70, color: "#E63946", subskills: ["Acceleration", "Sprint Speed"] },
  { label: "Shooting", percentage: 55, color: "#D62828", subskills: ["Att.Positioning", "Finishing", "Long Shots", "Shot Power", "Penalties", "Volleys"] },
  { label: "Passing", percentage: 80, color: "#4CAF50", subskills: ["Short Passing", "Vision", "Long Passing", "FK. Accuracy", "Crossing", "Curve"] },
  { label: "Dribbling", percentage: 65, color: "#68A357", subskills: ["Dribbling", "Ball Control", "Agility", "Balance", "Reactions"] },
  { label: "Defending", percentage: 90, color: "#2D6A4F", subskills: ["Marking", "Stand Tackle", "Interception", "Heading Accuracy", "Slide Tackle"] },
  { label: "Physical", percentage: 60, color: "#F4A261", subskills: ["Strength", "Stamina", "Aggression", "Jumping"] },
];

const AssessmentReport: React.FC = () => {
  const rating = 4.5;
  const [isVisible, setIsVisible] = useState(true);

  return (
  <>
    {isVisible && (
      
    <div className="p-6 bg-white  space-y-6 left1/4  w-min-screen h-min-screen  items-center justify-center ">
      
      {/* Header */}
      
      <div className="flex justify-end   mr-4">
      
        <X className="w-7 h-7 cursor-pointer"  onClick={() => setIsVisible(false)} />
        </div>
      
    
      <div className="flex justify-center items-center  mb-14">
        <h2 className="text-2xl  font-semibold">Assessment Report</h2>
        </div>

      {/* Info Row */}
      <div className="flex justify-between  text-sm mb-6">

      <div className="flex flex-col">
      <span className="text-gray-500">EXPERT NAME</span>
       <div className="flex items-center gap-2">
      <img src={profile3} alt="Expert" className="w-6 h-6 rounded-full object-cover" />
       <span className="font-medium">Expert Name</span>
       </div>
       </div>

        <div className="flex flex-col">
          <span className="text-gray-500">PLAYER NAME</span>
          <div className="flex items-center gap-2">
          <img src={profile3} alt="Expert" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-medium">Roshan Roy</span>
          </div>
        </div>


        <div className="flex flex-col">
          <span className="text-gray-500">DATE</span>
          <div className="flex items-center gap-2">
          <img src={profile3} alt="Expert" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-medium">25th February 2025</span>
          </div>
        </div>
        
        <div className="flex gap-10 justify-end items-end ">
          <Download className="w-7 h-7 cursor-pointer" />
          <Share2 className="w-7 h-7 cursor-pointer" />
          
        </div> 
      </div>

      <CardContent className="bg-amber-100  mx-auto rounded-xl  shadow-md">
     <div className="py-6">
     <h3 className="text-lg font-semibold mb-6">Attribute Details</h3>

    {/* Horizontal Scrollable Row for Attributes */}
    <div className="flex overflow-x-auto divide-x divide-gray-300">
      {attributes.map((attr, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-64 px-6 flex flex-col items-center"
        >
          {/* Circular Progress */}
          <div className="w-20 h-20 relative" style={{ transform: "rotate(-90deg)" }}>
            <CircularProgressbar
              value={attr.percentage}
              styles={buildStyles({
                textSize: "26px",
                pathColor: attr.color,
                trailColor: "#ddd",
                strokeLinecap: "round",
              })}
              circleRatio={0.5}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-sm ml-3 font-semibold text-stone-800"
              style={{ transform: "rotate(90deg)" }}
            >
              {attr.percentage}%
            </div>
          </div>

          {/* Label */}
          <p className="text-sm mt-2 text-gray-700 font-semibold">{attr.label}</p>

          {/* Subskills */}
          <div className="mt-4 mb-10 space-y-2">
            {attr.subskills.map((skill, idx) => (
              <div key={idx}>
                <div className="text-sm flex  justify-between gap-4">
                  <span>{skill}</span>
                  <span className="text-green-600 font-semibold">82%</span>
                </div>
                <Progress value={82} className="h-1 bg-green-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</CardContent>


      {/* Rating Section */}
      <div className="justify-start">
        <div className="text-xl font-bold ">Rating</div>
        <div className="flex justify-start  ml-8 mt-5  items-center  gap-2">
          <span className="text-3xl font-bold ">{rating} / 5</span>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              fill={i <= Math.floor(rating) ? '#FACC15' : i - 0.5 === rating ? '#FACC15' : 'none'}
              stroke="#FACC15"
              className="w-7 h-7"
            />
          ))}
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-2">
        <h3 className="font-extrabold text-xl">Review</h3>
        <p>
          <strong>Strengths:</strong> Excellent technical skills, strong tactical awareness, and great physical
          attributes. Showed impressive (e.g., passing, dribbling, finishing).
        </p>
        <p>
          <strong>Areas for Improvement:</strong> Needs more consistency, better decision-making under pressure, and
          improved (e.g., defensive transitions, off-the-ball movement).
        </p>
        <p>
          <strong>Verdict:</strong> A promising player with great potential. With refinement in key areas, they can
          excel in their role.
        </p>
      </div>
      
      </div>
      
      )}
    </>
    );
  };
  


export default AssessmentReport;
