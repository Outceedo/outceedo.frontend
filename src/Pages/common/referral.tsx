import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  Copy,
  Check,
  Users,
  UserCheck,
  Gift,
  Link,
  PoundSterling,
  Clock,
} from "lucide-react";

const COMMISSION_RATES: Record<string, number> = {
  test: 0.1, // £1 * 10% = £0.10
  monthly: 1.0, // £10 * 10% = £1.00
  yearly: 10.0, // £100 * 10% = £10.00
};

const ReferralPage = () => {
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile,
  );
  const [copied, setCopied] = useState(false);

  const copyReferralCode = () => {
    if (currentProfile?.referralCode) {
      navigator.clipboard.writeText(currentProfile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (currentProfile?.referralCode) {
      const link = `${import.meta.env.VITE_HOME}/signup?ref=${currentProfile.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading profile</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">
          Please log in to view your referral information.
        </p>
      </div>
    );
  }

  const referredFree = currentProfile.referredFree || [];
  const referredPaid = currentProfile.referredPaid || [];
  const totalReferrals = referredFree.length + referredPaid.length;

  // Calculate total commission from paid referrals
  const totalCommission = referredPaid.reduce((total: number, user: any) => {
    if (typeof user === "object" && user.planName) {
      const planKey = user.planName.toLowerCase();
      return total + (COMMISSION_RATES[planKey] || 0);
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="mt-2 text-gray-600">
            Share your referral code or link to fellow footballers or fans and
            earn rewards when they join!{" "}
          </p>
          <span className="text-red-500 font-bold">
            Rewards will be for subscribed accounts.
          </span>
        </div>

        {/* Notice */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Referrals can take up to 60 minutes to reflect. Please be patient!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Users className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Referrals
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalReferrals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Free Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {referredFree.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Gift className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {referredPaid.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <PoundSterling className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Commission Earned
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  £{totalCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          {/* Referral Code */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Referral Code
            </h2>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-4">
              <code className="flex-1 text-lg font-mono font-semibold text-gray-900">
                {currentProfile.referralCode || "N/A"}
              </code>
              <button
                onClick={copyReferralCode}
                className="ml-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Referral Link
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-4">
                <code className="flex-1 text-lg font-mono font-semibold text-gray-900 break-all">
                  {import.meta.env.VITE_HOME}/signup?ref=
                  {currentProfile.referralCode || "N/A"}
                </code>
              </div>
            </div>

            <button
              onClick={copyReferralLink}
              className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Link className="h-5 w-5 mr-2" />
              Copy Referral Link
            </button>
          </div>

          {currentProfile.referredBy && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Referred by:</span>{" "}
                <span className="text-gray-900">
                  {currentProfile.referredBy}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Referred Free Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Free Referred Users
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {referredFree.length} users
            </span>
          </div>

          {referredFree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No free users referred yet.</p>
              <p className="text-sm mt-1">
                Share your referral code to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referredFree.map((username, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {username}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                          Free
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Referred Paid Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Paid Referred Users
            </h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              {referredPaid.length} users
            </span>
          </div>

          {referredPaid.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No paid users referred yet.</p>
              <p className="text-sm mt-1">
                When your referrals upgrade, they'll appear here!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Commission
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referredPaid.map((user: any, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {typeof user === "object"
                          ? user.username || user.name || `User ${index + 1}`
                          : String(user)}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {typeof user === "object" && user.planName
                          ? user.planName
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        £
                        {typeof user === "object" && user.planName
                          ? (
                              COMMISSION_RATES[user.planName.toLowerCase()] || 0
                            ).toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="mt-8 bg-red-50 border border-red-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Share and Earn!
          </h3>
          <p className="text-gray-600 mb-4">
            Invite your fellow football personals to join using your referral
            code or link. You’ll earn rewards when they sign up and upgrade to a
            paid plan.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Copy Referral Link
            </button>
            <button
              onClick={() => {
                const link = `${import.meta.env.VITE_HOME}/signup?ref=${currentProfile.referralCode}`;
                const text = `Join me on Outceedo! Use my referral code: ${currentProfile.referralCode}`;
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
                  "_blank",
                );
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Share on Twitter/X
            </button>
            <button
              onClick={() => {
                const link = `${import.meta.env.VITE_HOME}/signup?ref=${currentProfile.referralCode}`;
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
                  "_blank",
                );
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Share on LinkedIn
            </button>
            <button
              onClick={() => {
                const link = `${import.meta.env.VITE_HOME}/signup?ref=${currentProfile.referralCode}`;
                const text = `Join me on Outceedo! Use my referral code: ${currentProfile.referralCode}`;
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}`,
                  "_blank",
                );
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Share on Facebook
            </button>
            <button
              onClick={() => {
                const link = `${import.meta.env.VITE_HOME}/signup?ref=${currentProfile.referralCode}`;
                const text = `Join me on Outceedo! Use my referral code: ${currentProfile.referralCode}\n${link}`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? "Copied for Instagram!" : "Share on Instagram"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
