import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "player";

  const handleGoHome = () => {
    navigate(`/${role}/profile`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          You have not selected any plan. You can always subscribe later from
          your profile page.
        </p>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCancel;
