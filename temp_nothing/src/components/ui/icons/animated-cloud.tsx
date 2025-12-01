"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCloudProps {
  className?: string;
  width?: number;
  height?: number;
  animate?: boolean;
  animationType?: "float" | "pulse" | "bounce" | "spin" | "ping" | "none";
  speed?: "slow" | "normal" | "fast";
  variant?: "normal" | "dim";
  hover?: boolean;
}

export const AnimatedCloud: React.FC<AnimatedCloudProps> = ({
  className = "",
  width = 120,
  height = 100,
  animate = true,
  animationType = "float",
  speed = "normal",
  variant = "normal",
  hover = false,
}) => {
  const getAnimationClass = () => {
    if (!animate || animationType === "none") return "";

    switch (animationType) {
      case "float":
        return "animate-bounce";
      case "pulse":
        return "animate-pulse";
      case "bounce":
        return "animate-bounce";
      case "spin":
        return "animate-spin";
      case "ping":
        return "animate-ping";
      default:
        return "";
    }
  };

  const getVariantStyles = () => {
    return variant === "dim" 
      ? "opacity-60" 
      : "opacity-100";
  };

  const getHoverStyles = () => {
    return hover 
      ? "hover:scale-110 hover:rotate-3 transition-transform duration-300" 
      : "";
  };

  const getCloudColor = () => {
    return variant === "dim" ? "#9CA3AF" : "currentColor";
  };

  // Cloud pixel positions from the new SVG (76x64 viewBox)
  const cloudPixels = [
    // Top row
    { cx: 24, cy: 10 }, { cx: 38, cy: 10 }, { cx: 52, cy: 10 }, { cx: 66, cy: 10 },
    { cx: 17, cy: 10 }, { cx: 45, cy: 10 }, { cx: 59, cy: 10 },
    // Second row
    { cx: 24, cy: 17 }, { cx: 38, cy: 17 }, { cx: 52, cy: 17 }, { cx: 66, cy: 17 },
    { cx: 73, cy: 17 }, { cx: 10, cy: 17 }, { cx: 17, cy: 17 }, { cx: 31, cy: 17 },
    { cx: 45, cy: 17 }, { cx: 59, cy: 17 },
    // Third row (24)
    { cx: 38, cy: 24 }, { cx: 52, cy: 24 }, { cx: 66, cy: 24 }, { cx: 73, cy: 24 },
    { cx: 24, cy: 24 }, { cx: 10, cy: 24 }, { cx: 31, cy: 24 }, { cx: 45, cy: 24 },
    { cx: 59, cy: 24 }, { cx: 17, cy: 24 }, { cx: 3, cy: 24 },
    // Fourth row (31)
    { cx: 38, cy: 31 }, { cx: 52, cy: 31 }, { cx: 66, cy: 31 }, { cx: 73, cy: 31 },
    { cx: 10, cy: 31 }, { cx: 24, cy: 31 }, { cx: 31, cy: 31 }, { cx: 45, cy: 31 },
    { cx: 59, cy: 31 }, { cx: 17, cy: 31 }, { cx: 3, cy: 31 },
    // Bottom row (38)
    { cx: 38, cy: 38 }, { cx: 52, cy: 38 }, { cx: 66, cy: 38 }, { cx: 10, cy: 38 },
    { cx: 24, cy: 38 }, { cx: 31, cy: 38 }, { cx: 45, cy: 38 }, { cx: 59, cy: 38 },
    { cx: 17, cy: 38 },
    // Top edge pixels
    { cx: 52, cy: 3 }, { cx: 45, cy: 3 }, { cx: 59, cy: 3 }
  ];

  return (
    <div 
      className={cn(
        "relative inline-block",
        getVariantStyles(),
        getHoverStyles(),
        className
      )}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 76 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full",
          getAnimationClass()
        )}
        style={{
          animationDuration: animate ? {
            slow: "6s",
            normal: "3s", 
            fast: "1.5s"
          }[speed] : undefined
        }}
      >
        {cloudPixels.map((pixel, index) => (
          <circle
            key={index}
            cx={pixel.cx}
            cy={pixel.cy}
            r="3"
            fill={getCloudColor()}
          />
        ))}
      </svg>
    </div>
  );
};