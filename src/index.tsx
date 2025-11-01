import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './locales/i18n';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import Cookies from 'universal-cookie';
import { Buffer } from 'buffer';
import './config';
import { setNetworkId } from './hooks/useAuth';

window.Buffer = window.Buffer || Buffer;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const cookies = new Cookies();
cookies.remove('token', { path: '/' });
setNetworkId('97');

const root = ReactDOM.createRoot(document.getElementById('mainUI') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// new App3D();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
export {};
