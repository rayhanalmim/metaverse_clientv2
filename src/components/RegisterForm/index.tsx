import { getI18n } from 'react-i18next';
import FormInput from 'src/components/Form/Input';
import FormButton from 'src/components/Form/Button';
import useRegisterForm from 'src/hooks/useRegisterForm';
import FormCheckBox from '../Form/CheckBox';

const RegisterForm = () => {
  const { t } = getI18n();
  const { register, onRegister, handleSubmit, errors, watch, isSubmitting } = useRegisterForm();

  const { isAgree } = watch();

  return (
    <form className="form-register" onSubmit={handleSubmit(onRegister)}>
      <FormInput
        register={register}
        name="email"
        placeholder={t('login.email')}
        errors={errors}
        rounded="md"
      />
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
      <FormInput
        register={register}
        name="confirmPassword"
        type="password"
        errors={errors}
        placeholder={t('login.confirm_password')}
        rounded="md"
      />
      <div className="term-checkbox">
        <FormCheckBox register={register} name="isAgree" rounded="md" />
        <span>
          {t('login.agree')} <span className="term-or-service">{t('login.term')}</span>
        </span>
      </div>
      <div className="form-btn">
        <FormButton
          loading={isSubmitting}
          disabled={!isAgree}
          className="login-btn"
          size="lg"
          rounded="md"
          type="submit"
        >
          {t('login.register')}
        </FormButton>
      </div>
    </form>
  );
};

export default RegisterForm;
