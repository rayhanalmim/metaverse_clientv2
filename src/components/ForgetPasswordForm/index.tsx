import { getI18n } from 'react-i18next';
import FormInput from 'src/components/Form/Input';
import FormButton from 'src/components/Form/Button';
import useForgetPasswordForm from 'src/hooks/useForgetPasswordForm';

const ForgetPasswordForm = () => {
  const { t } = getI18n();
  const { register, onSendEmail, handleSubmit, errors, isSubmitting } = useForgetPasswordForm();

  return (
    <form className="form-register" onSubmit={handleSubmit(onSendEmail)}>
      <FormInput
        register={register}
        name="email"
        placeholder={t('login.email')}
        errors={errors}
        rounded="md"
      />
      <div className="form-btn">
        <FormButton
          loading={isSubmitting}
          className="login-btn continue-btn"
          size="lg"
          rounded="md"
          type="submit"
        >
          {t('login.continue')}
        </FormButton>
      </div>
    </form>
  );
};

export default ForgetPasswordForm;
