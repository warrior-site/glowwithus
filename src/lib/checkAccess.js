/**
 * Evaluates whether a user has active valid access permissions
 * @param {Object} user - The mongoose User document object
 * @returns {Object} { allowed: boolean, reason: string, tier: 'free' | 'premium' | 'affiliate' }
 */
export function evaluateUserAccess(user) {
  const now = new Date();

  // 1. Check if Admin manually verified their affiliate purchase link
  if (user.purchase_verified) {
    // If you want affiliate purchases to grant lifetime access, return true.
    // If you want it to grant an expiration timeline, evaluate the date:
    if (!user.premium_expires_at || user.premium_expires_at > now) {
      return { allowed: true, reason: "Verified Affiliate Purchase Access", tier: "affiliate" };
    }
  }

  // 2. Check if they are a standard direct paid premium subscriber
  if (user.is_premium_user) {
    if (!user.premium_expires_at || user.premium_expires_at > now) {
      return { allowed: true, reason: "Active Premium Subscription", tier: "premium" };
    }
  }

  // 3. Fallback: Evaluate their Free Trial allotments
  if (user.free_scans_remaining > 0) {
    return { 
      allowed: true, 
      reason: `Free trial active. (${user.free_scans_remaining} scans left)`, 
      tier: "free" 
    };
  }

  // 4. Out of choices: Lock features
  return { allowed: false, reason: "Limit reached. Upgrade or verify an affiliate purchase to continue.", tier: "expired" };
}