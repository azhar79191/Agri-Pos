import React, { useState } from "react";

const PX_MAP = {
  "w-6": 24, "w-7": 28, "w-8": 32, "w-9": 36,
  "w-10": 40, "w-11": 44, "w-12": 48, "w-14": 56,
  "w-16": 64, "w-20": 80, "w-24": 96,
};

/**
 * UserAvatar — blur-free user photo or coloured initial fallback.
 *
 * Key fixes for blur:
 * 1. Explicit integer width/height attrs — browser never guesses fractional px
 * 2. No Tailwind size classes on <img> — avoids CSS overriding explicit attrs
 * 3. object-fit: cover in inline style — not via class (avoids specificity fights)
 * 4. The wrapper div carries the Tailwind size + shape classes
 * 5. overflow-hidden on wrapper clips the image cleanly
 */
const UserAvatar = ({ user, size = "w-8 h-8", shape = "rounded-full" }) => {
  const [imgError, setImgError] = useState(false);
  const initial = user?.name?.[0]?.toUpperCase() || "U";

  const sizeKey = size.split(" ").find((c) => c.startsWith("w-"));
  const px      = PX_MAP[sizeKey] || 32;

  if (user?.avatar && !imgError) {
    return (
      <div
        className={`${size} ${shape} flex-shrink-0 overflow-hidden`}
        style={{ minWidth: px, minHeight: px }}
      >
        <img
          src={user.avatar}
          alt={user.name || "User"}
          width={px}
          height={px}
          onError={() => setImgError(true)}
          style={{
            width: px,
            height: px,
            display: "block",
            objectFit: "cover",
            objectPosition: "center top",
          }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={`${size} ${shape} flex items-center justify-center text-white font-semibold flex-shrink-0 select-none`}
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
        fontSize: Math.max(10, Math.round(px * 0.38)),
        lineHeight: 1,
        minWidth: px,
        minHeight: px,
      }}
      aria-label={user?.name || "User"}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
