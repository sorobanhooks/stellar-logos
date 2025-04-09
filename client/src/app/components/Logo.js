import React, { forwardRef } from "react";



export const Logo = forwardRef(
  ({ gradient }, ref) => {
    const gradientId = "logoGradient";

    return (
      <svg
        ref={ref}
        width='512'
        height='512'
        viewBox='0 0 236.36 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className=' flex  items-center w-full sm:w-[400px] sm:h-[400px]'
      >
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop
              offset='0%'
              style={{
                stopColor: `rgb(${gradient.start.r}, ${gradient.start.g}, ${gradient.start.b})`,
                stopOpacity: 1,
              }}
            />
            <stop
              offset='100%'
              style={{
                stopColor: `rgb(${gradient.end.r}, ${gradient.end.g}, ${gradient.end.b})`,
                stopOpacity: 1,
              }}
            />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          stroke={`url(#${gradientId})`}
          d='M203,26.16l-28.46,14.5-137.43,70a82.49,82.49,0,0,1-.7-10.69A81.87,81.87,0,0,1,158.2,28.6l16.29-8.3,2.43-1.24A100,100,0,0,0,18.18,100q0,3.82.29,7.61a18.19,18.19,0,0,1-9.88,17.58L0,129.57V150l25.29-12.89,0,0,8.19-4.18,8.07-4.11v0L186.43,55l16.28-8.29,33.65-17.15V9.14Z'
        />
        <path
          fill={`url(#${gradientId})`}
          stroke={`url(#${gradientId})`}
          d='M236.36,50,49.78,145,33.5,153.31,0,170.38v20.41l33.27-16.95,28.46-14.5L199.3,89.24A83.45,83.45,0,0,1,200,100,81.87,81.87,0,0,1,78.09,171.36l-1,.53-17.66,9A100,100,0,0,0,218.18,100c0-2.57-.1-5.14-.29-7.68a18.2,18.2,0,0,1,9.87-17.58l8.6-4.38Z'
        />
      </svg>
    );
  }
);

Logo.displayName = "Logo";
