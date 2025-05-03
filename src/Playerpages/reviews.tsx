import "react-circular-progressbar/dist/styles.css";
import profile2 from "../assets/images/profile2.jpg";
import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

// Define types for the reviews coming from the profile data
interface ReviewerInfo {
  id: string;
  username: string;
  photo: string;
}

interface ReviewItem {
  id: string;
  reviewerId: string;
  revieweeId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reviewer: ReviewerInfo;
}

// Define the static review type for fallback
interface Review {
  name: string;
  time: string;
  review: string;
  profileImage: string;
}

interface ReviewsProps {
  playerData?: any; // The full player data object
  isExpertView?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({ playerData, isExpertView }) => {
  // State to store reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isUsingStaticData, setIsUsingStaticData] = useState(false);

  // Initialize reviews from playerData on component mount and when playerData changes
  useEffect(() => {
    console.log("Player data:", playerData);

    // Check for reviews in the player data - using the correct property name
    if (
      playerData &&
      playerData.reviewsReceived && // Correct spelling of reviewsReceived
      Array.isArray(playerData.reviewsReceived) &&
      playerData.reviewsReceived.length > 0
    ) {
      console.log("Using real reviews data:", playerData.reviewsReceived);
      setReviews(playerData.reviewsReceived);
      setIsUsingStaticData(false);
    }
    // Also check the raw profile data as a fallback
    else if (
      playerData &&
      playerData.rawProfile &&
      playerData.rawProfile.reviewsReceived &&
      Array.isArray(playerData.rawProfile.reviewsReceived) &&
      playerData.rawProfile.reviewsReceived.length > 0
    ) {
      console.log(
        "Using raw profile reviews data:",
        playerData.rawProfile.reviewsReceived
      );
      setReviews(playerData.rawProfile.reviewsReceived);
      setIsUsingStaticData(false);
    } else {
      console.log("No real reviews found, using static data");
      setIsUsingStaticData(true);
    }
  }, [playerData]);

  // State for selected review - can be either dynamic or static
  const [selectedDynamicReview, setSelectedDynamicReview] =
    useState<ReviewItem | null>(null);
  const [selectedStaticReview, setSelectedStaticReview] =
    useState<Review | null>(null);

  // Function to format the review date
  const formatReviewDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "date unknown";
    }
  };

  // Generate star rating display
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "text-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating}
        </span>
      </div>
    );
  };

  const handleDynamicCardClick = (review: ReviewItem) => {
    setSelectedDynamicReview(review);
    setSelectedStaticReview(null);
  };

  const handleStaticCardClick = (review: Review) => {
    setSelectedStaticReview(review);
    setSelectedDynamicReview(null);
  };

  const closeModal = () => {
    setSelectedDynamicReview(null);
    setSelectedStaticReview(null);
  };

  // Calculate average rating if we have real reviews
  const calculateAverageRating = () => {
    if (isUsingStaticData || reviews.length === 0) return 0;

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  };

  const averageRating = calculateAverageRating();

  // Debug log
  useEffect(() => {
    console.log("Current reviews state:", reviews);
    console.log("Is using static data:", isUsingStaticData);
  }, [reviews, isUsingStaticData]);

  return (
    <div className="p-4 mt-5 w-full">
      {/* Rating Header - Only show if using real reviews */}
      {!isUsingStaticData && reviews.length > 0 && (
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white mr-2">
                  {averageRating}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? "text-yellow-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {isUsingStaticData ? (
          // Fallback to static reviews
          <>no reviews yet</>
        ) : reviews.length === 0 ? (
          // No reviews message
          <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No reviews yet</p>
            <p className="text-sm mt-2">
              Reviews will appear here once received
            </p>
          </div>
        ) : (
          // Dynamic reviews from playerData
          reviews.map((review: ReviewItem) => (
            <div
              key={review.id}
              className="border dark:bg-gray-800 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition"
              onClick={() => handleDynamicCardClick(review)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <img
                    src={review.reviewer?.photo || ""}
                    alt={review.reviewer?.username || "User"}
                    className="rounded-full w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/40/CCCCCC/666666?text=User";
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {review.reviewer?.username || "Anonymous User"}
                  </p>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
              </div>
              {renderRatingStars(review.rating)}
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {review.comment && review.comment.length > 80
                  ? `${review.comment.substring(0, 80)}...`
                  : review.comment || "No comment provided"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Dynamic Review Modal */}
      {selectedDynamicReview && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-xl"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedDynamicReview.reviewer?.photo || ""}
                alt={selectedDynamicReview.reviewer?.username || "User"}
                className="rounded-full w-24 h-24 mb-4 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/96/CCCCCC/666666?text=User";
                }}
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedDynamicReview.reviewer?.username || "Anonymous User"}
              </h2>
              <p className="text-gray-500 text-sm">
                {formatReviewDate(selectedDynamicReview.createdAt)}
              </p>
              {renderRatingStars(selectedDynamicReview.rating)}
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
              <p>{selectedDynamicReview.comment || "No comment provided"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Static Review Modal */}
      {selectedStaticReview && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-xl"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedStaticReview.profileImage}
                alt={selectedStaticReview.name}
                className="rounded-full w-24 h-24 mb-4 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/96/CCCCCC/666666?text=User";
                }}
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedStaticReview.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {selectedStaticReview.time}
              </p>
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
              <p>{selectedStaticReview.review}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
