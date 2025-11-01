import './style.css';
import { UseFormRegister } from 'react-hook-form/dist/types/form';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import React from 'react';

type IPropsFormCheckBox = {
  name: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors | any;
  rounded?: 'sm' | 'md' | 'lg';
};

const FormCheckBox: React.FC<IPropsFormCheckBox> = ({ name, register, rounded }) => {
  const renderClassName = () => {
    if (!rounded) return 'form-checkbox';
    return `form-checkbox rounded-${rounded}`;
  };
  return (
    <div className={renderClassName()}>
      <input type="checkbox" id={name} name={name} {...register(name)} />
    </div>
  );
};

type IPropsCheckBox = {
  checked: boolean;
  rounded?: 'sm' | 'md' | 'lg';
  onChange: () => void;
};

export const CheckBox: React.FC<IPropsCheckBox> = ({ rounded, checked, onChange }) => {
  const renderClassName = () => {
    if (!rounded) return 'form-checkbox';
    return `form-checkbox rounded-${rounded}`;
  };
  return (
    <div className={renderClassName()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </div>
  );
};

export default FormCheckBox;
