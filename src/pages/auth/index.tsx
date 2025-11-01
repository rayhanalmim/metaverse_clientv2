import { getI18n } from 'react-i18next';
import LoginForm from 'src/components/LoginForm';
import RegisterForm from 'src/components/RegisterForm';
import './style.css';
import Logo from 'src/assets/images/logo.png';
import LogoMetaVerse from 'src/assets/images/logo-metaverse.svg';
import ForgetPasswordForm from 'src/components/ForgetPasswordForm';
import VerifyPasswordForm from 'src/components/VerifyPasswordForm';

export const LoginPage = () => {
  const { t } = getI18n();
  return (
    <>
      <div className="login-logo">
        <img src={Logo} alt="" />
      </div>
      <div className="form-auth">
        <div className="text">
          <span>{t('login.sign_in_to_play')}</span>
        </div>
        <LoginForm />
      </div>
    </>
  );
};

export const RegisterPage = () => {
  const { t } = getI18n();
  return (
    <div className="form-auth register-container">
      <div className="page-logo">
        <img src={LogoMetaVerse} alt="" />
      </div>
      <div className="text text-register">
        <span>{t('login.register')}</span>
      </div>
      <RegisterForm />
    </div>
  );
};

export const ForgetPasswordPage = () => {
  const { t } = getI18n();
  return (
    <div className="form-auth register-container">
      <div className="page-logo">
        <img src={LogoMetaVerse} alt="" />
      </div>
      <div className="text text-register">
        <span>{t('forgot_password.title')}</span>
      </div>
      <div className="forgot-password-description">
        <span>{t('forgot_password.description')}</span>
      </div>
      <ForgetPasswordForm />
    </div>
  );
};

export const VerifyPasswordPage = () => {
  const { t } = getI18n();
  return (
    <div className="form-auth register-container">
      <div className="page-logo">
        <img src={LogoMetaVerse} alt="" />
      </div>
      <div className="text text-register">
        <span>{t('verify_password.title')}</span>
      </div>
      <VerifyPasswordForm />
    </div>
  );
};
