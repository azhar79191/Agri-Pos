import React from "react";
import { Sprout } from "lucide-react";

/**
 * Logo Component - Premium AgriNest POS Logo
 * Can be used in different sizes and variants
 */
const Logo = ({ 
  size = "md", 
  variant = "default", 
  showText = true,
  className = "" 
}) => {
  const sizes = {
    xs: { container: "w-6 h-6", icon: "w-3 h-3", text: "text-xs" },
    sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-sm" },
    md: { container: "w-10 h-10", icon: "w-5 h-5", text: "text-base" },
    lg: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-lg" },
    xl: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-xl" },
    "2xl": { container: "w-20 h-20", icon: "w-10 h-10", text: "text-2xl" },
  };

  const variants = {
    default: {
      container: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: "text-white",
      text: "text-slate-900 dark:text-white",
      tagline: "text-slate-500 dark:text-slate-400",
    },
    light: {
      container: "bg-white border-2 border-blue-500",
      icon: "text-blue-600",
      text: "text-slate-900",
      tagline: "text-slate-500",
    },
    dark: {
      container: "bg-slate-900 border-2 border-blue-500",
      icon: "text-blue-400",
      text: "text-white",
      tagline: "text-slate-400",
    },
    gradient: {
      container: "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500",
      icon: "text-white",
      text: "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text",
      tagline: "text-slate-500 dark:text-slate-400",
    },
    minimal: {
      container: "bg-transparent",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-slate-900 dark:text-white",
      tagline: "text-slate-500 dark:text-slate-400",
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div
        className={`${sizeConfig.container} ${variantConfig.container} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105`}
      >
        <Sprout className={`${sizeConfig.icon} ${variantConfig.icon}`} />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold ${sizeConfig.text} ${variantConfig.text} leading-none tracking-tight`}>
            AgriNest
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text"> POS</span>
          </div>
          {size !== "xs" && size !== "sm" && (
            <p className={`text-[10px] ${variantConfig.tagline} tracking-widest uppercase font-medium mt-0.5`}>
              Pesticide Management
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * LogoIcon - Just the icon without text
 */
export const LogoIcon = ({ size = "md", variant = "default", className = "" }) => {
  return <Logo size={size} variant={variant} showText={false} className={className} />;
};

/**
 * LogoFull - Full logo with tagline
 */
export const LogoFull = ({ size = "md", variant = "default", className = "" }) => {
  const sizes = {
    sm: { container: "w-8 h-8", icon: "w-4 h-4", title: "text-base", tagline: "text-[9px]" },
    md: { container: "w-10 h-10", icon: "w-5 h-5", title: "text-lg", tagline: "text-[10px]" },
    lg: { container: "w-12 h-12", icon: "w-6 h-6", title: "text-xl", tagline: "text-xs" },
    xl: { container: "w-16 h-16", icon: "w-8 h-8", title: "text-2xl", tagline: "text-sm" },
  };

  const variants = {
    default: {
      container: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: "text-white",
      text: "text-slate-900 dark:text-white",
      tagline: "text-slate-500 dark:text-slate-400",
    },
    gradient: {
      container: "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500",
      icon: "text-white",
      text: "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text",
      tagline: "text-slate-500 dark:text-slate-400",
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeConfig.container} ${variantConfig.container} rounded-xl flex items-center justify-center shadow-lg`}
      >
        <Sprout className={`${sizeConfig.icon} ${variantConfig.icon}`} />
      </div>
      <div className="flex flex-col">
        <h1 className={`font-bold ${sizeConfig.title} ${variantConfig.text} leading-none tracking-tight`}>
          AgriNest
          <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text"> POS</span>
        </h1>
        <p className={`${sizeConfig.tagline} ${variantConfig.tagline} tracking-widest uppercase font-medium mt-1`}>
          Premium Pesticide Management
        </p>
      </div>
    </div>
  );
};

export default Logo;
