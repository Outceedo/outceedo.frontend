/* ============================================================
   Redeem — shared Ceedo Coins page for every account type.
   Shows the player's coin balance (won exclusively through the
   World Cup 2026 X Outceedo campaign) and a "Play Now" CTA that
   carries the user's email to play.outceedo.com so the games
   keep banking coins against the same account.

   Coins are stored in the "other" service keyed by email and
   linked to the username by an hourly cron, so a freshly-earned
   balance can take up to an hour to show up here.
   ============================================================ */
import { useEffect, useState } from "react";
import { Clock, Loader2, Gift, Sparkles } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { gameCoinsService } from "@/store/apiConfig";
import coinLogo from "@/assets/images/logosmall.png";

const PLAY_URL = "https://play.outceedo.com";

// Placeholder catalogue — the real redeemable rewards land here later.
const UPCOMING_REWARDS = [
  "Premium Subscription",
  "Profile Boost",
  "Exclusive Merch",
  "Expert Session Credit",
];

const Redeem = () => {
  const currentProfile = useAppSelector(
    (state) => state.profile.currentProfile,
  );
  const authUser = useAppSelector((state) => state.auth.user);

  const username =
    currentProfile?.username || localStorage.getItem("username") || "";
  // Email lives on the redux profile; fall back to auth/localStorage so the
  // CTA always has something to carry to play.outceedo.com.
  const email =
    currentProfile?.email ||
    authUser?.email ||
    localStorage.getItem("email") ||
    "";

  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    gameCoinsService
      .get(`/username/${encodeURIComponent(username)}`)
      .then((res) => {
        if (active) setCoins(res.data?.coins ?? 0);
      })
      .catch((err) => {
        // 404 = no linked coin record yet → show 0.
        if (active) setCoins(err?.response?.status === 404 ? 0 : null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  const handlePlayNow = () => {
    const target = email
      ? `${PLAY_URL}/?email=${encodeURIComponent(email)}`
      : PLAY_URL;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Balance banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
              <img
                src={coinLogo}
                alt="Ceedo Coins"
                className="h-14 w-14 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Your Ceedo Coins
              </p>
              <div className="flex items-center h-12">
                {loading ? (
                  <Loader2 className="h-9 w-9 animate-spin text-white" />
                ) : (
                  <span className="text-5xl font-extrabold tabular-nums leading-none">
                    {coins === null ? "—" : coins.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayNow}
            className="px-8 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-md hover:bg-amber-50 transition-colors whitespace-nowrap"
          >
            Play Now
          </button>
        </div>

        <Sparkles className="absolute -right-4 -top-4 h-28 w-28 text-white/10" />
      </div>

      {/* Campaign + sync note */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3">
          Ceedo Coins can be won{" "}
          <span className="font-semibold">exclusively</span> through the{" "}
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            World Cup 2026 X Outceedo
          </span>{" "}
          campaign.
        </p>
        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-slate-800 rounded-xl px-4 py-3">
          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Note: coins you win can take up to 1 hour to update here.</span>
        </div>
      </div>

      {!email && (
        <p className="mt-3 text-xs text-red-500">
          We couldn't find your email — coins earned may not sync back to this
          account.
        </p>
      )}

      {/* Redeem store */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Redeem your coins
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
            Coming soon
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {UPCOMING_REWARDS.map((reward) => (
            <div
              key={reward}
              className="relative rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-5 flex flex-col items-center text-center"
            >
              <div className="bg-amber-100 dark:bg-slate-800 rounded-xl p-3 mb-3">
                <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-200">
                {reward}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Available soon
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Redeem;
