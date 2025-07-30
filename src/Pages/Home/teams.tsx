import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";
import Farhan from "../../assets/team/Farhan.jpg";
import Neekunj from "../../assets/team/Neekunj.jpg";
import Arun from "../../assets/team/Arun.jpg";
import Nikitha from "../../assets/team/Nikitha.jpg";
import Vamshi from "../../assets/team/Vamshi.jpg";
import Dinesh from "../../assets/team/Dinesh.jpg";
import Sindhu from "../../assets/team/Sindhu.jpg";
import Riktha from "../../assets/team/Riktha.jpg";
import Deepthika from "../../assets/team/Deepthika.jpg";

// Example team data -- replace with your actual images and members!
const managementTeam = [
  {
    name: "Arun Muppana",
    designation: "Founder & CEO",
    photo: Arun,
  },
  {
    name: "Vamshi Mohana",
    designation: "Co-Founder & CTO",
    photo: Vamshi,
  },
];

const technicalTeam = [
  {
    name: "Shakir Farhan",
    designation: "Backend Systems Engineer",
    photo: Farhan,
  },
  {
    name: "Neekunj Chaturvedi",
    designation: "Frontend and Integration Engineer",
    photo: Neekunj,
  },
  {
    name: "Sindhu",
    designation: "Frontend Developer",
    photo: Sindhu,
  },
  {
    name: "Nikitha",
    designation: "Frontend Developer",
    photo: Nikitha,
  },
  {
    name: "Rella Dinesh",
    designation: "Quality Assurance and Responsive Testing",
    photo: Dinesh,
  },
];

const designTeam = [
  {
    name: "Riktha Reddy",
    designation: "UI/UX Designer",
    photo: Riktha,
  },
  {
    name: "Deepthika",
    designation: "UI/UX Designer",
    photo: Deepthika,
  },
];

function Teams() {
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 mt-6 text-red-600 font-Raleway">
            "We are Outceedo"
          </h1>
          <p className="text-xl text-gray-700 text-center mb-12">
            Meet the passionate minds and creative talent driving our vision
            forward.
          </p>

          {/* Management Team */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-7 text-center">
              Management Team
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {managementTeam.map((member) => (
                <div
                  key={member.name}
                  className="bg-[#f7fafb] rounded-xl shadow-md p-3 md:p-6 flex flex-col items-center w-42 md:w-64"
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-32 md:w-48 h-32 md:h-48 rounded-md object-cover mb-4 "
                  />
                  <h3 className="text-lg font-bold text-gray-800 text-center">
                    {member.name}
                  </h3>
                  <p className="text-sm text-red-600 font-medium mt-1 text-center">
                    {member.designation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Team */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-7 text-center">
              Technical Team
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {technicalTeam.map((member) => (
                <div
                  key={member.name}
                  className="bg-[#f7fafb] rounded-xl shadow-md p-3 md:p-6 flex flex-col items-center w-42 md:w-64"
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-32 md:w-48 h-32 md:h-48 rounded-md object-cover mb-4 "
                  />
                  <h3 className="text-lg font-bold text-gray-800 text-center">
                    {member.name}
                  </h3>
                  <p className="text-sm text-red-600 font-medium mt-1 text-center">
                    {member.designation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-7 text-center">
              Design Team
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {designTeam.map((member) => (
                <div
                  key={member.name}
                  className="bg-[#f7fafb] rounded-xl shadow-md p-3 md:p-6 flex flex-col items-center w-42 md:w-64"
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-32 md:w-48 h-32 md:h-48 rounded-md object-cover mb-4 "
                  />
                  <h3 className="text-lg font-bold text-gray-800 text-center">
                    {member.name}
                  </h3>
                  <p className="text-sm text-red-600 font-medium mt-1 text-center">
                    {member.designation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <span className="inline-block bg-red-100 text-red-600 px-6 py-3 rounded-full text-lg font-semibold shadow">
              Together, we are shaping the future of Outceedo.
            </span>
          </div>
        </div>
      </section>
      <OutceedoFooter />
    </div>
  );
}

export default Teams;
