import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../useAuth';
import { getI18n } from 'react-i18next';

type FormData = {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  isAgree: boolean;
};

const useRegisterForm = () => {
  const { t } = getI18n();
  const schema = yup.object({
    userName: yup
      .string()
      .required(t('validate.required', { name: 'Username' }))
      .min(5, t('validate.min', { name: 'Username', min: 5 }))
      .max(20, t('validate.max', { name: 'Username', max: 20 })),
    email: yup
      .string()
      .email()
      .required(t('validate.required', { name: 'Email' })),
    password: yup
      .string()
      .required(t('validate.required', { name: 'Password' }))
      .matches(/^(\S+$)/, t('validate.not_space'))
      .min(6, t('validate.min', { name: 'Password', min: 6 }))
      .max(20, t('validate.max', { name: 'Password', max: 20 })),
    confirmPassword: yup
      .string()
      .required(t('validate.required', { name: 'Confirm Password' }))
      .matches(/^(\S+$)/, t('validate.not_space'))
      .min(6, t('validate.min', { name: 'Confirm Password', min: 6 }))
      .max(20, t('validate.max', { name: 'Confirm Password', max: 20 }))
      .test('is-same-password', t('validate.password_not_match'), function (code) {
        const { password } = this.parent;
        return code === password;
      }),
    isAgree: yup.boolean().required(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const { registerUser } = useAuth();

  const onRegister = async (data: FormData) => {
    await registerUser(data);
    return;
  };

  return {
    isSubmitting,
    watch,
    register,
    onRegister,
    handleSubmit,
    errors,
  };
};

export default useRegisterForm;
