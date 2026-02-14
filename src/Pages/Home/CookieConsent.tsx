import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cookieConsent";

const CookieConsent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowModal(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Cookie Consent
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        We use cookies to enhance your browsing experience. By continuing to use
        our site, you agree to our{" "}
        <Link to="/privacy" className="text-red-500 underline hover:text-red-600">
          Cookie Policy
        </Link>{" "}
        and{" "}
        <Link to="/terms" className="text-red-500 underline hover:text-red-600">
          Terms of Use
        </Link>
        .
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleReject}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
