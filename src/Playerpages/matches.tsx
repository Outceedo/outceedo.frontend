
import "react-circular-progressbar/dist/styles.css";
import SideNavbar from "./sideNavbar";
import React, { useState } from 'react';
import PlayerHeader from "./playerheader";

interface Match {
    id: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    type: string;
    status:string;
    result: string;
  }

const Matches: React.FC = () => { 

  const [matches, setMatches] = useState<Match[]>([
    { id: 1, date: "Feb 14, 2025", homeTeam: "ByeWind", awayTeam: "ByeWind", type: "State",status:"won", result: "2 - 0" },
    { id: 2, date: "Feb 10, 2025", homeTeam: "Natali Craig", awayTeam: "Natali Craig", type: "Inter university",status:"won",  result: "1 - 0" },
    { id: 3, date: "Jan 20, 2025", homeTeam: "Drew Cano", awayTeam: "Drew Cano", type: "International",status:"won",  result: "1 - 0" },
    { id: 4, date: "Dec 15, 2024", homeTeam: "Orlando Diggs", awayTeam: "Orlando Diggs", type: "State",status:"won",  result: "2 - 0" },
    { id: 5, date: "Nov 25, 2024", homeTeam: "Andi Lane", awayTeam: "Andi Lane", type: "State", status:"won", result: "3 - 0" },
  ]);

  const [formData, setFormData] = useState<Match>({
    id: 0,
    date: "",
    homeTeam: "",
    awayTeam: "",
    type: "",
    status:"",
    result: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId !== null) {
      setMatches(matches.map((match) => (match.id === editingId ? { ...formData, id: editingId } : match)));
      setEditingId(null);
    } else {
      setMatches([...matches, { ...formData, id: matches.length + 1 }]);
    }

    setFormData({ id: 0, date: "", homeTeam: "", awayTeam: "", type: "", status:"",result: "" });
  };

  const handleEdit = (id: number) => {
    const matchToEdit = matches.find((match) => match.id === id);
    if (matchToEdit) {
      setFormData(matchToEdit);
      setEditingId(id);
    }
  };

  const handleDelete = (id: number) => {
    setMatches(matches.filter((match) => match.id !== id));
  };

  return (
    <>
      <div className="flex">
        <SideNavbar />
        
      <PlayerHeader />

          <div className="p-6 mt-20 w-full dark:bg-slate-900">
      {/* Match Form */}
      <div className="bg-gray-100 p-4 rounded-md shadow-md dark:bg-slate-800  ">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 ">
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded-md dark:bg-slate-600 dark:text-white" required />
          <input type="text" name="homeTeam" placeholder="Home Team" value={formData.homeTeam} onChange={handleChange} className="p-2 border rounded-md  dark:bg-slate-600 dark:text-white" required />
          <input type="text" name="awayTeam" placeholder="Away Team" value={formData.awayTeam} onChange={handleChange} className="p-2 border rounded-md  dark:bg-slate-600 dark:text-white" required />
          <input type="text" name="type" placeholder="Type" value={formData.type} onChange={handleChange} className="p-2 border rounded-md  dark:bg-slate-600 dark:text-white" required />
          <input type="text" name="status" placeholder="Status" value={formData.type} onChange={handleChange} className="p-2 border rounded-md  dark:bg-slate-600 dark:text-white" required />
           <textarea name="result" placeholder="Results" value={formData.result} onChange={handleChange} className="col-span-2 p-2 border rounded-md  dark:bg-slate-600 dark:text-white" required />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormData({ id: 0, date: "", homeTeam: "", awayTeam: "", type: "",status:"", result: "" })} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md">{editingId !== null ? "Update" : "Submit"}</button>
          </div>
        </form>
      </div>

      {/* Match Table */}
      <div className="mt-6 bg-white shadow-md rounded-md overflow-hidden ">
        <table className="w-full border-collapse  ">
          <thead className="bg-gray-200 text-left dark:text-white">
            <tr>
              <th className="p-2  dark:bg-slate-700 ">Date</th>
              <th className="p-2  dark:bg-slate-700 ">Home Team</th>
              <th className="p-2  dark:bg-slate-700 ">Away Team</th>
              <th className="p-2  dark:bg-slate-700 ">Type</th>
              <th className="p-2  dark:bg-slate-700 ">Status</th>
              <th className="p-2  dark:bg-slate-700 ">Result</th>
              <th className="p-2  dark:bg-slate-700 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-t bg-gray-50 dark:bg-slate-600">
                <td className="p-2 ">{match.date}</td>
                <td className="p-2">{match.homeTeam}</td>
                <td className="p-2">{match.awayTeam}</td>
                <td className="p-2">{match.type}</td>
                <td className="p-2">{match.status}</td>
                <td className="p-2">{match.result}</td>
                <td className="p-2 flex gap-2">
                <button onClick={() => handleEdit(match.id)} className="text-blue-500 hover:text-blue-700">
                    
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button onClick={() => handleDelete(match.id)} className="text-red-500 hover:text-red-700">
                  <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

         
    </div>
    </>
  );
};

export default Matches;
