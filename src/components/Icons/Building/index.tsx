import React from 'react';

interface IconBuildingProps {
  className?: string;
  color?: string;
}

const IconBuilding: React.FC<IconBuildingProps> = ({ className, color = '#F9AB17' }) => {
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
        d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M3 7H21M3 11H21M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1" fill={color} />
      <circle cx="15" cy="9" r="1" fill={color} />
    </svg>
  );
};

export default IconBuilding;
