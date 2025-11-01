import HttpRequest from 'src/libs/request';
import { API_LOGIN } from 'src/config';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { ILoginData, IUserData } from 'src/interfaces/auth';

class LoginRepository extends HttpRequest {
  constructor() {
    super(API_LOGIN);
  }

  login<T = ResponseData<ILoginData>>(
    username: string,
    password: string,
  ): Promise<AxiosResponse<T>> {
    return this.post('/auth/login', { username, password });
  }

  logout<T = ResponseData<ILoginData>>(): Promise<AxiosResponse<T>> {
    return this.get('/auth/logout');
  }

  resetPassword<T = ResponseData<ILoginData>>(
    code: string,
    newPassword: string,
    email: string,
  ): Promise<AxiosResponse<T>> {
    return this.post('/auth/reset-password', { code, newPassword, email });
  }

  disconnectWallet<T = ResponseData<string>>(): Promise<AxiosResponse<T>> {
    return this.get('/auth/disconect-with-metamask');
  }
}

export default new LoginRepository();
