import React from "react";

export const Plus = ({ size = "14", color = "#666666" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 14 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M7 3V11M3 7H11" 
        stroke={color} 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
    </svg>
  );
};