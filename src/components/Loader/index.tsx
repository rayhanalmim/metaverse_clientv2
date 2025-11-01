import './style.css';
import Logo from 'src/assets/images/logo.png';
import { useCallback, useEffect, useMemo, useState } from 'react';

type IProps = {
  isLoading: boolean;
};

const Loader = ({ isLoading }: IProps) => {
  const [time, setTime] = useState(0);
  const app: HTMLElement = document.querySelector('.App');
  useEffect(() => {
    let initTime = 0;
    const timer = setInterval(() => {
      if (!isLoading && initTime > 100) {
        initTime = 3000;
        setTime(3000);
        clearInterval(timer);
        setTimeout(() => {
          initTime = 0;
          setTime(0);
        }, 700);
        return;
      }
      if (isLoading && initTime >= 2400) {
        if (initTime >= 2940) return;
        initTime = initTime + 1;
        setTime((t) => t + 1);
        return;
      }
      initTime = initTime + 30;
      setTime((t) => t + 30);
    }, 30);
    return () => {
      clearInterval(timer);
      removeIndexApp();
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      setIndexApp();
      return;
    }
    if (!isLoading) removeIndexApp();
  }, [isLoading]);
  const setIndexApp = () => {
    if (app) {
      app.style.zIndex = '99999';
    }
  };
  const removeIndexApp = () => {
    if (app) app.style.zIndex = '1';
  };

  const styled = useMemo(() => {
    if (!isLoading && time === 0) return { width: '0', height: '0', display: 'none' };
    return { width: '100vw', height: '100vh' };
  }, [isLoading, time]);

  const setTimeWidth = useCallback(() => {
    return { width: ((time / 3000) * 100).toFixed(0) + '%' };
  }, [time]);
  return (
    <div className="loading" style={styled}>
      <div className="login-logo">
        <img src={Logo} alt="" />
      </div>
      <div className="progress-loader">
        <div className="line"></div>
        <div className="time" style={setTimeWidth()}></div>
      </div>
      <div className="percent">{setTimeWidth().width}</div>
    </div>
  );
};

export default Loader;
