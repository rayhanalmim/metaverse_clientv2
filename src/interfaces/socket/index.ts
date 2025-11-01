export interface IOverView {
  [key: number]: IOnMovement;
}

export interface IOnMovement extends IMovement {
  id: number;
  username: string;
}

export interface IMovement {
  position: Position;
  quaternion: Quaternion;
  action: string;
  itemsID: number[];
  avatarID: number;
  velocity: Position;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion extends Position {
  w: number;
}
