import { getI18n } from 'react-i18next';
import useLoginForm from 'src/hooks/useLoginForm';
import FormInput from 'src/components/Form/Input';
import FormButton from 'src/components/Form/Button';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { t } = getI18n();
  const navigate = useNavigate();
  const { register, onLogin, handleSubmit, errors, isSubmitting } = useLoginForm();

  const onShowRegister = () => {
    navigate('/auth/register');
  };

  const onShowForgetPassword = () => {
    navigate({ pathname: '/auth/forget-password' });
  };

  return (
    <form className="form-login" onSubmit={handleSubmit(onLogin)}>
      <FormInput
        register={register}
        name="userName"
        placeholder={t('login.username')}
        errors={errors}
        rounded="md"
      />
      <FormInput
        register={register}
        name="password"
        type="password"
        errors={errors}
        placeholder={t('login.password')}
        rounded="md"
      />
      <div className="forgot-password">
        <span onClick={onShowForgetPassword}>{t('login.forgot_password')}</span>
      </div>
      <div className="form-btn">
        <FormButton
          loading={isSubmitting}
          className="login-btn"
          size="lg"
          type="submit"
          rounded="md"
        >
          {t('login.login')}
        </FormButton>
        <span className="or">{t('login.or')}</span>
        <FormButton className="register-btn" size="lg" rounded="md" onClick={onShowRegister}>
         {t('login.register')}
        </FormButton>
      </div>
    </form>
  );
};

export default LoginForm;
