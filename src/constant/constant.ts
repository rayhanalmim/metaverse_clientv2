import * as THREE from 'three';

export const UIID = {
  BTN_ENTER: 'btnEnter', // button for enter the to map after choosed a avatar
  FPS_UI: 'fpsU',
};

export const SCENE_NAME = {
  OTHER: 'Other',
  AVATARS: 'Avatars Scene',
  MAIN: 'Main Scene',
  SAMURAI: 'Samurai Scene',
  STORE: 'Store Scene',
  HUMAN: 'Human Scene',
};

export const MOUSE_EVENT_TYPE = {
  CLICK: 'click',
  CMENU: 'contextmenu',
  DBCLICK: 'dblclick',
  DOWN: 'mousedown',
  ENTER: 'onmouseenter',
  LEAVE: 'onmouseleave',
  MOVE: 'mousemove',
  OUT: 'onmouseout',
  OVER: 'onmouseover',
  UP: 'mouseup',
};

export const ASSETS = {
  ENVIRONMENT: 'textures/oberer_kuhberg_1k.hdr',
  MAIN_NAV: 'models/map/mainmap_navmesh.glb',
  SAMURAI_NAV: './models/map/samurai_navmesh.glb',
  STORE_NAV: 'models/map/store_navmesh.glb',
  HUMAN_NAV: 'models/map/human_navmesh.glb',
};

export const DEBUG_TAG = {
  FOG: 'Fog',
};

export const CLIP_NAMES = {
  IDLE: 'F_Idle',
  IDLE_1: 'F_Idle1',
  IDLE_2: 'F_Idle2',
  IDLE_3: 'F_Idle3',
  IDLE_4: 'F_Idle4',
  JUMP: 'F_Jumping',
  RUN: 'F_Run',
  WALK: 'F_Walk',
  TPOSE: 'F_TPose',
  H_IDLE: 'F_H_Idle_01',
  H_WALK: 'F_H_Walk',
  H_JUMP: 'F_H_Jump_Canter',
  H_RUN: 'F_H_Canter',
  SHOOT: 'F_Shoot',
};

export const UPDATE_TIME = 50;

export const ITEM_TYPE = {
  BODY: 'body',
  HAT: 'hat',
  MASK: 'mask',
  SHOE: 'shoe',
  GLOVE: 'glove',
  LANDS: 'lands',
  HOUSE: 'house',
  HORSE: 'horse',
  BOW: 'bow',
};

export const BODY_PART = {
  BODY: 'Body',
  ARM: 'Arm',
  FOOT: 'Foot',
  HAND: 'Hand',
  HEAD: 'Head',
  LEG: 'Leg',
};

export const BONE = {
  HEAD: 'mixamorigHead',
  TOP_END: 'mixamorigHeadTop_End',
  ROOT: 'mixamorigHips',
  SPINE1: 'mixamorigSpine1',
  SPINE: 'mixamorigSpine',
  R_SHOULDER: 'mixamorigRightShoulder',
  L_SHOULDER: 'mixamorigLeftShoulder',
  L_HAND: 'mixamorigLeftHand',
};
export const HORSE_BONE = {
  RIDE_BONE: 'Spine1',
};
export const POPUP = {
  INVENTORY: 'Inventory',
};

export const shortenString = (address: string) => {
  return address.length > 15 ? address.substr(0, 6).concat('...') + address.substr(-5) : address;
};

export const inventoryTabs = [
  { name: 'body', key: ITEM_TYPE.BODY },
  { name: 'head', key: ITEM_TYPE.HAT },
  { name: 'face', key: ITEM_TYPE.MASK },
  { name: 'hand', key: ITEM_TYPE.GLOVE },
  { name: 'feet', key: ITEM_TYPE.SHOE },
  { name: 'house', key: ITEM_TYPE.HOUSE },
  { name: 'land', key: ITEM_TYPE.LANDS },
  { name: 'horse', key: ITEM_TYPE.HORSE },
  { name: 'bow', key: ITEM_TYPE.BOW },
];

export const defaultItem = {
  gender: '0',
  id: 15,
  link: 'models/items/Set1_Body.glb',
  name: 'Body 1',
  // eslint-disable-next-line camelcase
  parts_hided: 'Body Arm Leg',
  thumbnail: 'models/items/thumb/Set1_Body.png',
  type: ITEM_TYPE.BODY,
};

export const LAND_STATUS = {
  UN_BUY: 'NOT_BUYED',
  BUYED: 'BUYED',
  HAS_HOME: 'HAS_HOME',
};
export const BUILD_STATUS = {
  BUILDED: 1,
  NOT_BUILD: 0,
};
export const LAND_TYPE = {
  STORE: 'Store',
  SAMURAI: 'Samurai',
  HUMAN: 'Human',
  MARKETPLACE: 'Marketplace',
  ECSITE: 'Ecsite',
  MAT: 'Mat',
};

export const RAYLAYER = {
  PORTAL: 2,
  BUILDING: 3,
  LAND: 4,
  ENVIRONMENT: 5,
  NPC: 6,
};

export const COLLISION_GROUP = {
  PORTAL: 2,
};

export const CONTROL_MODE = {
  MAP: 'map',
  FPS: 'fps',
  TPS: 'tps',
};

export const HARDWARE_LEVEL = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export const ACTIONS_DEFINE = {
  IDLE: 0.2,
  RUN: 4,
};

export const SOCKET_EVENTS = {
  OVERVIEW: 'overview',
  JUMP: 'room.jump',
  SHOOT: 'room.shoot',
  ARROW: 'room.arrow',
  JOIN: 'room.join',
  INIT: 'room.init',
  OUT: 'room.out',
  MOVEMENT: 'room.movement',
  CHANGE_ITEMS: 'room.change-items',
  DISCONNECT: 'disconnect',
  BUY_LAND_HOME: 'hook.buy-land-home',
  LAST_LOGIN: 'last-login',
  CHANGE_PASSWORD: 'change-password',
  APPLY_HOME: 'room.apply-home',
  ROOM_BUY_HOME_LAND: 'room.buy-home-land',
};

export const JUMP_TYPE = {
  START: 1,
  END: 2,
};
export const SHOOT_TYPE = {
  START: 1,
  UPDATE: 2,
  END: 3,
};
export const ARROW_TYPE = {
  START: 1,
  UPDATE: 2,
  FORCE_UPDATE: 4,
  END: 3,
};
export const VEC3_DIR = {
  DOWN: new THREE.Vector3(0, -1, 0),
  UP: new THREE.Vector3(0, 1, 0),
  LEFT: new THREE.Vector3(-1, 0, 0),
  RIGHT: new THREE.Vector3(1, 0, 0),
};

export const msgMap = {
  DNE: 'Listing not exist',
  '!PRICE': 'Invalid Price',
  'cannot buy from listing.': 'Listing Type Invalid',
  'invalid amount of tokens.': 'Invalid amount of token',
  'not within sale window.': 'Not in the sale time',
  '!BAL20': 'Not enough balance or approval OVE',
  '!BALNFT': 'Not enough balance or approval NFT',
  'fees exceed the price': 'Fees exceed the price',
};

export const binanceParams = [
  {
    chainName: 'Binance Smart Chain',
    chainId: '0x61',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
];

export const mumbaiParams = [
  {
    chainName: 'Mumbai Testnet',
    chainId: '0x13881',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
];
