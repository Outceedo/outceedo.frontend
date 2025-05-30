import "react-circular-progressbar/dist/styles.css";
import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import profile2 from "../../assets/images/avatar.png";
import axios from "axios";

// Define the type for a single review from the API
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

interface ReviewviewProps {
  Data: any;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

const Reviewview: React.FC<ReviewviewProps> = ({ Data }) => {
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  // For outside modal click refs
  const reviewModalRef = useRef<HTMLDivElement | null>(null);
  const addReviewModalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);

  // Create a local reviews state that we can update immediately
  const [localReviews, setLocalReviews] = useState<ReviewItem[]>([]);

  // Initialize local reviews from props
  useEffect(() => {
    if (Data?.reviewsReceived) {
      setLocalReviews(Data.reviewsReceived);
    }
  }, [Data]);

  // Function to format the review date
  const formatReviewDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "date unknown";
    }
  };

  // Use our local reviews state instead of directly from props
  const reviews = localReviews;

  // Current user ID from localStorage
  const getCurrentUserId = () => {
    return localStorage.getItem("userId") || "";
  };

  // Current user info
  const getCurrentUserInfo = () => {
    return {
      id: localStorage.getItem("userId") || "",
      username: localStorage.getItem("username") || "",
      photo: localStorage.getItem("userPhoto") || "",
    };
  };

  // Check if the current user has already submitted a review
  const hasUserReviewed = () => {
    const currentUserId = getCurrentUserId();
    return reviews.some(
      (review: ReviewItem) => review.reviewerId === currentUserId
    );
  };

  const handleCardClick = (review: ReviewItem) => {
    setSelectedReview(review);
  };

  const closeModal = () => {
    setSelectedReview(null);
  };

  const openAddReviewModal = () => {
    setIsAddReviewModalOpen(true);
    setNewRating(5);
    setNewComment("");
    setError("");
  };

  const closeAddReviewModal = () => {
    setIsAddReviewModalOpen(false);
  };

  const handleRatingClick = (rating: number) => {
    setNewRating(rating);
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      setError("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUserInfo();

      // API call to submit a review
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/review/${Data.id}`,
        {
          rating: newRating,
          comment: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a new review object to add to our local state
      const newReview: ReviewItem = {
        id: response.data?.id || `temp-${Date.now()}`,
        reviewerId: currentUser.id,
        revieweeId: Data.id,
        bookingId: "",
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewer: {
          id: currentUser.id,
          username: currentUser.username,
          photo: currentUser.photo,
        },
      };

      setLocalReviews((prevReviews) => [...prevReviews, newReview]);
      setIsAddReviewModalOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (review: ReviewItem) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE_URL}/user/profile/review/${reviewToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLocalReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      setError("Failed to delete review. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  const renderInteractiveStars = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mt-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-8 h-8 cursor-pointer ${
              star <= (hoveredRating || newRating)
                ? "text-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => handleRatingHover(star)}
            onMouseLeave={handleRatingLeave}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
  };

  const currentUserId = getCurrentUserId();

  // Modal outside click close effect (review)
  useEffect(() => {
    if (!selectedReview) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        reviewModalRef.current &&
        !reviewModalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedReview]);

  // Modal outside click close effect (add review)
  useEffect(() => {
    if (!isAddReviewModalOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        addReviewModalRef.current &&
        !addReviewModalRef.current.contains(event.target as Node)
      ) {
        closeAddReviewModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddReviewModalOpen]);

  // Modal outside click close effect (delete modal)
  useEffect(() => {
    if (!isDeleteModalOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        closeDeleteModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDeleteModalOpen]);

  return (
    <div className="p-4 w-full">
      {/* Add Review Button */}
      {!hasUserReviewed() && (
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddReviewModal}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Add Review
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          <p className="text-lg">No reviews yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {reviews.map((review: ReviewItem) => (
            <div
              key={review.id}
              className="border dark:bg-gray-800 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition"
              onClick={() => handleCardClick(review)}
            >
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
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity z-50 flex justify-center items-center px-4">
          <div
            ref={reviewModalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-3xl"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedReview.reviewer.photo}
                alt={selectedReview.reviewer.username}
                className="rounded-full w-24 h-24 mb-4 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/96/CCCCCC/666666?text=User";
                }}
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedReview.reviewer.username}
              </h2>
              <p className="text-gray-500 text-sm">
                {formatReviewDate(selectedReview.createdAt)}
              </p>
              {renderRatingStars(selectedReview.rating)}
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300">
              <p>{selectedReview.comment}</p>
            </div>

            {/* Delete button (only visible if current user is the reviewer) */}
            {selectedReview.reviewerId === currentUserId && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => openDeleteModal(selectedReview)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md shadow-sm"
                >
                  Delete Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity z-50 flex justify-center items-center px-4">
          <div
            ref={addReviewModalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={closeAddReviewModal}
              className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 text-xl"
              disabled={isSubmitting}
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
              Add Review
            </h2>

            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Rate your experience
              </p>
              {renderInteractiveStars()}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review here..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={4}
                disabled={isSubmitting}
              ></textarea>

              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeAddReviewModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity z-50 flex justify-center items-center px-4">
          <div
            ref={deleteModalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
              Delete Review
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Are you sure you want to delete your review? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviewview;
