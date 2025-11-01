import HttpRequest from 'src/libs/request';
import { DEFAULT_API_HOST } from 'src/config';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { IAvatar, IMasterItem } from 'src/interfaces/general';
import { getNetworkId } from 'src/hooks/useAuth';

const prefix = '/general';
const DEFAULT_API_NFT = DEFAULT_API_HOST;

class GeneralRepository extends HttpRequest {
  constructor() {
    super(DEFAULT_API_HOST);
  }

  listItem<T = ResponseData<IMasterItem[]>>(): Promise<AxiosResponse<T>> {
    return this.get('/general/list-master-item?type=default');
  }

  listNFTItem<T = ResponseData<IMasterItem[]>>(): Promise<AxiosResponse<T>> {
    return this.get('/general/list-master-item?type=item&chain_id=' + getNetworkId());
  }

  listAllItem<T = ResponseData<IMasterItem[]>>(): Promise<AxiosResponse<T>> {
    return this.get('/general/list-master-item?chain_id=' + getNetworkId());
  }

  listAvatar<T = ResponseData<IAvatar[]>>(): Promise<AxiosResponse<T>> {
    return this.get('/general/list-avatar');
  }

  listUser<T = ResponseData<any>>(): Promise<AxiosResponse<T>> {
    return this.get('/general/list-user');
  }

  updateUserNFTMetadata<T = ResponseData<any>>(nftMetadata: string): Promise<AxiosResponse<T>> {
    return this.patch('/user/nft-metadata', { 'nft_metadata': nftMetadata });
  }
}

export default new GeneralRepository();
