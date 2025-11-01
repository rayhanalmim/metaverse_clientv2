import { getI18n } from 'react-i18next';
import FormInput from 'src/components/Form/Input';
import FormButton from 'src/components/Form/Button';
import useVerifyPasswordForm from 'src/hooks/useVerifyPasswordForm';

const VerifyPasswordForm = () => {
  const { t } = getI18n();
  const { register, onVerify, handleSubmit, errors, isSubmitting, getValues } =
    useVerifyPasswordForm();

  return (
    <form className="form-register" onSubmit={handleSubmit(onVerify)}>
      <div className="forgot-password-description">
        <span>
          {t('verify_password.description')} <span className="email">[{getValues('email')}]</span>
        </span>
      </div>
      <div className="enter-code">{t('verify_password.enter_code')}</div>
      <FormInput
        register={register}
        name="code"
        placeholder={t('verify_password.enter_code_here')}
        errors={errors}
        rounded="md"
      />
      <div className="check-spam">{t('verify_password.check_spam')}</div>
      <FormInput
        register={register}
        name="password"
        type="password"
        errors={errors}
        placeholder={t('login.password')}
        rounded="md"
      />
      <FormInput
        register={register}
        name="confirmPassword"
        type="password"
        errors={errors}
        placeholder={t('login.confirm_password')}
        rounded="md"
      />
      <div className="form-btn verify-btn">
        <FormButton
          loading={isSubmitting}
          className="login-btn continue-btn"
          size="lg"
          rounded="md"
          type="submit"
        >
          {t('verify_password.reset')}
        </FormButton>
      </div>
    </form>
  );
};

export default VerifyPasswordForm;
