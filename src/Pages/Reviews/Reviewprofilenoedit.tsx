import "react-circular-progressbar/dist/styles.css";
import profile2 from "../../assets/images/avatar.png";
import React, { useState, useRef, useEffect } from "react";
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

interface ReviewnoeditProps {
  Data?: any; // The full expert data object
}

const Reviewnoedit: React.FC<ReviewnoeditProps> = ({ Data }) => {
  // State for selected review - can be either dynamic or static
  const [selectedDynamicReview, setSelectedDynamicReview] =
    useState<ReviewItem | null>(null);
  const [selectedStaticReview, setSelectedStaticReview] =
    useState<Review | null>(null);

  // Refs for modal close on outside click
  const dynamicModalRef = useRef<HTMLDivElement | null>(null);
  const staticModalRef = useRef<HTMLDivElement | null>(null);

  // Function to format the review date
  const formatReviewDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "date unknown";
    }
  };

  // Determine if we should use real reviews or fallback to static
  const useDynamicReviews =
    Data &&
    Data.reviewsReceived &&
    Array.isArray(Data.reviewsReceived) &&
    Data.reviewsReceived.length > 0;

  const dynamicReviews = useDynamicReviews ? Data.reviewsReceived : [];

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
          {rating} out of 5
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

  // Close modal on outside click for dynamic review
  useEffect(() => {
    if (!selectedDynamicReview) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dynamicModalRef.current &&
        !dynamicModalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line
  }, [selectedDynamicReview]);

  // Close modal on outside click for static review
  useEffect(() => {
    if (!selectedStaticReview) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        staticModalRef.current &&
        !staticModalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line
  }, [selectedStaticReview]);

  return (
    <div className="p-4 -mt-10 w-full">
      {/* Reviews Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {useDynamicReviews ? (
          // Dynamic reviews from Data
          dynamicReviews.map((review: ReviewItem) => (
            <div
              key={review.id}
              className="border dark:bg-gray-800 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition relative"
              onClick={() => handleDynamicCardClick(review)}
            >
              {/* Verified Badge - Show only if bookingId exists */}
              {review.bookingId && (
                <div className="absolute top-2 right-2">
                  <span className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-sm flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <img
                    src={review.reviewer.photo || profile2}
                    alt={review.reviewer.username}
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
                    {review.reviewer.username}
                  </p>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
              </div>
              {renderRatingStars(review.rating)}
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {review.comment.length > 80
                  ? `${review.comment.substring(0, 80)}...`
                  : review.comment}
              </p>
            </div>
          ))
        ) : (
          <>No reviews yet</>
        )}
      </div>

      {/* Dynamic Review Modal */}
      {selectedDynamicReview && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4">
          <div
            ref={dynamicModalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-3xl"
            >
              &times;
            </button>

            {/* Verified Badge in Modal */}
            {selectedDynamicReview.bookingId && (
              <div className="absolute top-2 left-3">
                <span className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-sm flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              </div>
            )}

            <div className="flex flex-col items-center mt-6">
              <img
                src={selectedDynamicReview.reviewer.photo}
                alt={selectedDynamicReview.reviewer.username}
                className="rounded-full w-24 h-24 mb-4 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/96/CCCCCC/666666?text=User";
                }}
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedDynamicReview.reviewer.username}
              </h2>
              <p className="text-gray-500 text-sm">
                {formatReviewDate(selectedDynamicReview.createdAt)}
              </p>
              {renderRatingStars(selectedDynamicReview.rating)}
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
              <p>{selectedDynamicReview.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Static Review Modal */}
      {selectedStaticReview && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4">
          <div
            ref={staticModalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
          >
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
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedStaticReview.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {selectedStaticReview.time}
              </p>
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum
                sequi voluptatum facilis suscipit exercitationem, natus vero
                eligendi sunt similique ipsa omnis qui eum incidunt molestias
                quod recusandae animi, accusantium porro.
              </p>
              <p>{selectedStaticReview.review}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviewnoedit;
