import "react-circular-progressbar/dist/styles.css";
import profile2 from "../assets/images/profile2.jpg";
import React, { useState } from "react";

// Define the type for a single review
interface Review {
  name: string;
  time: string;
  review: string;
  profileImage: string;
}

const PlayerReview: React.FC = () => {
  const reviews: Review[] = [
    {
      name: "Laura W",
      time: "1 year ago",
      review: "An incredible, heartfelt musician and a delight to work with.",
      profileImage: profile2,
    },
    {
      name: "Kenny B",
      time: "1 year ago",
      review: "An incredible, heartfelt musician and a delight to work with.",
      profileImage: profile2,
    },
    {
      name: "Nicola B",
      time: "1 year ago",
      review: "An incredible, heartfelt musician and a delight to work with.",
      profileImage: profile2,
    },
  ];

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleCardClick = (review: Review) => {
    setSelectedReview(review);
  };

  const closeModal = () => {
    setSelectedReview(null);
  };

  return (
    <div className="p-4 w-full">
      {/* Reviews Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="border dark:bg-gray-800 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            onClick={() => handleCardClick(review)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <img src={review.profileImage} alt={review.name} className="rounded-full w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{review.name}</p>
                <p className="text-gray-500 text-sm dark:text-gray-400">{review.time}</p>
              </div>
            </div>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{review.review}</p>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-xl"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedReview.profileImage}
                alt={selectedReview.name}
                className="rounded-full w-24 h-24 mb-4 object-cover"
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedReview.name}</h2>
              <p className="text-gray-500 text-sm">{selectedReview.time}</p>
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum sequi voluptatum facilis suscipit
                exercitationem, natus vero eligendi sunt similique ipsa omnis qui eum incidunt molestias quod recusandae
                animi, accusantium porro.
              </p>
              <p>{selectedReview.review}</p>
            </div>
            <button
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerReview;
