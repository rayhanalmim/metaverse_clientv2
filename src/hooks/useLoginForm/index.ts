import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../useAuth';
import { getI18n } from 'react-i18next';

type FormData = {
  userName: string;
  password: string;
};

const useLoginForm = () => {
  const { t } = getI18n();
  const schema = yup
    .object({
      userName: yup
        .string()
        .required(t('validate.required', { name: 'Username' }))
        .min(5, t('validate.min', { name: 'Username', min: 5 }))
        .max(20, t('validate.max', { name: 'Username', max: 20 })),
      password: yup
        .string()
        .required(t('validate.required', { name: 'Password' }))
        .matches(/^(\S+$)/, t('validate.not_space'))
        .min(6, t('validate.min', { name: 'Password', min: 6 }))
        .max(20, t('validate.max', { name: 'Password', max: 20 })),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const { login } = useAuth();

  const onLogin = async (data: FormData) => {
    await login(data);
    return;
  };

  return {
    isSubmitting,
    register,
    onLogin,
    handleSubmit,
    errors,
  };
};

export default useLoginForm;
