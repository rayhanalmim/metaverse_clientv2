import { IAvatar, IMasterItem } from '../general';

export interface ILoginData {
  accessToken: string;
}

export interface IUserData {
  avatar?: IAvatar;
  items: IMasterItem[];
  avatar_id?: number;
  created_at: string;
  id: number;
  last_position: string;
  updated_at: string;
  username: string;
  wallet_address?: string;
  last_room: string;
  previous_position: string;
}

export interface IActivityItem {
  activityType: IActivityType;
  amount: string;
  from: string;
  hash: string;
  timestamp: string;
  to: string;
  token: string;
  tokenId: string;
  type: string;
  key: number;
}

export enum IActivityType {
  LIST = 'list',
  IN = 'in',
  OUT = 'out',
}

export interface IListActivity {
  curr: IActivityItem[];
  next: IActivityItem[];
  prev: IActivityItem[];
}
