import axios, { AxiosRequestConfig, AxiosStatic } from 'axios';
import { DEFAULT_API_HOST } from 'src/config';
import './interceptor';

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Requested-With': 'application/json',
};

export interface RequestParams {
  [key: string]: string | number | null | undefined | boolean | string[];
}

export interface RequestBody {
  [key: string]:
    | string
    | number
    | boolean
    | number[]
    | Record<string, unknown>
    | null
    | undefined
    | unknown;
}

class HttpRequest {
  private readonly headers: {
    [key: string]: string;
  };

  protected readonly apiUrl: string;
  private readonly axios: AxiosStatic;

  constructor(apiUrl: string = DEFAULT_API_HOST) {
    this.headers = DEFAULT_HEADERS;
    this.apiUrl = apiUrl;
    this.axios = axios;
  }

  getURL(path: string) {
    return `${this.apiUrl}${path}`;
  }

  get(path: string, params?: RequestParams, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      params,
      headers: this.headers,
      ...config,
    };
    return this.axios.get(requestUrl, requestConfig);
  }

  post(path: string, data?: RequestBody, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      headers: this.headers,
      ...config,
    };

    return this.axios.post(requestUrl, data, requestConfig);
  }

  put(path: string, data?: any, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      headers: this.headers,
      ...config,
    };

    return this.axios.put(requestUrl, data, requestConfig);
  }

  patch(path: string, data?: RequestBody, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      headers: this.headers,
      ...config,
    };

    return this.axios.patch(requestUrl, data, requestConfig);
  }

  delete(path: string, params?: RequestParams, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      params,
      headers: this.headers,
      ...config,
    };

    return this.axios.delete(requestUrl, requestConfig);
  }

  custom(config: AxiosRequestConfig) {
    return this.axios(config);
  }

  upload(path: string, data?: FormData, config?: AxiosRequestConfig) {
    const requestUrl = this.getURL(path);
    const requestConfig: AxiosRequestConfig = {
      headers: this.headers,
      ...config,
    };

    return this.axios.post(requestUrl, data, requestConfig);
  }
}

export default HttpRequest;
