import React from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import router from './routes';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

export function App() {
  return (
    <>
      <div className="App">
        <RouterProvider router={router} />
      </div>
      <ToastContainer style={{ zIndex: '999999' }} />
    </>
  );
}
