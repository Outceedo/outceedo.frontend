import React from "react";
import moment from "moment";
import { Card } from "@/components/ui/card";

interface Review {
  id: number;
  name: string;
  date: string;
  comment: string;
}

const ExpertReviews: React.FC = () => {
  // Sample reviews data
  const reviews: Review[] = [
    {
      id: 1,
      name: "John Doe",
      date: "2024-02-15",
      comment: "Great service! Highly recommend.",
    },
    {
      id: 2,
      name: "Alice Johnson",
      date: "2024-02-10",
      comment: "The experience was amazing. Will come again!",
    },
    {
      id: 3,
      name: "Michael Smith",
      date: "2024-01-25",
      comment: "Good quality, but the waiting time was a bit long.",
    },
    {
      id: 4,
      name: "Emily Davis",
      date: "2024-01-20",
      comment: "Exceptional coaching skills and very attentive to detail.",
    },
    {
      id: 5,
      name: "Robert Wilson",
      date: "2024-01-15",
      comment:
        "My son has improved tremendously under the guidance. Great expert!",
    },
  ];

  return (
    <div className="p-4 w-full space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Reviews from Players
      </h2>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No reviews available yet
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4 shadow-sm dark:bg-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {review.name}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {moment(review.date).fromNow()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertReviews;
