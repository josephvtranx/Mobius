import React from "react";

export const Calendar = ({ size = "14", color = "white" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 14 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M9.33333 1.16699V3.50033M4.66667 1.16699V3.50033M1.75 5.83366H12.25M2.91667 2.33366H11.0833C11.7277 2.33366 12.25 2.85599 12.25 3.50033V11.667C12.25 12.3113 11.7277 12.8337 11.0833 12.8337H2.91667C2.27233 12.8337 1.75 12.3113 1.75 11.667V3.50033C1.75 2.85599 2.27233 2.33366 2.91667 2.33366Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};