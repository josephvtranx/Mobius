import React from "react";

export const Download = ({ size = "14", color = "#666666" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 14 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M3 9V10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V9" 
        stroke={color} 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      <path 
        d="M7 9V3" 
        stroke={color} 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      <path 
        d="M4.5 6.5L7 9L9.5 6.5" 
        stroke={color} 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
    </svg>
  );
};