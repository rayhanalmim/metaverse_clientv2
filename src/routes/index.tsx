import { createBrowserRouter } from 'react-router-dom';
import { ForgetPasswordPage, LoginPage, RegisterPage, VerifyPasswordPage } from '../pages/auth';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Layout from '../layouts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <MainLayout />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'forget-password',
            element: <ForgetPasswordPage />,
          },
          {
            path: 'verify-password',
            element: <VerifyPasswordPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
