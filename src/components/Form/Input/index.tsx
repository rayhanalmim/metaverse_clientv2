import { UseFormRegister } from 'react-hook-form/dist/types/form';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import React, { useState } from 'react';
import './style.css';
import IconEye from '../../Icons/eye';
import IconEyeOff from '../../Icons/EyeOff';

type IPropsFormInput = {
  name: string;
  label?: string;
  register: UseFormRegister<any>;
  errors: FieldErrors | any;
  required?: boolean;
  type?: string;
  placeholder?: string;
  rounded?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
};

const FormInput: React.FC<IPropsFormInput> = ({
  name,
  label,
  register,
  errors,
  required,
  type,
  placeholder,
  rounded,
  disabled,
}) => {
  const [show, setShow] = useState(false);
  const renderClassName = () => {
    if (!rounded) return 'form-input';
    return `form-input rounded-${rounded}`;
  };

  const onShowPassword = () => {
    setShow((state) => !state);
  };

  const renderInputPassword = () => {
    return (
      <div className="input-password">
        <input
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
        />
        <span className="icon" onClick={onShowPassword}>
          {show ? <IconEyeOff /> : <IconEye />}
        </span>
      </div>
    );
  };

  return (
    <div className={renderClassName()}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && '*'}
        </label>
      )}
      {type === 'password' ? (
        renderInputPassword()
      ) : (
        <input
          id={name}
          name={name}
          type={type || 'text'}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
        />
      )}
      {errors && errors[name] && <span className="error">{errors[name].message}</span>}
    </div>
  );
};

export default FormInput;
