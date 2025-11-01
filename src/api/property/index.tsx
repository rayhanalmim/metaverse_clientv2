import HttpRequest from 'src/libs/request';
import { DEFAULT_API_HOST } from 'src/config';
import { AxiosResponse } from 'axios';
import { ResponseData } from 'src/interfaces/response';
import { IHomeProperty } from 'src/interfaces/property';
import { getNetworkId } from 'src/hooks/useAuth';

const prefix = '/property';

class PropertyRepository extends HttpRequest {
  constructor() {
    super(DEFAULT_API_HOST + prefix);
  }

  getHome<T = ResponseData<IHomeProperty[]>>(): Promise<AxiosResponse<T>> {
    return this.get('/home/' + getNetworkId());
  }

  checkListing<T = ResponseData<any>>(id): Promise<AxiosResponse<T>> {
    return this.get('/check-listing/' + id);
  }

  // Rental API methods
  listForRent<T = ResponseData<any>>(
    homeNftId: string,
    data: { rent_price: string; rent_period_days: number }
  ): Promise<AxiosResponse<T>> {
    return this.post(`/${homeNftId}/rent/list`, data);
  }

  acceptRent<T = ResponseData<any>>(homeNftId: string): Promise<AxiosResponse<T>> {
    return this.post(`/${homeNftId}/rent/accept`);
  }

  payRent<T = ResponseData<any>>(
    homeNftId: string,
    data?: { period_days?: number }
  ): Promise<AxiosResponse<T>> {
    return this.post(`/${homeNftId}/rent/pay`, data);
  }

  getRentStatus<T = ResponseData<any>>(homeNftId: string): Promise<AxiosResponse<T>> {
    return this.get(`/${homeNftId}/rent/status`);
  }

  // Get all rental listings
  getRentalListings<T = ResponseData<any>>(): Promise<AxiosResponse<T>> {
    return this.get('/rent/listings');
  }

  // Get rentals for specific tenant
  getTenantRentals<T = ResponseData<any>>(tenantWallet: string): Promise<AxiosResponse<T>> {
    return this.get(`/rent/tenant/${tenantWallet}`);
  }

  // Check rental availability
  checkRentalAvailability<T = ResponseData<any>>(propertyId: number): Promise<AxiosResponse<T>> {
    return this.get(`/rent/check-availability/${propertyId}`);
  }
}

export default new PropertyRepository();
