import HttpRequest from 'src/libs/request';
import { DEFAULT_API_HOST } from 'src/config';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { IStoreItemData } from 'src/interfaces/property';
import { IHomeLandData } from 'src/interfaces/general';
import { getNetworkId } from 'src/hooks/useAuth';

const prefix = '/nft';

class myNftRepository extends HttpRequest {
  constructor() {
    super(DEFAULT_API_HOST + prefix);
  }

  list<T = ResponseData<IHomeLandData[]>>(type: string): Promise<AxiosResponse<T>> {
    let query = '';
    if (type) {
      query = type + '&chain_id=' + getNetworkId();
    } else query = '?chain_id=' + getNetworkId();
    return this.get('/my-nft/list' + query);
  }

  listStoreSelling<T = ResponseData<IStoreItemData[]>>(owner): Promise<AxiosResponse<T>> {
    const query = `?owner=${owner}&chain_id=${getNetworkId()}`;
    return this.get('/list-selling' + query);
  }

  applyHome<T = ResponseData<string>>(homeId, landId): Promise<AxiosResponse<T>> {
    return this.post('/my-nft/apply', {
      // eslint-disable-next-line camelcase
      home_id: homeId,
      // eslint-disable-next-line camelcase
      land_id: landId,
      // eslint-disable-next-line camelcase
      chain_id: getNetworkId(),
    });
  }

  getMatItem() {
    return this.get(`/my-nft/mat?chain_id=${getNetworkId()}`);
  }

  getMatDetail(id) {
    return this.get(`/my-nft/mat/${id}`);
  }

  changeMatDetail(id, idList) {
    return this.patch('/my-nft/mat/' + id, { idList });
  }

  matListSelling() {
    return this.get(`/my-nft/mat/selling-list?chain_id=${getNetworkId()}`);
  }
}

export default new myNftRepository();
