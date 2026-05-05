import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { redeemPoints } from "../api/loyaltyApi";

/**
 * useLoyaltyRedeem — manages the redeem points modal and submission for Loyalty page.
 */
export function useLoyaltyRedeem(refresh) {
  const { actions }                   = useApp();
  const [redeemModal, setRedeemModal] = useState(null);
  const [redeemPts, setRedeemPts]     = useState("");
  const [redeeming, setRedeeming]     = useState(false);

  const handleRedeem = useCallback(async () => {
    const pts = parseInt(redeemPts);
    if (!pts || pts <= 0) { actions.showToast({ message: "Enter valid points", type: "error" }); return; }
    if (pts > redeemModal.points) { actions.showToast({ message: "Insufficient points", type: "error" }); return; }
    setRedeeming(true);
    try {
      await redeemPoints(redeemModal._id, { points: pts, description: "Manual redemption" });
      actions.showToast({ message: `${pts} points redeemed for ${redeemModal.name}`, type: "success" });
      setRedeemModal(null);
      setRedeemPts("");
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Redemption failed", type: "error" });
    } finally { setRedeeming(false); }
  }, [redeemPts, redeemModal, actions, refresh]);

  return { redeemModal, setRedeemModal, redeemPts, setRedeemPts, redeeming, handleRedeem };
}
