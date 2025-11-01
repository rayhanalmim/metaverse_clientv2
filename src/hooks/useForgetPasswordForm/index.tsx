import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getI18n } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import auth from 'src/api/auth';
import { toast } from 'react-toastify';

type FormData = {
  email: string;
};

const useForgetPasswordForm = () => {
  const { t } = getI18n();
  const navigate = useNavigate();
  const schema = yup.object({
    email: yup
      .string()
      .email()
      .required(t('validate.required', { name: 'Email' }))
      .max(256, t('validate.max', { name: 'Email', max: 256 })),
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

  const onSendEmail = async (data: FormData) => {
    toast.dismiss();
    try {
      await auth.forgotPassword(data.email);
      navigate({ pathname: '/auth/verify-password', search: '?email=' + data.email });
      toast('Code has been sent to your email.');
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
    onSendEmail,
    handleSubmit,
    errors,
  };
};

export default useForgetPasswordForm;
