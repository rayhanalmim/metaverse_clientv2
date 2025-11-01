import axios from 'axios';
import { HttpStatusCode, rpcMumbaiUrl } from 'src/config';
import { getToken } from 'src/hooks/useAuth';

axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.url !== rpcMumbaiUrl) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const statusCode = error.response && error.response.status;
    switch (statusCode) {
      case HttpStatusCode.UNAUTHORIZED:
        break;
      case HttpStatusCode.FORBIDDEN:
        break;
      case HttpStatusCode.NOT_FOUND:
        // push('/404');
        break;
      case HttpStatusCode.INTERNAL_SERVER_ERROR:
        // push('/500');
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);
