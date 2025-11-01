import React from 'react';

interface IconNFTProps {
  className?: string;
  color?: string;
}

const IconNFT: React.FC<IconNFTProps> = ({ className, color = '#F9AB17' }) => {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18 3H6C4.343 3 3 4.343 3 6V18C3 19.657 4.343 21 6 21H18C19.657 21 21 19.657 21 18V6C21 4.343 19.657 3 18 3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.5C9.82843 10.5 10.5 9.82843 10.5 9C10.5 8.17157 9.82843 7.5 9 7.5C8.17157 7.5 7.5 8.17157 7.5 9C7.5 9.82843 8.17157 10.5 9 10.5Z"
        fill={color}
      />
      <path
        d="M7.5 15L10.5 12L13.5 15L16.5 11.25"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconNFT; 