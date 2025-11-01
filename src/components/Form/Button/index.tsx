import React, { ReactNode } from 'react';
import './style.css';

type IPropsFormButton = {
  children: ReactNode;
  type?: 'submit' | 'reset' | 'button';
  onClick?: (e) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
};
const FormButton: React.FC<IPropsFormButton> = ({
  children,
  type,
  onClick,
  className,
  size,
  rounded,
  disabled,
  loading,
}) => {
  const renderClassName = () => {
    return `${className} form-button-${size || 'sm'} rounded-${rounded} ${
      loading && 'loading-btn'
    }`;
  };
  return (
    <button disabled={disabled} className={renderClassName()} type={type} onClick={onClick}>
      {children}
    </button>
  );
};

export default FormButton;
