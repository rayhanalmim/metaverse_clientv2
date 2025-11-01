export interface IMasterItem {
  id: number;
  name: string;
  link: string;
  thumbnail: string;
  gender: string;
  type: string;
  parts_hided: string;
  created_at: string;
  updated_at: string;
  stat_jump: number;
  set_number: number;
}

export interface IAvatar {
  id: number;
  name: string;
  gender: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface IListing {
  id: number;
  is_closed: boolean;
}

export interface IHomeLandAttribute {
  trait_type: string;
  value: string;
}

export interface IHomeLandMetaData {
  attributes: IHomeLandAttribute[];
  description: string;
  external_url: string;
  image: string;
  name: string;
  objectId: string;
}

export interface IItemMetaData {
  attributes: IHomeLandAttribute[];
  description: string;
  external_url: string;
  image: string;
  link: string;
  name: string;
  objectId: string;
  thumbnail: string;
}

export interface IHomeLandData {
  id: number;
  is_sync_metadata: boolean;
  last_sync: number;
  listings: IListing[];
  owner: string;
  token_address: string;
  token_id: number;
  token_uri: string;
  metadata: IHomeLandMetaData;
}

export interface IItemNFTData extends IHomeLandData {
  metadata: IItemMetaData;
}
