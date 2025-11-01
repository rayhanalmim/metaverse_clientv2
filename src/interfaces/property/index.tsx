export interface ITypeProperty extends IHomeProperty {
  selling_id?: string;
  selling_type?: string;
  start_time?: string;
}

export interface IHomeProperty {
  created_at: number;
  id: number;
  in_selling: number;
  is_sync_metadata: number;
  last_price?: number;
  last_sync: number;
  metadata: IMetaData;
  owner: string;
  status: string;
  token_address: string;
  token_id: number;
  token_uri: string;
  home?: any;
}

export interface IMetaData {
  attributes: IAttributeMeta[];
  description: string;
  external_url: string;
  image: string;
  name: string;
  objectId: string;
}

interface IAttributeMeta {
  trait_type: string;
  value: string;
}

export interface IPagination<T> {
  count: number;
  limit: number;
  page: number;
  rows: T;
}

export interface IStoreItemData {
  buyer: any;
  end_time: number;
  id: number;
  is_closed: boolean;
  key: string;
  last_sync: number;
  nft_id: number;
  price: string;
  seller: string;
  selling_type: number;
  start_time: number;
  nft: IStoreNFT;
}

interface IStoreNFT {
  id: number;
  last_price: string;
  metadata: IMetaData;
  nft_type: INFTType;
  owner: string;
  selling_id: string;
  token_id: number;
  token_address: string;
}

export interface INFTType {
  name: string;
  symbol: string;
}
