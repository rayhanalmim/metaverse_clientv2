import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getI18n } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import login from 'src/api/login';

type FormData = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

const useVerifyPasswordForm = () => {
  const { t } = getI18n();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const schema = yup.object({
    code: yup.string().required(t('validate.required', { name: 'Code' })),
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
      .test('is-same-password', t('validate.password_not_match'), function (pw) {
        const { password } = this.parent;
        return pw === password;
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      email: search.get('email').replace(/ /g, '+'),
    },
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const onVerify = async (data: FormData) => {
    toast.dismiss();
    try {
      await login.resetPassword(data.code, data.password, data.email);
      toast('Successfully Reset Password');
      navigate({ pathname: '/auth/login' });
    } catch (e) {
      toast(
        Array.isArray(e.response.data.message)
          ? e.response.data.message[0]
          : e.response.data.message,
        { type: 'error' },
      );
      await Promise.resolve();
    }
  };

  return {
    isSubmitting,
    watch,
    register,
    onVerify,
    handleSubmit,
    getValues,
    errors,
  };
};

export default useVerifyPasswordForm;
