import HttpRequest from 'src/libs/request';
import { DEFAULT_API_HOST } from 'src/config';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { IListActivity, ILoginData, IUserData } from 'src/interfaces/auth';
import { getNetworkId } from 'src/hooks/useAuth';

class AuthRepository extends HttpRequest {
  constructor() {
    super(DEFAULT_API_HOST);
  }

  login<T = ResponseData<ILoginData>>(
    username: string,
    password: string,
  ): Promise<AxiosResponse<T>> {
    return this.post('/auth/login', { username, password });
  }

  register<T = ResponseData<ILoginData>>(
    username: string,
    password: string,
    email: string,
  ): Promise<AxiosResponse<T>> {
    return this.post('/auth/register', { username, password, email });
  }

  forgotPassword<T = ResponseData<ILoginData>>(email: string): Promise<AxiosResponse<T>> {
    return this.post('/auth/forgot-password', { email });
  }

  linkToWallet<T = ResponseData<ILoginData>>(
    message: string,
    signature: string,
  ): Promise<AxiosResponse<T>> {
    return this.post('/auth/login-with-metamask', { message, signature });
  }

  user<T = ResponseData<IUserData>>(): Promise<AxiosResponse<T>> {
    return this.get('/user/me?chain_id=' + getNetworkId());
  }

  setUser<T = ResponseData<IUserData>>(
    avatarID: number,
    itemIdList: number[],
  ): Promise<AxiosResponse<T>> {
    // eslint-disable-next-line camelcase
    return this.patch('/user/me', { avatarID, itemIdList, chain_id: getNetworkId() });
  }

  getListActivity<T = ResponseData<IListActivity>>(
    page: number,
    limit: number,
  ): Promise<AxiosResponse<T>> {
    return this.get(`/user/activity?page=${page}&limit=${limit}&chain_id=${getNetworkId()}`);
  }
}

export default new AuthRepository();
