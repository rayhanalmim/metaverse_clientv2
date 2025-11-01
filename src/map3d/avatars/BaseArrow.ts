import BaseAvatar from './BaseAvatar';
import * as THREE from 'three';

export default class BaseArrow {
  mesh: THREE.Mesh;
  dir: THREE.Vector3;
  quat: THREE.Quaternion;
  avatar: BaseAvatar;
  rayCast: THREE.Raycaster;
  id: string;
  veloc: THREE.Vector3;
  collided: boolean;
  timeToDestroy: number;
  worldPos: THREE.Vector3 = new THREE.Vector3();
  worldQuat: THREE.Quaternion = new THREE.Quaternion();
  constructor(id: string, mesh: THREE.Mesh, dir: THREE.Vector3 = null, quat: THREE.Quaternion = null,avatar: BaseAvatar = null){
    this.id = id;
    this.mesh = mesh;
    this.dir = dir;
    this.quat = quat;
    this.avatar = avatar;
  }

  GetPosition(){
    return this.mesh.position;
  }
  GetWorldPos(){
    return this.mesh.getWorldPosition(this.worldPos);
  }
  GetQuaternion(){
    return this.mesh.quaternion;
  }
  GetWorldQuaternion(){
    return this.mesh.getWorldQuaternion(this.worldQuat);
  }
  GetSubObjectQuat(){
    return this.mesh.children[0].quaternion;
  }
}
