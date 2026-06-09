/* ============================================================
   CoinsCounter — header pill showing the user's Ceedo Coin
   balance, won through the World Cup 2026 X Outceedo campaign.
   Clicking it routes to the shared /redeem page.

   Coins live in the "other" service keyed by the user's email
   and are linked to their username by an hourly cron, so a
   freshly-earned balance can take up to an hour to appear here.
   The lookup is GET /game-coins/username/:username (JWT auth);
   a 404 simply means "no coins yet" → render 0.
   ============================================================ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { gameCoinsService } from "@/store/apiConfig";
import coinLogo from "@/assets/images/logosmall.png";

function CoinsCounter() {
  const navigate = useNavigate();
  const username = useAppSelector(
    (state) => state.profile.currentProfile?.username,
  );
  const role = useAppSelector((state) => state.profile.currentProfile?.role);

  const [coins, setCoins] = useState<number | null>(null);

  // Redeem lives inside each role's layout, e.g. /player/redeem.
  const redeemPath = `/${role || localStorage.getItem("role") || ""}/redeem`;

  useEffect(() => {
    const lookup = username || localStorage.getItem("username");
    if (!lookup) return;

    let active = true;
    gameCoinsService
      .get(`/username/${encodeURIComponent(lookup)}`)
      .then((res) => {
        if (active) setCoins(res.data?.coins ?? 0);
      })
      .catch((err) => {
        // 404 = the account has no linked coin record yet → treat as 0.
        if (active) setCoins(err?.response?.status === 404 ? 0 : null);
      });

    return () => {
      active = false;
    };
  }, [username]);

  return (
    <button
      onClick={() => navigate(redeemPath)}
      title="Ceedo Coins — World Cup 2026 X Outceedo"
      className="flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-700 transition-colors"
    >
      <img src={coinLogo} alt="Ceedo Coins" className="h-6 w-6 object-contain" />
      <span className="font-semibold text-sm sm:text-base text-amber-700 dark:text-amber-400 tabular-nums">
        {coins === null ? "—" : coins.toLocaleString()}
      </span>
    </button>
  );
}

export default CoinsCounter;
