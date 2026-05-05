import React, { useState } from "react";
import { Sprout } from "lucide-react";

const PX_MAP = { "w-7": 28, "w-8": 32, "w-9": 36, "w-10": 40, "w-12": 48, "w-14": 56, "w-16": 64 };

/**
 * ShopLogo — crisp shop logo image or gradient Sprout fallback.
 * @param {string} logo  - logo URL from settings
 * @param {string} name  - shop name (alt text)
 * @param {string} size  - Tailwind size classes e.g. "w-8 h-8"
 */
const ShopLogo = ({ logo, name, size = "w-8 h-8" }) => {
  const [imgError, setImgError] = useState(false);
  const sizeKey = size.split(" ").find((c) => c.startsWith("w-"));
  const px = PX_MAP[sizeKey] || 32;

  return (
    <div className={`${size} rounded-lg flex-shrink-0 overflow-hidden bg-white`}>
      {logo && !imgError ? (
        <img
          src={logo}
          alt={name || "Shop"}
          width={px}
          height={px}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            padding: "2px",
            imageRendering: "-webkit-optimize-contrast",
            willChange: "transform",
            display: "block",
          }}
          loading="eager"
          decoding="sync"
          fetchpriority="high"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}
        >
          <Sprout className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ShopLogo;
