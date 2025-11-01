export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export const DEFAULT_API_HOST = process.env.REACT_APP_API_END_POINT || 'localhost';

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

export const EC_SITE_URL = process.env.REACT_APP_EC_SITE_URL || '';
export const NFT_LANDS_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_LANDS_CONTRACT_ADDRESS || '';
export const NFT_HOME_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_HOME_CONTRACT_ADDRESS || '';
export const NFT_CONTRACT_MARKET = process.env.REACT_APP_NFT_CONTRACT_MARKET || '';
export const NFT_ETH_CONTRACT_MARKET = process.env.REACT_APP_NFT_ETH_CONTRACT_MARKET || '';
export const NFT_OVE = process.env.REACT_APP_NFT_OVE || '';
export const NFT_ETH_OVE = process.env.REACT_APP_NFT_ETH_OVE || '';
export const NFT_MUMBAI = process.env.REACT_APP_NFT_MUMBAI || '';
export const BNB_CHAIN_ID = process.env.REACT_APP_BNB_CHAIN_ID || '97';
export const MUMBAI_CHAIN_ID = process.env.REACT_APP_MUMBAI_CHAIN_ID || '17000';
export const NFT_CLANDS = process.env.REACT_APP_NFT_CLANDS || '';
export const NFT_CHOMES = process.env.REACT_APP_NFT_CHOMES || '';
export const ETH_CLANDS = process.env.REACT_APP_ETH_LANDS_CONTRACT_ADDRESS || '';
export const ETH_CHOMES = process.env.REACT_APP_ETH_HOME_CONTRACT_ADDRESS || '';
export const API_LOGIN = process.env.REACT_APP_API_LOGIN || '';
export const PROJECT_ID = process.env.REACT_APP_PROJECT_ID || '';
export const TX_HASH_URL = process.env.REACT_APP_TX_HASH_URL || 'https://testnet.bscscan.com/tx/';
export const MARKET_PLACE_URL = process.env.REACT_APP_MARKET_PLACE_URL || '';
export const OWNER_ADDRESS = process.env.REACT_APP_OWNER_ADDRESS || '';
export const DEEP_LINK =
  process.env.REACT_APP_DEEP_LINK ||
  'https://metamask.app.link/dapp/dev-samuraimetaverse.cmcglobal.vn';
export const NODE_ENV = process.env.REACT_APP_NODE_ENV || 'development';
export const rpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
export const rpcMumbaiUrl = 'https://polygon-mumbai.blockpi.network/v1/rpc/public';
