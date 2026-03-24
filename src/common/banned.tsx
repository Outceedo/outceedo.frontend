import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

const Banned: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Get ban/suspend info from Redux state or localStorage
  const isBan = user?.isBan || localStorage.getItem("isBan") === "true";
  const isSuspended =
    user?.isSuspended || localStorage.getItem("isSuspended") === "true";
  const suspendTill =
    user?.suspend_till ||
    user?.suspendTill ||
    localStorage.getItem("suspendTill");

  const formatSuspendDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  // If user is neither banned nor suspended, redirect to home
  if (!isBan && !isSuspended) {
    const role = localStorage.getItem("role");
    if (role) {
      navigate(`/${role}/profile`);
    } else {
      navigate("/");
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="p-8 rounded-lg shadow-lg border-2 border-red-500 flex flex-col items-center max-w-lg w-full">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Status Title */}
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          {isBan ? "Account Banned" : "Account Suspended"}
        </h1>

        {/* Status Message */}
        <div className="text-center mb-6">
          {isBan ? (
            <p className="text-gray-700 text-lg">
              Your account has been permanently banned due to violation of our
              terms of service.
            </p>
          ) : (
            <>
              <p className="text-gray-700 text-lg">
                Your account has been temporarily suspended.
              </p>
              {suspendTill && (
                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">Suspension ends:</span>{" "}
                  <span className="text-red-500 font-medium">
                    {formatSuspendDate(suspendTill)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-200 my-4"></div>

        {/* Contact Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            If you believe this is a mistake or need assistance, please contact
            us:
          </p>
          <a
            href="mailto:info@outceedo.com"
            className="text-red-500 font-semibold text-lg hover:text-red-600 hover:underline"
          >
            info@outceedo.com
          </a>
        </div>

        {/* Logout Button */}
        <Button
          className="mt-8 bg-red-500 hover:bg-red-600 text-white px-8"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Banned;
