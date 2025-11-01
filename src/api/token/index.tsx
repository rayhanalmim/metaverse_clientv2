import HttpRequest from 'src/libs/request';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { NFT_MUMBAI, NFT_OVE, rpcMumbaiUrl, rpcUrl } from 'src/config';

class tokenRepository extends HttpRequest {
  constructor() {
    super(rpcUrl);
  }

  getAccountToken<T = ResponseData<string>>(account): Promise<AxiosResponse<T>> {
    const OVE = NFT_OVE;
    const data: any = {
      id: 0,
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: OVE,
          data: '0x70a08231000000000000000000000000' + account.slice(2),
        },
        'latest',
      ],
    };
    return this.post('', data);
  }
}

class tokenMumbaiRepository extends HttpRequest {
  constructor() {
    super(rpcMumbaiUrl);
  }

  getAccountToken<T = ResponseData<string>>(account): Promise<AxiosResponse<T>> {
    const OVE = NFT_MUMBAI;
    const data = {
      id: 0,
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: OVE,
          data: '0x70a08231000000000000000000000000' + account.slice(2),
        },
        'latest',
      ],
    };
    return this.post('', data, { headers: { Authorization: '' } });
  }
}

export default new tokenRepository();

export const tokenMumbai = new tokenMumbaiRepository();
